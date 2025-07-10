import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import WebsiteData from "@/lib/database/models/web/WebsiteData.model";
import { ObjectId } from "mongoose";
import User from "@/lib/database/models/user.model";

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatbotType = searchParams.get("chatbotType");

    if (!chatbotType) {
      return NextResponse.json(
        { error: "Chatbot type is required" },
        { status: 400 }
      );
    }

    const data = await WebsiteData.findOne({
      clerkId: userId,
      chatbotType,
    });

    if (!data) {
      // Return default data if none exists
      const defaultData = {
        clerkId: userId,
        chatbotType,
        content: `Company: Your Company Name
Services: AI Solutions, Web Development, Consulting
Business Hours: Monday-Friday 9AM-6PM
Contact: info@company.com
Location: Your City, Your Country
About: We provide cutting-edge AI solutions to help businesses grow and succeed in the digital age.`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await WebsiteData.create(defaultData);
      return NextResponse.json({ websiteData: defaultData });
    }

    return NextResponse.json({ websiteData: data });
  } catch (error) {
    console.error("Website data fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatbotType, content } = await request.json();

    if (!chatbotType || !content) {
      return NextResponse.json(
        { error: "Chatbot type and content are required" },
        { status: 400 }
      );
    }

    const result = await WebsiteData.updateOne(
      {
        clerkId: userId,
        chatbotType,
      },
      {
        $set: {
          content,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          userId: userId,
          clerkId: userId,
          chatbotType,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Website data saved successfully",
      upserted: result.upsertedCount > 0,
    });
  } catch (error) {
    console.error("Website data save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
