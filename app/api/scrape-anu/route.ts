import { ApifyClient } from "apify-client";
import { NextRequest, NextResponse } from "next/server";

import File from "@/lib/database/models/web/scrappeddata.model";

import { URL } from "url";
import { connectToDatabase } from "@/lib/database/mongoose";

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN!,
});

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    await connectToDatabase();

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
        apifyProxyGroups: ["RESIDENTIAL"],
      },
      useSitemaps: true,
      crawlerType: "playwright:adaptive",
      removeElementsCssSelector: `nav, footer, script, style, noscript, svg, img[src^='data:'],
        [role="alert"],
        [role="banner"],
        [role="dialog"],
        [role="alertdialog"],
        [role="region"][aria-label*="skip" i],
        [aria-modal="true"]`,
      removeCookieWarnings: true,
      htmlTransformer: "none", // Disable HTML-to-text transformation
      saveHtml: false, // Don't save raw HTML
      saveMarkdown: false, // Disable markdown output
      saveFiles: false, // Avoid saving files/screenshots
      maxResults: 9999999,
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
    const extractedData = items.map((item) => ({
      url: item.url,
      title: item.title,
      description: item.description || "",
      text: item.text, // From meta tags
    }));

    const existingFile = await File.findOne({
      fileName: `${domain}.json`,
    });

    if (existingFile) {
      // Update existing record
      existingFile.content = extractedData;
      await existingFile.save();
    } else {
      // Create new record
      await File.create({
        fileName: `${domain}.json`,
        content: extractedData,
        domain,
      });
    }

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
