import { getSubscriptionInfo } from "@/lib/action/subscription.action";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

class TextContentScraper {
  private visitedUrls: Set<string> = new Set();
  private scrapedPages: any[] = [];
  private baseDomain: string = "";

  constructor(private maxPages: number = 3, private maxDepth: number = 1) {}

  async scrapeWebsiteContent(startUrl: string, userId: string) {
    let browser = null;

    try {
      const isVercel = !!process.env.VERCEL;
      let puppeteer: any;
      let launchOptions: any = {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--single-process",
          "--no-zygote",
        ],
      };

      console.log(`🌐 Starting content scraping from: ${startUrl}`);
      console.log(`🏷️ Environment: ${process.env.NODE_ENV}`);
      console.log(`🚀 Vercel: ${isVercel}`);

      if (isVercel) {
        // Vercel production - use @sparticuz/chromium-min with simplified setup
        const chromium = (await import("@sparticuz/chromium-min")).default;
        puppeteer = await import("puppeteer-core");

        console.log("🚀 Using @sparticuz/chromium-min for production...");

        try {
          // Use the default executable path without custom tar files
          const executablePath = await chromium.executablePath();
          console.log("✅ Chromium executable path:", executablePath);

          launchOptions = {
            ...launchOptions,
            args: chromium.args,
            executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
          };
        } catch (chromiumError) {
          console.error("❌ Chromium setup failed:", chromiumError);
          throw new Error(`Chromium initialization failed: ${chromiumError}`);
        }
      } else {
        // Local development - use regular puppeteer with system Chrome
        console.log("💻 Using local Chrome for development...");
        puppeteer = await import("puppeteer");
        launchOptions.executablePath = getChromePath();
        console.log("🔧 Using local Chrome:", launchOptions.executablePath);
      }

      this.baseDomain = new URL(startUrl).hostname;

      // Launch browser with timeout
      console.log("🔄 Launching browser...");
      browser = await puppeteer.launch(launchOptions);
      console.log("✅ Browser launched successfully");

      // Start recursive scraping
      await this.scrapePageContent(browser, startUrl, 0);

      console.log(
        `✅ Content scraping completed. Total pages: ${this.scrapedPages.length}`
      );

      // Generate comprehensive content report
      const contentReport = this.generateContentReport();
      console.log("📊 Scrape metadata generated");

      return {
        success: true,
        data: contentReport,
      };
    } catch (error: any) {
      console.error("❌ Content scraping failed:", error);
      return {
        success: false,
        error: `Content scraping failed: ${error.message}`,
      };
    } finally {
      if (browser) {
        try {
          await browser.close();
          console.log("🔚 Browser closed");
        } catch (closeError) {
          console.error("❌ Error closing browser:", closeError);
        }
      }
    }
  }

  private async scrapePageContent(
    browser: any,
    url: string,
    depth: number
  ): Promise<void> {
    if (
      depth > this.maxDepth ||
      this.scrapedPages.length >= this.maxPages ||
      this.visitedUrls.has(url)
    ) {
      return;
    }

    this.visitedUrls.add(url);
    console.log(
      `📄 Scraping content: ${url} (depth: ${depth}, pages: ${
        this.scrapedPages.length + 1
      })`
    );

    const page = await browser.newPage();

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Set longer timeouts for Vercel
      await page.setDefaultNavigationTimeout(30000);
      await page.setDefaultTimeout(30000);

      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      await page.waitForSelector("body", { timeout: 10000 });

      // Extract comprehensive text content
      const pageContent = await page.evaluate(() => {
        const getMetaContent = (name: string) => {
          const meta =
            document.querySelector(`meta[name="${name}"]`) ||
            document.querySelector(`meta[property="og:${name}"]`);
          return meta ? meta.getAttribute("content") || "" : "";
        };

        const extractHeadings = () => {
          const headings: { [key: string]: string[] } = {};
          ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
            headings[tag] = Array.from(document.querySelectorAll(tag))
              .map((el) => el.textContent?.trim() || "")
              .filter((text) => text.length > 0 && text.length < 500);
          });
          return headings;
        };

        const extractParagraphs = () => {
          const allParagraphs = Array.from(document.querySelectorAll("p"))
            .map((p) => p.textContent?.trim() || "")
            .filter((text) => text.length > 20 && text.length < 1000)
            .slice(0, 10); // Reduced for Vercel
          return allParagraphs;
        };

        const extractImages = () => {
          return Array.from(document.querySelectorAll("img"))
            .map((img) => ({
              src: img.src || "",
              alt: img.alt || "",
            }))
            .slice(0, 5); // Reduced for Vercel
        };

        return {
          url: window.location.href,
          title: document.title || "",
          description: getMetaContent("description"),
          mainHeading: document.querySelector("h1")?.textContent?.trim() || "",
          headings: extractHeadings(),
          paragraphs: extractParagraphs(),
          images: extractImages(),
          mainContent:
            document.body.textContent?.substring(0, 1000).trim() || "", // Reduced for Vercel
        };
      });

      const scrapedPage = {
        ...pageContent,
        status: "success",
        depth,
      };

      this.scrapedPages.push(scrapedPage);

      // Extract internal links for further crawling (simplified for Vercel)
      if (depth < this.maxDepth && this.scrapedPages.length < this.maxPages) {
        const internalLinks = await page.evaluate((baseDomain: string) => {
          const allLinks = Array.from(document.querySelectorAll("a[href]"));
          const internalLinks: string[] = [];

          allLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (href) {
              try {
                const absoluteUrl = new URL(href, window.location.origin).href;
                const linkDomain = new URL(absoluteUrl).hostname;

                if (
                  linkDomain === baseDomain &&
                  !absoluteUrl.includes("#") &&
                  !absoluteUrl.includes("mailto:") &&
                  !absoluteUrl.includes("tel:") &&
                  !absoluteUrl.includes("javascript:") &&
                  absoluteUrl.startsWith("http")
                ) {
                  internalLinks.push(absoluteUrl);
                }
              } catch (e) {
                // Skip invalid URLs
              }
            }
          });

          return [...new Set(internalLinks)].slice(0, 2); // Further reduced for Vercel
        }, this.baseDomain);

        // Recursively scrape discovered links
        for (const link of internalLinks) {
          if (this.scrapedPages.length >= this.maxPages) break;
          if (!this.visitedUrls.has(link)) {
            await this.scrapePageContent(browser, link, depth + 1);
          }
        }
      }
    } catch (error: any) {
      console.error(`❌ Failed to scrape content from ${url}:`, error.message);

      this.scrapedPages.push({
        url,
        title: "",
        description: "",
        mainHeading: "",
        headings: {},
        paragraphs: [],
        images: [],
        mainContent: "",
        status: "failed",
        error: error.message,
        depth,
      });
    } finally {
      try {
        await page.close();
      } catch (closeError) {
        console.error("Error closing page:", closeError);
      }
    }
  }

  private generateContentReport() {
    const successfulPages = this.scrapedPages.filter(
      (page: any) => page.status === "success"
    );

    const failedPages = this.scrapedPages.filter(
      (page: any) => page.status === "failed"
    );

    return {
      scrapingInfo: {
        scrapedAt: new Date().toISOString(),
        baseDomain: this.baseDomain,
        totalPagesScraped: this.scrapedPages.length,
        successfulPages: successfulPages.length,
        failedPages: failedPages.length,
        maxPages: this.maxPages,
        maxDepth: this.maxDepth,
        environment: process.env.NODE_ENV || "development",
      },
      contentStatistics: {
        totalParagraphs: successfulPages.reduce(
          (sum: number, page: any) => sum + page.paragraphs.length,
          0
        ),
        totalHeadings: successfulPages.reduce(
          (sum: number, page: any) =>
            sum + Object.values(page.headings).flat().length,
          0
        ),
        totalImages: successfulPages.reduce(
          (sum: number, page: any) => sum + (page.images?.length || 0),
          0
        ),
        totalContentSnippets: successfulPages.reduce(
          (sum: number, page: any) =>
            sum +
            page.paragraphs.length +
            Object.values(page.headings).flat().length,
          0
        ),
      },
      pages: successfulPages.map((page: any) => ({
        url: page.url,
        pageInfo: {
          title: page.title,
          description: page.description,
          mainHeading: page.mainHeading,
          depth: page.depth,
        },
        content: {
          headings: page.headings,
          paragraphs: page.paragraphs,
          images: page.images || [],
          mainContent:
            page.mainContent.substring(0, 500) +
            (page.mainContent.length > 500 ? "..." : ""),
        },
        contentMetrics: {
          paragraphCount: page.paragraphs.length,
          headingCount: Object.values(page.headings).flat().length,
          imageCount: page.images?.length || 0,
          totalContentLength: page.mainContent.length,
        },
      })),
      failedPages: failedPages.map((page: any) => ({
        url: page.url,
        error: page.error,
        depth: page.depth,
      })),
      websiteSummary: {
        mainTopics: this.extractMainTopics(successfulPages),
        totalPages: successfulPages.length,
      },
    };
  }

  private extractMainTopics(pages: any[]): string[] {
    const allHeadings = pages.flatMap((page: any) =>
      Object.values(page.headings).flat()
    );
    const commonWords = new Map<string, number>();

    allHeadings.forEach((heading: any) => {
      const words = heading.toLowerCase().split(/\s+/);
      words.forEach((word: any) => {
        if (word.length > 3) {
          commonWords.set(word, (commonWords.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(commonWords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
}

// Helper function to get Chrome path for local development
function getChromePath(): string {
  const platform = process.platform;

  if (platform === "win32") {
    return (
      process.env.CHROME_EXECUTABLE_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    );
  } else if (platform === "darwin") {
    return (
      process.env.CHROME_EXECUTABLE_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    );
  } else {
    return process.env.CHROME_EXECUTABLE_PATH || "/usr/bin/google-chrome";
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, userId, maxPages = 2, maxDepth = 1 } = await request.json(); // Reduced limits for Vercel

    if (!url || !userId) {
      return NextResponse.json(
        { success: false, error: "URL and userId are required" },
        { status: 400 }
      );
    }

    // Validate URL
    let validatedUrl = url;
    try {
      if (!/^https?:\/\//i.test(url)) {
        validatedUrl = `https://${url}`;
      }
      new URL(validatedUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Check subscription
    const subscriptions = await getSubscriptionInfo(userId);
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid or inactive subscription" },
        { status: 402 }
      );
    }

    console.log(`🚀 Starting website content scraping for: ${validatedUrl}`);
    console.log(`👤 User: ${userId}`);
    console.log(`⚙️ Settings: maxPages=${maxPages}, maxDepth=${maxDepth}`);

    const scraper = new TextContentScraper(maxPages, maxDepth);
    const result = await scraper.scrapeWebsiteContent(validatedUrl, userId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: `Successfully extracted content from ${result.data?.scrapingInfo.totalPagesScraped} pages (${result.data?.scrapingInfo.successfulPages} successful, ${result.data?.scrapingInfo.failedPages} failed)`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ Content scraping process failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

// Chromium status check endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkChromium = searchParams.get("checkChromium");

    if (checkChromium) {
      try {
        const chromium = (await import("@sparticuz/chromium-min")).default;
        const executablePath = await chromium.executablePath();

        return NextResponse.json({
          success: true,
          chromium: {
            path: executablePath,
            status: "ready",
            source: "auto-download",
          },
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          chromium: {
            status: "error",
            error: error.message,
            source: "auto-download",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Scraping API is running",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
