import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import File from "@/lib/database/models/web/scrappeddata.model";
import { uploadTextToCloudinary } from "@/lib/action/transaction.action";

// MongoDB connection
const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/websitescraper";

async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URL);
}

// alternatively, you can host the chromium-pack.tar file elsewhere and update the URL below
const CHROMIUM_PACK_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/chromium-pack.tar`
  : "/chromium-pack.tar";

// Cache the Chromium executable path to avoid re-downloading on subsequent requests
let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;

async function getChromiumPath(): Promise<string> {
  // Return cached path if available
  if (cachedExecutablePath) return cachedExecutablePath;

  // Prevent concurrent downloads by reusing the same promise
  if (!downloadPromise) {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    downloadPromise = chromium
      .executablePath(CHROMIUM_PACK_URL)
      .then((path) => {
        cachedExecutablePath = path;
        console.log("Chromium path resolved:", path);
        return path;
      })
      .catch((error) => {
        console.error("Failed to get Chromium path:", error);
        downloadPromise = null; // Reset on error to allow retry
        throw error;
      });
  }

  return downloadPromise;
}

/**
 * Function to remove emojis and unsupported characters for OpenAI compatibility
 */
function sanitizeForOpenAI(text: string): string {
  if (!text) return "";

  return (
    text
      // Remove emojis and special Unicode characters
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "") // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "") // Symbols & pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "") // Transport & map symbols
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "") // Flags
      .replace(/[\u{2700}-\u{27BF}]/gu, "") // Dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, "") // Supplemental symbols and pictographs
      // Remove other problematic characters
      .replace(/[^\x20-\x7E\n\t\r]/g, "") // Keep only printable ASCII + newline/tab/carriage return
      // Remove the Unicode replacement character (�)
      .replace(/�/g, "")
      // Remove any backslashes that might create invalid escape sequences
      .replace(/\\[^nrt"\\\/]/g, "") // Keep only valid escape sequences: \n, \r, \t, \", \\, \/
      // Clean up multiple spaces
      .replace(/\s+/g, " ")
      .trim()
  );
}

interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  content: string;
  level: number;
}

class WebScraper {
  private browser: any;
  private visitedUrls: Set<string> = new Set();
  private scrapedPages: ScrapedPage[] = [];
  private maxPages: number = 10;
  private maxLevel: number = 3;

  constructor(browser: any) {
    this.browser = browser;
  }

  private async scrapePage(
    url: string,
    level: number
  ): Promise<ScrapedPage | null> {
    if (
      this.visitedUrls.has(url) ||
      this.scrapedPages.length >= this.maxPages
    ) {
      return null;
    }

    this.visitedUrls.add(url);

    try {
      const page = await this.browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      const scrapedData = await page.evaluate(() => {
        const getMetaContent = (name: string) => {
          const meta =
            document.querySelector(`meta[name="${name}"]`) ||
            document.querySelector(`meta[property="og:${name}"]`) ||
            document.querySelector(`meta[name="twitter:${name}"]`);
          return meta ? meta.getAttribute("content") || "" : "";
        };

        const extractHeadings = () => {
          const headings: { [key: string]: string[] } = {
            h1: [],
            h2: [],
            h3: [],
          };
          ["h1", "h2", "h3"].forEach((tag) => {
            headings[tag] = Array.from(document.querySelectorAll(tag))
              .map((el) => el.textContent?.trim() || "")
              .filter((text) => text.length > 0);
          });
          return headings;
        };

        const extractContent = () => {
          // Get main content areas first
          const mainContent =
            document.querySelector("main") ||
            document.querySelector("article") ||
            document.querySelector(".content") ||
            document.querySelector("#content") ||
            document.body;

          let text = mainContent.innerText || mainContent.textContent || "";

          // Clean up the text
          text = text.replace(/\s+/g, " ").trim();

          // Limit to approximately 500 tokens (assuming average 4 characters per token)
          const maxLength = 1000; // ~500 tokens
          if (text.length > maxLength) {
            text = text.substring(0, maxLength) + "...";
          }

          return text;
        };

        const extractLinks = () => {
          return Array.from(document.querySelectorAll("a[href]"))
            .map((a) => (a as HTMLAnchorElement).href)
            .filter(
              (href) =>
                href &&
                !href.startsWith("javascript:") &&
                !href.startsWith("mailto:")
            );
        };

        return {
          url: window.location.href,
          title: document.title || "",
          description: getMetaContent("description"),
          headings: extractHeadings(),
          content: extractContent(),
          links: extractLinks(),
        };
      });

      await page.close();

      // Sanitize all text fields for OpenAI compatibility
      const pageData: ScrapedPage = {
        url: scrapedData.url,
        title: sanitizeForOpenAI(scrapedData.title),
        description: sanitizeForOpenAI(scrapedData.description),
        headings: {
          h1: scrapedData.headings.h1.map((heading: any) =>
            sanitizeForOpenAI(heading)
          ),
          h2: scrapedData.headings.h2.map((heading: any) =>
            sanitizeForOpenAI(heading)
          ),
          h3: scrapedData.headings.h3.map((heading: any) =>
            sanitizeForOpenAI(heading)
          ),
        },
        content: sanitizeForOpenAI(scrapedData.content),
        level: level,
      };

      this.scrapedPages.push(pageData);
      console.log(`Scraped page: ${url} (level ${level})`);

      // Return links for next level scraping
      return {
        ...pageData,
        links: scrapedData.links,
      } as any;
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
      return null;
    }
  }

  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.startsWith("www.") ? domain.substring(4) : domain;
    } catch {
      return url;
    }
  }

  private isSameDomain(url: string, baseDomain: string): boolean {
    try {
      const urlDomain = this.extractDomain(url);
      return urlDomain === baseDomain;
    } catch {
      return false;
    }
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname;
    } catch {
      return url;
    }
  }

  async scrapeWebsite(startUrl: string): Promise<ScrapedPage[]> {
    const baseDomain = this.extractDomain(startUrl);
    const queue: { url: string; level: number }[] = [
      { url: this.normalizeUrl(startUrl), level: 0 },
    ];

    while (queue.length > 0 && this.scrapedPages.length < this.maxPages) {
      const { url, level } = queue.shift()!;

      if (level > this.maxLevel) continue;

      const result = await this.scrapePage(url, level);

      if (result && "links" in result) {
        const typedResult = result as ScrapedPage & { links: string[] };

        // Add new links to queue for next level
        if (level < this.maxLevel) {
          for (const link of typedResult.links) {
            const normalizedLink = this.normalizeUrl(link);
            if (
              this.isSameDomain(link, baseDomain) &&
              !this.visitedUrls.has(normalizedLink) &&
              !queue.some((item) => item.url === normalizedLink)
            ) {
              queue.push({ url: normalizedLink, level: level + 1 });
            }
          }
        }
      }
    }

    return this.scrapedPages;
  }
}

/**
 * Format scraped data into object with URL as key and description as value
 */
function formatScrapedData(pages: ScrapedPage[]): string {
  const dataObject: { [key: string]: string } = {};

  pages.forEach((page) => {
    // Create description with title, meta description, and first heading
    let description = "";

    if (page.title) {
      description += `Title: ${page.title}. `;
    }

    if (page.description) {
      description += `Description: ${page.description}. `;
    }

    if (page.headings.h1.length > 0) {
      description += `Main Heading: ${page.headings.h1[0]}. `;
    }

    if (page.content) {
      // Add first 100 characters of content
      const contentPreview = page.content.substring(0, 100);
      description += `Content: ${contentPreview}${
        page.content.length > 100 ? "..." : ""
      }`;
    }

    // Final sanitization of the complete description
    description = sanitizeForOpenAI(description);

    // Limit description to ~500 tokens (2000 characters)
    if (description.length > 1000) {
      description = description.substring(0, 997) + "...";
    }

    dataObject[page.url] = description.trim();
  });

  return JSON.stringify(dataObject, null, 2);
}

/**
 * API endpoint to scrape website content with multiple levels
 * Usage: /api/scrape?url=https://example.com&userId=user123
 */
export async function GET(request: NextRequest) {
  await connectToDatabase();

  // Extract URL parameter from query string
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");
  const userId = searchParams.get("userId") || "anonymous";

  if (!urlParam) {
    return new NextResponse("Please provide a URL.", { status: 400 });
  }

  // Prepend http:// if missing
  let inputUrl = urlParam.trim();
  if (!/^https?:\/\//i.test(inputUrl)) {
    inputUrl = `http://${inputUrl}`;
  }

  // Validate the URL is a valid HTTP/HTTPS URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(inputUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return new NextResponse("URL must start with http:// or https://", {
        status: 400,
      });
    }
  } catch {
    return new NextResponse("Invalid URL provided.", { status: 400 });
  }

  let browser;
  try {
    // Configure browser based on environment
    const isVercel = !!process.env.VERCEL_ENV;
    let puppeteer: any,
      launchOptions: any = {
        headless: true,
      };

    if (isVercel) {
      // Vercel: Use puppeteer-core with downloaded Chromium binary
      const chromium = (await import("@sparticuz/chromium-min")).default;
      puppeteer = await import("puppeteer-core");
      const executablePath = await getChromiumPath();
      launchOptions = {
        ...launchOptions,
        args: chromium.args,
        executablePath,
      };
      console.log("Launching browser with executable path:", executablePath);
    } else {
      // Local: Use regular puppeteer with bundled Chromium
      puppeteer = await import("puppeteer");
    }

    // Launch browser and scrape website content
    browser = await puppeteer.launch(launchOptions);

    const scraper = new WebScraper(browser);
    const scrapedPages = await scraper.scrapeWebsite(parsedUrl.toString());

    if (scrapedPages.length === 0) {
      return new NextResponse(
        "No pages could be scraped from the provided URL.",
        {
          status: 400,
        }
      );
    }

    // Extract domain for filename
    const domain = new URL(parsedUrl.toString()).hostname.replace(/^www\./, "");
    const fileName = `${domain}_${Date.now()}`;

    // Format data as object with URL as key and description as value
    const formattedData = formatScrapedData(scrapedPages);

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadTextToCloudinary(formattedData, fileName);

    // Save to MongoDB with Cloudinary link
    const fileData = new File({
      fileName,
      userId,
      link: cloudinaryUrl,
      domain,
    });

    await fileData.save();

    // Return scraped data as JSON
    return NextResponse.json({
      success: true,
      data: {
        fileName,
        domain,
        totalPages: scrapedPages.length,
        maxLevel: Math.max(...scrapedPages.map((page) => page.level)),
        cloudinaryLink: cloudinaryUrl,
        pages: scrapedPages,
      },
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return new NextResponse("An error occurred while scraping the website.", {
      status: 500,
    });
  } finally {
    // Always clean up browser resources
    if (browser) {
      await browser.close();
    }
  }
}
