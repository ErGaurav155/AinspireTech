// app/api/faq/route.ts
import FAQ from "@/lib/database/models/web/webFaq.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { clerkId, chatbotType, questions } = body;

    if (!clerkId || !chatbotType) {
      return NextResponse.json(
        { error: "clerkId and chatbotType are required" },
        { status: 400 }
      );
    }

    // Find existing FAQ or create new one
    let faq = await FAQ.findOne({ clerkId, chatbotType });

    if (faq) {
      // Update existing FAQ
      faq.questions = questions;
      await faq.save();
    } else {
      // Create new FAQ
      faq = await FAQ.create({
        clerkId,
        chatbotType,
        questions,
      });
    }

    return NextResponse.json({
      success: true,
      faq,
    });
  } catch (error: any) {
    console.error("FAQ save error:", error);
    return NextResponse.json(
      { error: "Failed to save FAQ: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerkId");
    const chatbotType = searchParams.get("chatbotType");

    if (!clerkId || !chatbotType) {
      return NextResponse.json(
        { error: "clerkId and chatbotType are required" },
        { status: 400 }
      );
    }

    const faq = await FAQ.findOne({ clerkId, chatbotType });

    if (!faq) {
      return NextResponse.json({
        success: true,
        faq: {
          clerkId,
          chatbotType,
          questions: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      faq,
    });
  } catch (error: any) {
    console.error("FAQ fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQ: " + error.message },
      { status: 500 }
    );
  }
}
