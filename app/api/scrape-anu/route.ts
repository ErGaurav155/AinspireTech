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

    const { mainUrl, userId } = await req.json();
    if (!mainUrl || !userId) {
      return NextResponse.json(
        { success: false, message: "URL is required" },
        { status: 400 }
      );
    }

    const domain = new URL(mainUrl).hostname.replace(/^www\./, "");

    const scraperConfig = {
      actorId: "apify/website-content-crawler",
      startUrls: [{ url: mainUrl.trim() }],
      maxCrawlDepth: 1, // Reduced from 2 to 1 to use less memory
      maxCrawlPages: 5, // Reduced from 10 to 5 to use less memory
      proxyConfiguration: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"],
      },
      useSitemaps: false, // Disable sitemaps to reduce memory
      crawlerType: "playwright:adaptive",
      removeElementsCssSelector: `nav, footer, script, style, noscript, svg, img[src^='data:'],
        [role="alert"],
        [role="banner"],
        [role="dialog"],
        [role="alertdialog"],
        [role="region"][aria-label*="skip" i],
        [aria-modal="true"]`,
      removeCookieWarnings: true,
      htmlTransformer: "none",
      saveHtml: false,
      saveMarkdown: false,
      saveFiles: false,
      maxResults: 50, // Reduced from 9999999 to reasonable limit
    };

    // Remove memory specification - use default
    const run = await client.actor(scraperConfig.actorId).start(scraperConfig);
    await client.run(run.id).waitForFinish();

    // Rest of your code remains the same...
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log("items:", items);

    if (!items || items.length === 0) {
      console.log("I am Not Working");

      return NextResponse.json(
        { success: false, message: "No data scraped" },
        { status: 400 }
      );
    }

    const extractedData = items.map((item) => ({
      url: item.url,
      title: item.title,
      description: item.description || "",
      text: item.text,
    }));
    console.log("extractedData:", extractedData);
    const existingFile = await File.findOne({
      fileName: `${domain}.json`,
    });
    console.log("existingFile:", existingFile);

    if (existingFile) {
      existingFile.content = extractedData;
      console.log("existingFile.content:", existingFile.content);
      await existingFile.save();
    } else {
      await File.create({
        fileName: `${domain}.json`,
        userId: userId,
        content: extractedData,
        domain,
      });
      console.log("file:", File);
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
