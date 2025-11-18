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

// Dynamic import for puppeteer
async function getPuppeteer() {
  const { default: chromium } = await import("@sparticuz/chromium-min");
  const { default: puppeteer } = await import("puppeteer-core");
  return { chromium, puppeteer };
}

interface PageContent {
  url: string;
  title: string;
  description: string;
  mainHeading: string;
  headings: { [key: string]: string[] };
  paragraphs: string[];
  mainContent: string;
  keyPoints: string[];
  features?: string[];
  benefits?: string[];
  status: "success" | "failed";
  error?: string;
  depth: number;
}

class TextContentScraper {
  private visitedUrls: Set<string> = new Set();
  private scrapedPages: PageContent[] = [];
  private baseDomain: string = "";

  constructor(private maxPages: number = 20, private maxDepth: number = 3) {}

  async scrapeWebsiteContent(startUrl: string, userId: string) {
    const { chromium, puppeteer } = await getPuppeteer();
    const isDev = process.env.NODE_ENV === "development";

    let browser = null;

    try {
      // Launch browser
      const executablePath = isDev
        ? getChromePath()
        : await chromium.executablePath();
      browser = await puppeteer.launch({
        args: isDev
          ? [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
            ]
          : chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath,
        headless: true,
      });

      this.baseDomain = new URL(startUrl).hostname;

      console.log(`Starting text content scraping from: ${startUrl}`);

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
    console.log(`Scraping content: ${url} (depth: ${depth})`);

    const page = await browser.newPage();

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });

      await page.waitForSelector("body", { timeout: 5000 });

      // Extract comprehensive text content
      const pageContent = await page.evaluate(() => {
        // Helper functions
        const getMetaContent = (name: string) => {
          const meta =
            document.querySelector(`meta[name="${name}"]`) ||
            document.querySelector(`meta[property="og:${name}"]`);
          return meta ? meta.getAttribute("content") || "" : "";
        };

        // Extract all headings with hierarchy
        const extractHeadings = () => {
          const headings: { [key: string]: string[] } = {};
          ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
            headings[tag] = Array.from(document.querySelectorAll(tag))
              .map((el) => el.textContent?.trim() || "")
              .filter((text) => text.length > 0 && text.length < 500); // Filter out very long headings
          });
          return headings;
        };

        // Extract meaningful paragraphs (exclude navigation, footer text)
        const extractParagraphs = () => {
          const allParagraphs = Array.from(document.querySelectorAll("p"))
            .map((p) => p.textContent?.trim() || "")
            .filter((text) => {
              // Filter out short, navigation-like text
              return (
                text.length > 20 &&
                text.length < 2000 &&
                !text.includes("©") &&
                !text.includes("Copyright") &&
                !text.match(/^[0-9\s\-()+]+$/)
              ); // Exclude phone numbers
            })
            .slice(0, 30); // Limit to first 30 meaningful paragraphs

          return allParagraphs;
        };

        // Extract main content areas (main, article, section with substantial text)
        const extractMainContent = () => {
          const contentSelectors = [
            "main",
            "article",
            ".content",
            ".main-content",
            ".post-content",
            ".entry-content",
            '[role="main"]',
            "section",
          ];

          let mainContent = "";
          for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (
              element &&
              element.textContent &&
              element.textContent.length > 200
            ) {
              mainContent = element.textContent.trim();
              break;
            }
          }

          // If no main content area found, use body but clean it up
          if (!mainContent) {
            const body = document.body.cloneNode(true) as HTMLElement;
            // Remove common non-content elements
            const elementsToRemove = body.querySelectorAll(
              "nav, header, footer, script, style, aside, .nav, .header, .footer, .sidebar"
            );
            elementsToRemove.forEach((el) => el.remove());
            mainContent = body.textContent?.trim() || "";
          }

          return mainContent.substring(0, 5000); // Limit content size
        };

        // Extract key points (lists, highlighted text)
        const extractKeyPoints = () => {
          const keyPoints: string[] = [];

          // Extract list items
          const listItems = Array.from(document.querySelectorAll("li"))
            .map((li) => li.textContent?.trim() || "")
            .filter((text) => text.length > 10 && text.length < 200);

          // Extract strong/emphasized text that might be key points
          const emphasizedText = Array.from(
            document.querySelectorAll("strong, b, em, .highlight")
          )
            .map((el) => el.textContent?.trim() || "")
            .filter((text) => text.length > 10 && text.length < 150);

          return [...new Set([...listItems, ...emphasizedText])].slice(0, 20);
        };

        // Extract features and benefits (common in service websites)
        const extractFeaturesAndBenefits = () => {
          const features: string[] = [];
          const benefits: string[] = [];

          // Look for common feature/benefit patterns
          const allText = document.body.textContent || "";
          const sentences = allText
            .split(/[.!?]+/)
            .filter((s) => s.length > 20);

          sentences.forEach((sentence) => {
            const cleanSentence = sentence.trim();
            if (
              cleanSentence.match(
                /(feature|includes|offers|provides|comes with)/i
              )
            ) {
              features.push(cleanSentence);
            } else if (
              cleanSentence.match(
                /(benefit|advantage|helps|saves|improves|increases)/i
              )
            ) {
              benefits.push(cleanSentence);
            }
          });

          return {
            features: features.slice(0, 10),
            benefits: benefits.slice(0, 10),
          };
        };

        // Get main heading (usually h1)
        const mainHeading =
          document.querySelector("h1")?.textContent?.trim() || "";

        const { features, benefits } = extractFeaturesAndBenefits();

        return {
          url: window.location.href,
          title: document.title || "",
          description: getMetaContent("description"),
          mainHeading,
          headings: extractHeadings(),
          paragraphs: extractParagraphs(),
          mainContent: extractMainContent(),
          keyPoints: extractKeyPoints(),
          features,
          benefits,
        };
      });

      const scrapedPage: PageContent = {
        ...pageContent,
        status: "success",
        depth,
      };

      this.scrapedPages.push(scrapedPage);

      // Extract internal links for further crawling
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
                !absoluteUrl.match(
                  /\.(pdf|doc|docx|xls|xlsx|zip|rar|jpg|jpeg|png|gif)$/i
                )
              ) {
                internalLinks.push(absoluteUrl);
              }
            } catch (e) {
              // Skip invalid URLs
            }
          }
        });

        return [...new Set(internalLinks)];
      }, this.baseDomain);

      // Recursively scrape discovered links
      if (depth < this.maxDepth) {
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
        mainContent: "",
        keyPoints: [],
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
      (page) => page.status === "success"
    );

    // Calculate content statistics
    const totalPages = this.scrapedPages.length;
    const totalParagraphs = successfulPages.reduce(
      (sum, page) => sum + page.paragraphs.length,
      0
    );
    const totalHeadings = successfulPages.reduce(
      (sum, page) => sum + Object.values(page.headings).flat().length,
      0
    );
    const totalKeyPoints = successfulPages.reduce(
      (sum, page) => sum + page.keyPoints.length,
      0
    );
    const totalFeatures = successfulPages.reduce(
      (sum, page) => sum + (page.features?.length || 0),
      0
    );
    const totalBenefits = successfulPages.reduce(
      (sum, page) => sum + (page.benefits?.length || 0),
      0
    );

    // Generate comprehensive content summary
    const allContent = successfulPages
      .flatMap((page) => [
        ...page.paragraphs,
        ...Object.values(page.headings).flat(),
        ...page.keyPoints,
        ...(page.features || []),
        ...(page.benefits || []),
      ])
      .filter((text) => text.length > 0);

    return {
      // Scraping metadata
      scrapingInfo: {
        scrapedAt: new Date().toISOString(),
        baseDomain: this.baseDomain,
        totalPagesScraped: totalPages,
        successfulPages: successfulPages.length,
        failedPages: this.scrapedPages.filter((p) => p.status === "failed")
          .length,
        maxPages: this.maxPages,
        maxDepth: this.maxDepth,
      },

      // Content statistics
      contentStatistics: {
        totalParagraphs,
        totalHeadings,
        totalKeyPoints,
        totalFeatures,
        totalBenefits,
        totalContentSnippets: allContent.length,
        averageParagraphsPerPage:
          Math.round(totalParagraphs / successfulPages.length) || 0,
      },

      // Detailed page content
      pages: successfulPages.map((page) => ({
        url: page.url,
        pageInfo: {
          title: page.title,
          description: page.description,
          mainHeading: page.mainHeading,
          depth: page.depth,
        },
        content: {
          // Main headings structure
          headings: page.headings,

          // Main content paragraphs
          paragraphs: page.paragraphs,

          // Key points and highlights
          keyPoints: page.keyPoints,

          // Features and benefits
          features: page.features || [],
          benefits: page.benefits || [],

          // Full main content (truncated for display)
          mainContent:
            page.mainContent.substring(0, 1000) +
            (page.mainContent.length > 1000 ? "..." : ""),
        },
        contentMetrics: {
          paragraphCount: page.paragraphs.length,
          headingCount: Object.values(page.headings).flat().length,
          keyPointsCount: page.keyPoints.length,
          featuresCount: page.features?.length || 0,
          benefitsCount: page.benefits?.length || 0,
          totalContentLength: page.mainContent.length,
        },
      })),

      // Website content summary
      websiteSummary: {
        mainTopics: this.extractMainTopics(successfulPages),
        keyServices: this.extractServices(successfulPages),
        contentOverview: this.generateContentOverview(successfulPages),
      },
    };
  }

  private extractMainTopics(pages: PageContent[]): string[] {
    const allHeadings = pages.flatMap((page) =>
      Object.values(page.headings).flat()
    );
    const commonWords = new Map<string, number>();

    allHeadings.forEach((heading) => {
      const words = heading.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        if (
          word.length > 3 &&
          !["this", "that", "with", "from", "your", "have"].includes(word)
        ) {
          commonWords.set(word, (commonWords.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(commonWords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private extractServices(pages: PageContent[]): string[] {
    const services: string[] = [];

    pages.forEach((page) => {
      // Look for service-related content in headings and key points
      const serviceIndicators = [
        ...Object.values(page.headings).flat(),
        ...page.keyPoints,
        ...page.paragraphs,
      ];

      serviceIndicators.forEach((text) => {
        if (
          text.match(/(generator|tool|service|feature|create|build|make)/i) &&
          text.length < 100
        ) {
          services.push(text);
        }
      });
    });

    return [...new Set(services)].slice(0, 15);
  }

  private generateContentOverview(pages: PageContent[]): any {
    const overview = {
      totalContentWords: pages.reduce((sum, page) => {
        return sum + page.mainContent.split(/\s+/).length;
      }, 0),
      uniquePages: pages.length,
      contentDensity: "high", // You can calculate this based on content length vs page count
    };

    return overview;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, userId, maxPages = 10, maxDepth = 2 } = await request.json();

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

    console.log(`Starting comprehensive content scraping for: ${url}`);

    const scraper = new TextContentScraper(maxPages, maxDepth);
    const result = await scraper.scrapeWebsiteContent(url, userId);
    console.log("Scraping result:", result.data);
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
