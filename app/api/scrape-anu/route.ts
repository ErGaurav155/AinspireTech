import { ApifyClient } from "apify-client";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { URL } from "url";

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN!,
});

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { mainUrl } = await req.json();
    if (!mainUrl) {
      return NextResponse.json(
        { success: false, message: "URL is required" },
        { status: 400 }
      );
    }

    const domain = new URL(mainUrl).hostname.replace(/^www\./, "");

    const scraperConfig = {
      actorId: "apify/website-content-crawler",
      startUrls: [{ url: mainUrl.trim() }],
      maxCrawlDepth: 2,
      maxCrawlPages: 10,
      proxyConfiguration: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"], // Optional
      },

      useSitemaps: true,
      crawlerType: "playwright:adaptive",
      includeUrlGlobs: [],
      excludeUrlGlobs: [],
      keepUrlFragments: false,

      initialConcurrency: 0,
      maxConcurrency: 200,
      initialCookies: [],

      maxSessionRotations: 10,
      maxRequestRetries: 5,
      requestTimeoutSecs: 60,
      minFileDownloadSpeedKBps: 128,
      dynamicContentWaitSecs: 10,
      waitForSelector: "",
      maxScrollHeightPixels: 5000,
      keepElementsCssSelector: "",
      removeElementsCssSelector: `nav, footer, script, style, noscript, svg, img[src^='data:'],
        [role="alert"],
        [role="banner"],
        [role="dialog"],
        [role="alertdialog"],
        [role="region"][aria-label*="skip" i],
        [aria-modal="true"]`,
      removeCookieWarnings: true,
      expandIframes: true,
      clickElementsCssSelector: '[aria-expanded="false"]',
      htmlTransformer: "readableText",
      readableTextCharThreshold: 100,
      aggressivePrune: false,
      debugMode: false,
      debugLog: false,
      saveHtml: false,
      saveHtmlAsFile: false,
      saveMarkdown: true,
      saveFiles: false,
      saveScreenshots: false,
      maxResults: 9999999,
      clientSideMinChangePercentage: 15,
      renderingTypeDetectionPercentage: 10,
    };

    // Start and wait for scraping to complete
    const run = await client.actor(scraperConfig.actorId).start(scraperConfig);
    await client.run(run.id).waitForFinish();

    // Fetch scraped data
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "No data scraped" },
        { status: 400 }
      );
    }

    // Call OpenAI to clean and structure the scraped data

    // Define file path
    const filePath = path.join(process.cwd(), "public/data", `${domain}.json`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // Save the improved data
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));

    return NextResponse.json(
      { success: true, fileName: `${domain}.json` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
