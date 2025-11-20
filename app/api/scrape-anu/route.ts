import { NextRequest, NextResponse } from "next/server";

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
 * API endpoint to scrape website content of a given URL.
 * Usage: /api/scrape?url=https://example.com
 */
export async function GET(request: NextRequest) {
  // Extract URL parameter from query string
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");
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
    const page = await browser.newPage();
    await page.goto(parsedUrl.toString(), { waitUntil: "networkidle2" });

    // Scrape website data instead of taking screenshot
    const scrapedData = await page.evaluate(() => {
      const getMetaContent = (name: string) => {
        const meta =
          document.querySelector(`meta[name="${name}"]`) ||
          document.querySelector(`meta[property="og:${name}"]`);
        return meta ? meta.getAttribute("content") || "" : "";
      };

      const extractHeadings = () => {
        const headings: { [key: string]: string[] } = {};
        ["h1", "h2", "h3"].forEach((tag) => {
          headings[tag] = Array.from(document.querySelectorAll(tag))
            .map((el) => el.textContent?.trim() || "")
            .filter((text) => text.length > 0);
        });
        return headings;
      };

      const extractLinks = () => {
        return Array.from(document.querySelectorAll("a"))
          .map((a) => ({
            href: a.href,
            text: a.textContent?.trim() || "",
          }))
          .filter((link) => link.href && link.text)
          .slice(0, 10); // Limit to first 10 links
      };

      const extractImages = () => {
        return Array.from(document.querySelectorAll("img"))
          .map((img) => ({
            src: img.src,
            alt: img.alt || "",
          }))
          .slice(0, 5); // Limit to first 5 images
      };

      return {
        url: window.location.href,
        title: document.title || "",
        description: getMetaContent("description"),
        keywords: getMetaContent("keywords"),
        headings: extractHeadings(),
        links: extractLinks(),
        images: extractImages(),
        content: document.body.innerText?.substring(0, 2000) || "", // First 2000 chars
      };
    });

    // Return scraped data as JSON
    return NextResponse.json({
      success: true,
      data: scrapedData,
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
