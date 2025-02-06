import { ApifyClient } from "apify-client";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { URL } from "url";

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
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
    const cleanedData = await refineContentWithOpenAI(items);

    // Define file path
    const filePath = path.join(process.cwd(), "public/data", `${domain}.json`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // Save the improved data
    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));

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

// Function to clean and structure scraped data using OpenAI
async function refineContentWithOpenAI(data: any[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that restructures and enhances raw website data. Remove duplicates, improve clarity, and structure the information professionally. Aim to provide as much content as possible while ensuring that there is no repeated or redundant information.",
        },
        {
          role: "user",
          content: `Here is some raw scraped website data: ${JSON.stringify(
            data
          )}. Clean it up, remove repeated content, and return a structured summary. Ensure the response is as detailed and long as possible while avoiding unnecessary repetition.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096, // Maximizing the token count for maximum output
    });

    const refinedContent = response.choices[0]?.message?.content;
    if (!refinedContent) {
      return "No refined data returned.";
    }

    return refinedContent;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Error in refining content.";
  }
}
