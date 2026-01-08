import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import WebChatbot from "@/lib/database/models/web/WebChatbot.model";

// alternatively, you can host the chromium-pack.tar file elsewhere and update the URL below
const CHROMIUM_PACK_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/chromium-pack.tar`
  : "/chromium-pack.tar";

// Cache the Chromium executable path to avoid re-downloading on subsequent requests
let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;

async function getChromiumPath(): Promise<string> {
  if (cachedExecutablePath) return cachedExecutablePath;

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
        downloadPromise = null;
        throw error;
      });
  }

  return downloadPromise;
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
  private maxPages: number = 6;
  private maxLevel: number = 3;

  constructor(browser: any) {
    this.browser = browser;
  }

  private async scrapePage(
    url: string,
    level: number
  ): Promise<ScrapedPage | null> {
    if (this.visitedUrls.has(url)) {
      return null;
    }

    this.visitedUrls.add(url);

    try {
      const page = await this.browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      await page.goto(url, {
        waitUntil: "load",
        timeout: 30000,
      });

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
          const mainContent =
            document.querySelector("main") ||
            document.querySelector("article") ||
            document.querySelector(".content") ||
            document.querySelector("#content") ||
            document.querySelector('[role="main"]') ||
            document.body;

          let text = mainContent.innerText || mainContent.textContent || "";

          text = text.replace(/\s+/g, " ").trim();

          const maxLength = 800;
          if (text.length > maxLength) {
            text = text.substring(0, maxLength) + "...";
          }

          return text;
        };

        return {
          url: window.location.href,
          title: document.title || "",
          description: getMetaContent("description"),
          headings: extractHeadings(),
          content: extractContent(),
        };
      });

      await page.close();

      const pageData: ScrapedPage = {
        url: scrapedData.url,
        title: scrapedData.title,
        description: scrapedData.description,
        headings: scrapedData.headings,
        content: scrapedData.content,
        level: level,
      };

      console.log(`✅ Scraped page: ${url} (level ${level}) `);
      return pageData;
    } catch (error) {
      console.error(`❌ Failed to scrape ${url}:`, error);
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

  private async discoverAllUrls(
    startUrl: string
  ): Promise<{ url: string; level: number }[]> {
    const baseDomain = this.extractDomain(startUrl);

    const levelUrls: { [key: number]: { url: string; level: number }[] } = {
      0: [{ url: this.normalizeUrl(startUrl), level: 0 }],
      1: [],
      2: [],
      3: [],
    };

    const discoveredUrls = new Set<string>([this.normalizeUrl(startUrl)]);

    let currentLevel = 0;

    while (currentLevel <= this.maxLevel) {
      const currentLevelUrls = levelUrls[currentLevel];

      if (currentLevelUrls.length === 0) {
        console.log(
          `⏹️ No URLs found at level ${currentLevel}, stopping discovery`
        );
        break;
      }

      console.log(
        `🔍 Level ${currentLevel}: Processing ${currentLevelUrls.length} pages`
      );

      const discoveryPromises = currentLevelUrls.map(({ url }) =>
        this.scrapePageForDiscovery(url)
      );
      const discoveryResults = await Promise.allSettled(discoveryPromises);

      let newUrlsCount = 0;

      for (const result of discoveryResults) {
        if (result.status === "fulfilled" && result.value) {
          const { links } = result.value;

          if (links && links.length > 0 && currentLevel < this.maxLevel) {
            for (const link of links) {
              const normalizedLink = this.normalizeUrl(link);

              if (
                this.isSameDomain(link, baseDomain) &&
                !discoveredUrls.has(normalizedLink) &&
                Object.values(levelUrls).flat().length + newUrlsCount <
                  this.maxPages
              ) {
                discoveredUrls.add(normalizedLink);
                levelUrls[currentLevel + 1].push({
                  url: normalizedLink,
                  level: currentLevel + 1,
                });
                newUrlsCount++;

                if (Object.values(levelUrls).flat().length >= this.maxPages) {
                  break;
                }
              }
            }
          }
        }

        if (Object.values(levelUrls).flat().length >= this.maxPages) {
          break;
        }
      }

      console.log(
        `🔗 Level ${currentLevel + 1}: Discovered ${newUrlsCount} new URLs`
      );

      currentLevel++;

      if (
        Object.values(levelUrls).flat().length >= this.maxPages ||
        currentLevel > this.maxLevel
      ) {
        break;
      }
    }

    const allUrls = Object.values(levelUrls).flat().slice(0, this.maxPages);

    console.log(`🎯 Total URLs discovered: ${allUrls.length}`);

    console.log("📋 Discovered URLs by level:");
    for (let level = 0; level <= this.maxLevel; level++) {
      const levelUrlsList = allUrls.filter((item) => item.level === level);
      if (levelUrlsList.length > 0) {
        console.log(`   Level ${level}: ${levelUrlsList.length} URLs`);
        levelUrlsList.forEach((url) => console.log(`     - ${url.url}`));
      }
    }

    return allUrls;
  }

  private async scrapePageForDiscovery(
    url: string
  ): Promise<{ url: string; links: string[] } | null> {
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      await page.goto(url, {
        waitUntil: "load",
        timeout: 20000,
      });

      const scrapedData = await page.evaluate(() => {
        const extractLinks = () => {
          return Array.from(document.querySelectorAll("a[href]"))
            .map((a) => (a as HTMLAnchorElement).href)
            .filter(
              (href) =>
                href &&
                !href.startsWith("javascript:") &&
                !href.startsWith("mailto:") &&
                !href.startsWith("#") &&
                !href.includes("tel:") &&
                !href.includes("sms:")
            );
        };

        return {
          url: window.location.href,
          links: extractLinks(),
        };
      });

      await page.close();
      console.log(
        `🔍 Discovery: ${url} - found ${scrapedData.links.length} links`
      );
      return scrapedData;
    } catch (error) {
      console.error(`❌ Failed to discover links from ${url}:`, error);
      return null;
    }
  }

  async scrapeWebsite(startUrl: string): Promise<ScrapedPage[]> {
    console.log("🚀 Starting level-by-level concurrent scraping process...");

    const allUrlsToScrape = await this.discoverAllUrls(startUrl);
    console.log(`🎯 Will scrape ${allUrlsToScrape.length} URLs concurrently`);

    this.visitedUrls.clear();

    const scrapePromises = allUrlsToScrape.map(({ url, level }) =>
      this.scrapePage(url, level)
    );

    console.log("🔄 Starting concurrent scraping of all pages...");
    const scrapeResults = await Promise.allSettled(scrapePromises);

    const successfulScrapes: ScrapedPage[] = [];
    for (const result of scrapeResults) {
      if (result.status === "fulfilled" && result.value) {
        successfulScrapes.push(result.value);
      } else if (result.status === "rejected") {
        console.error("❌ Page scraping failed:", result.reason);
      }
    }

    this.scrapedPages = successfulScrapes;

    console.log(
      `🎉 Scraping completed: ${this.scrapedPages.length} pages successfully scraped`
    );

    console.log("✅ Successfully scraped URLs by level:");
    for (let level = 0; level <= this.maxLevel; level++) {
      const levelPages = this.scrapedPages.filter(
        (page) => page.level === level
      );
      if (levelPages.length > 0) {
        console.log(`   Level ${level}: ${levelPages.length} pages`);
        levelPages.forEach((page) =>
          console.log(`     - ${page.url} (${page.title})`)
        );
      }
    }

    return this.scrapedPages;
  }
}

export async function GET(request: NextRequest) {
  console.log("🚀 Scraping API called");

  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");
  const userId = searchParams.get("userId");
  const chatbotId = searchParams.get("chatbotId");

  if (!urlParam || !userId || !chatbotId) {
    return NextResponse.json(
      { error: "Please provide all required inputs." },
      { status: 400 }
    );
  }

  console.log("urlParam:", urlParam);
  console.log("userId:", userId);
  console.log("chatbotId:", chatbotId);

  await connectToDatabase();

  const chatbot = await WebChatbot.findOne({
    _id: chatbotId,
    clerkId: userId,
  });

  if (!chatbot) {
    return NextResponse.json(
      { error: "Chatbot not found or unauthorized" },
      { status: 404 }
    );
  }

  if (chatbot.isScrapped) {
    return NextResponse.json({
      success: true,
      data: {
        fileName: chatbot.scrappedFile || "",
        domain: new URL(chatbot.websiteUrl).hostname,
        userId,
        chatbotId,
        totalPages: 0,
        maxLevel: 0,
        scrapedPages: [],
      },
      message: "Website already scraped, skipping process",
      alreadyScrapped: true,
    });
  }

  let inputUrl = urlParam.trim();
  if (!/^https?:\/\//i.test(inputUrl)) {
    inputUrl = `http://${inputUrl}`;
  }

  let parsedUrl: URL;
  let mainUrl;
  let domain;
  try {
    parsedUrl = new URL(inputUrl);
    domain = parsedUrl.hostname;
    domain = domain.startsWith("www.") ? domain.substring(4) : domain;
    mainUrl = `${parsedUrl.protocol}//${domain}`;
  } catch {
    return NextResponse.json(
      { error: "Invalid URL provided." },
      { status: 400 }
    );
  }

  let browser;
  try {
    const isVercel = !!process.env.VERCEL_ENV;
    let puppeteer: any,
      launchOptions: any = {
        headless: true,
      };

    if (isVercel) {
      const chromium = (await import("@sparticuz/chromium-min")).default;
      puppeteer = await import("puppeteer-core");
      const executablePath = await getChromiumPath();
      launchOptions = {
        ...launchOptions,
        args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
        executablePath,
      };
      console.log("🔧 Launching browser with Chromium on Vercel");
    } else {
      puppeteer = await import("puppeteer");
      launchOptions.args = ["--no-sandbox", "--disable-setuid-sandbox"];
      console.log("🔧 Launching browser with local Puppeteer");
    }

    console.log("🚀 Launching browser...");
    browser = await puppeteer.launch(launchOptions);
    console.log("✅ Browser launched successfully");

    let scrapedPages: ScrapedPage[];

    console.log("🔍 Starting LEVEL-BY-LEVEL CONCURRENT scraping mode");
    const scraper = new WebScraper(browser);
    scrapedPages = await scraper.scrapeWebsite(mainUrl.toString());

    if (scrapedPages.length === 0) {
      return NextResponse.json(
        { error: "No pages could be scraped from the provided URL." },
        { status: 400 }
      );
    }

    const fileName = `${domain}_${Date.now()}`;

    console.log(`✅ Scraping completed: ${scrapedPages.length} pages found`);

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        domain,
        userId,
        chatbotId,
        totalPages: scrapedPages.length,
        maxLevel: Math.max(...scrapedPages.map((page) => page.level)),
        scrapedPages: scrapedPages,
      },
      scrapedAt: new Date().toISOString(),
      message: "Scraping completed successfully.",
    });
  } catch (error) {
    console.error("💥 Scraping error:", error);
    return NextResponse.json(
      { error: "An error occurred while scraping the website." },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
      console.log("🔚 Browser closed");
    }
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed. Use GET instead." },
    { status: 405 }
  );
}
