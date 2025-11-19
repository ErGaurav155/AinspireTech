import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionInfo } from "@/lib/action/subscription.action";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const maxDuration = 30;

// AWS S3 configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Dynamic import for puppeteer to avoid build issues
async function getPuppeteer() {
  if (process.env.NODE_ENV === "development") {
    // Development: Use local Chrome
    const { default: puppeteer } = await import("puppeteer-core");
    return {
      puppeteer,
      executablePath: getChromePath(),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    };
  } else {
    // Production: Use chrome-aws-lambda (Vercel compatible)
    const chrome = await import("chrome-aws-lambda");
    const { default: puppeteer } = await import("puppeteer-core");

    return {
      puppeteer,
      executablePath: await chrome.default.executablePath,
      args: chrome.default.args,
    };
  }
}

class TextContentScraper {
  private visitedUrls: Set<string> = new Set();
  private scrapedPages: any[] = [];
  private baseDomain: string = "";

  constructor(private maxPages: number = 10, private maxDepth: number = 2) {}

  async scrapeWebsiteContent(startUrl: string, userId: string) {
    let browser = null;

    try {
      const { puppeteer, executablePath, args } = await getPuppeteer();

      this.baseDomain = new URL(startUrl).hostname;

      console.log(`Starting content scraping from: ${startUrl}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Executable path: ${executablePath}`);

      // Launch browser with Vercel-compatible configuration
      browser = await puppeteer.launch({
        ignoreDefaultArgs: ["--disable-extensions"],
        args: args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath,
        headless: true,
      });

      // Start recursive scraping
      await this.scrapePageContent(browser, startUrl, 0);

      console.log(
        `Content scraping completed. Total pages: ${this.scrapedPages.length}`
      );

      // Generate comprehensive content report
      const contentReport = this.generateContentReport();

      // Store in S3
      // let s3Url = "";
      // if (process.env.S3_BUCKET_NAME) {
      //   const s3Key = `website-content/${userId}/${Date.now()}-website-content.json`;

      //   await s3.send(
      //     new PutObjectCommand({
      //       Bucket: process.env.S3_BUCKET_NAME!,
      //       Key: s3Key,
      //       Body: JSON.stringify(contentReport, null, 2),
      //       ContentType: "application/json",
      //     })
      //   );

      //   s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${
      //     process.env.AWS_REGION || "ap-south-1"
      //   }.amazonaws.com/${s3Key}`;
      // }

      return {
        success: true,
        // s3Url,
        data: contentReport,
      };
    } catch (error: any) {
      console.error("Content scraping failed:", error);
      return {
        success: false,
        error: `Content scraping failed: ${error.message}`,
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private async scrapePageContent(
    browser: any,
    url: string,
    depth: number
  ): Promise<void> {
    // Check limits
    if (
      depth > this.maxDepth ||
      this.scrapedPages.length >= this.maxPages ||
      this.visitedUrls.has(url)
    ) {
      return;
    }

    this.visitedUrls.add(url);
    console.log(
      `Scraping content: ${url} (depth: ${depth}, pages: ${
        this.scrapedPages.length + 1
      })`
    );

    const page = await browser.newPage();

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Set longer timeout for Vercel
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
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
            .filter((text) => text.length > 20 && text.length < 2000)
            .slice(0, 30);
          return allParagraphs;
        };

        const extractKeyPoints = () => {
          const keyPoints: string[] = [];

          // Extract list items
          const listItems = Array.from(document.querySelectorAll("li"))
            .map((li) => li.textContent?.trim() || "")
            .filter((text) => text.length > 10 && text.length < 200);

          return [...new Set(listItems)].slice(0, 10);
        };

        return {
          url: window.location.href,
          title: document.title || "",
          description: getMetaContent("description"),
          mainHeading: document.querySelector("h1")?.textContent?.trim() || "",
          headings: extractHeadings(),
          paragraphs: extractParagraphs(),
          keyPoints: extractKeyPoints(),
          mainContent:
            document.body.textContent?.substring(0, 3000).trim() || "",
        };
      });

      const scrapedPage = {
        ...pageContent,
        status: "success",
        depth,
      };

      this.scrapedPages.push(scrapedPage);

      // Extract internal links for further crawling (simplified for Vercel)
      if (depth < this.maxDepth) {
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
                  !absoluteUrl.includes("javascript:")
                ) {
                  internalLinks.push(absoluteUrl);
                }
              } catch (e) {
                // Skip invalid URLs
              }
            }
          });

          return [...new Set(internalLinks)].slice(0, 10); // Limit links for Vercel
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
      console.error(`Failed to scrape content from ${url}:`, error.message);

      this.scrapedPages.push({
        url,
        title: "",
        description: "",
        mainHeading: "",
        headings: {},
        paragraphs: [],
        keyPoints: [],
        mainContent: "",
        status: "failed",
        error: error.message,
        depth,
      });
    } finally {
      await page.close();
    }
  }

  private generateContentReport() {
    const successfulPages = this.scrapedPages.filter(
      (page: any) => page.status === "success"
    );

    return {
      scrapingInfo: {
        scrapedAt: new Date().toISOString(),
        baseDomain: this.baseDomain,
        totalPagesScraped: this.scrapedPages.length,
        successfulPages: successfulPages.length,
        failedPages: this.scrapedPages.filter((p: any) => p.status === "failed")
          .length,
        maxPages: this.maxPages,
        maxDepth: this.maxDepth,
        environment: process.env.NODE_ENV,
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
        totalKeyPoints: successfulPages.reduce(
          (sum: number, page: any) => sum + page.keyPoints.length,
          0
        ),
        totalContentSnippets: successfulPages.reduce(
          (sum: number, page: any) =>
            sum +
            page.paragraphs.length +
            Object.values(page.headings).flat().length +
            page.keyPoints.length,
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
          keyPoints: page.keyPoints,
          mainContent:
            page.mainContent.substring(0, 1000) +
            (page.mainContent.length > 1000 ? "..." : ""),
        },
        contentMetrics: {
          paragraphCount: page.paragraphs.length,
          headingCount: Object.values(page.headings).flat().length,
          keyPointsCount: page.keyPoints.length,
          totalContentLength: page.mainContent.length,
        },
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
      .slice(0, 8)
      .map(([word]) => word);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, userId, maxPages = 5, maxDepth = 2 } = await request.json();

    if (!url || !userId) {
      return NextResponse.json(
        { success: false, error: "URL and userId are required" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
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

    console.log(`Starting website content scraping for: ${url}`);

    const scraper = new TextContentScraper(maxPages, maxDepth);
    const result = await scraper.scrapeWebsiteContent(url, userId);
    console.log("Scraping result:", result);
    if (result.success) {
      return NextResponse.json({
        success: true,
        // s3Url: result.s3Url,
        data: result.data,
        message: `Successfully extracted content from ${result?.data?.scrapingInfo.totalPagesScraped} pages`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Content scraping process failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
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
