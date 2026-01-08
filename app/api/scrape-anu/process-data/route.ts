import { NextRequest, NextResponse } from "next/server";
import { uploadTextToCloudinary } from "@/lib/action/transaction.action";
import WebChatbot from "@/lib/database/models/web/WebChatbot.model";
import { connectToDatabase } from "@/lib/database/mongoose";

function sanitizeForOpenAI(text: string): string {
  if (!text) return "";

  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "")
    .replace(/[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
    .replace(/[^\x20-\x7E\n\t\r]/g, "")
    .replace(/�/g, "")
    .replace(/\\[^nrt"\\\/]/g, "")
    .replace(/\s+/g, " ")
    .trim();
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

function formatScrapedData(pages: ScrapedPage[]): string {
  const dataObject: { [key: string]: string } = {};

  pages.forEach((page) => {
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
      const contentPreview = page.content.substring(0, 100);
      description += `Content: ${contentPreview}${
        page.content.length > 100 ? "..." : ""
      }`;
    }

    description = sanitizeForOpenAI(description);

    if (description.length > 1000) {
      description = description.substring(0, 997) + "...";
    }

    dataObject[page.url] = description.trim();
  });

  return JSON.stringify(dataObject, null, 2);
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();

    const { fileName, domain, userId, chatbotId, scrapedPages } = body;

    if (!fileName || !domain || !userId || !chatbotId || !scrapedPages) {
      return new NextResponse("Missing required fields", {
        status: 400,
      });
    }

    const chatbot = await WebChatbot.findOne({
      _id: chatbotId,
      clerkId: userId,
    });

    if (!chatbot) {
      return new NextResponse("Chatbot not found", { status: 404 });
    }

    console.log(`Processing data for chatbot: ${chatbot.name}`);

    const formattedData = formatScrapedData(scrapedPages);

    const cloudinaryUrl = await uploadTextToCloudinary(formattedData, fileName);

    await WebChatbot.updateOne(
      { _id: chatbotId, clerkId: userId },
      {
        $set: {
          scrappedFile: cloudinaryUrl,
          isScrapped: true,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        domain,
        userId,
        chatbotId,
        chatbotName: chatbot.name,
        totalPages: scrapedPages.length,
        maxLevel: Math.max(
          ...scrapedPages.map((page: ScrapedPage) => page.level)
        ),
        cloudinaryLink: cloudinaryUrl,
        pages: scrapedPages,
      },
      processedAt: new Date().toISOString(),
      message: "Data processed and chatbot updated successfully",
    });
  } catch (error) {
    console.error("Data processing error:", error);
    return new NextResponse("An error occurred while processing the data.", {
      status: 500,
    });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Use POST method to process scraped data",
    usage: {
      method: "POST",
      body: {
        fileName: "string",
        domain: "string",
        userId: "string",
        chatbotId: "string",
        scrapedPages: "array of scraped pages",
      },
    },
  });
}
