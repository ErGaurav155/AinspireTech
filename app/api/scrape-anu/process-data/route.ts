import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { uploadTextToCloudinary } from "@/lib/action/transaction.action";

// MongoDB connection
const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/websitescraper";

async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URL);
}

/**
 * Function to remove emojis and unsupported characters for OpenAI compatibility
 */
function sanitizeForOpenAI(text: string): string {
  if (!text) return "";

  return (
    text
      // Remove emojis and special Unicode characters
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "") // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "") // Symbols & pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "") // Transport & map symbols
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "") // Flags
      .replace(/[\u{2700}-\u{27BF}]/gu, "") // Dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, "") // Supplemental symbols and pictographs
      // Remove other problematic characters
      .replace(/[^\x20-\x7E\n\t\r]/g, "") // Keep only printable ASCII + newline/tab/carriage return
      // Remove the Unicode replacement character (�)
      .replace(/�/g, "")
      // Remove any backslashes that might create invalid escape sequences
      .replace(/\\[^nrt"\\\/]/g, "") // Keep only valid escape sequences: \n, \r, \t, \", \\, \/
      // Clean up multiple spaces
      .replace(/\s+/g, " ")
      .trim()
  );
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

/**
 * Format scraped data into object with URL as key and description as value
 */
function formatScrapedData(pages: ScrapedPage[]): string {
  const dataObject: { [key: string]: string } = {};

  pages.forEach((page) => {
    // Create description with title, meta description, and first heading
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
      // Add first 100 characters of content
      const contentPreview = page.content.substring(0, 100);
      description += `Content: ${contentPreview}${
        page.content.length > 100 ? "..." : ""
      }`;
    }

    // Final sanitization of the complete description
    description = sanitizeForOpenAI(description);

    // Limit description to ~500 tokens (2000 characters)
    if (description.length > 1000) {
      description = description.substring(0, 997) + "...";
    }

    dataObject[page.url] = description.trim();
  });

  return JSON.stringify(dataObject, null, 2);
}

/**
 * API endpoint to process scraped data, upload to Cloudinary and store in database
 * Usage: POST /api/process-data with scraped data in body
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Parse the request body
    const body = await request.json();

    const { fileName, domain, userId, scrapedPages, totalPages, maxLevel } =
      body;

    // Validate required fields
    if (
      !fileName ||
      !domain ||
      !userId ||
      !scrapedPages ||
      !Array.isArray(scrapedPages)
    ) {
      return new NextResponse(
        "Missing required fields: fileName, domain, userId, and scrapedPages are required.",
        {
          status: 400,
        }
      );
    }

    console.log(
      `Processing data for: ${fileName}, ${scrapedPages.length} pages`
    );

    // Format data as object with URL as key and description as value
    const formattedData = formatScrapedData(scrapedPages);

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadTextToCloudinary(formattedData, fileName);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        fileName,
        domain,
        userId,
        totalPages: scrapedPages.length,
        maxLevel: Math.max(
          ...scrapedPages.map((page: ScrapedPage) => page.level)
        ),
        cloudinaryLink: cloudinaryUrl,
        pages: scrapedPages,
      },
      processedAt: new Date().toISOString(),
      message: "Data processed and stored successfully",
    });
  } catch (error) {
    console.error("Data processing error:", error);
    return new NextResponse("An error occurred while processing the data.", {
      status: 500,
    });
  }
}

/**
 * GET endpoint for testing or retrieving processing status
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Use POST method to process scraped data",
    usage: {
      method: "POST",
      body: {
        fileName: "string",
        domain: "string",
        userId: "string",
        scrapedPages: "array of scraped pages",
        totalPages: "number",
        maxLevel: "number",
      },
    },
  });
}
