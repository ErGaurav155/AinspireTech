import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDatabase } from "@/lib/database/mongoose";
import Chatbot from "@/lib/database/models/chatbot.model";

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase(); // Don't forget parentheses

    // Using Mongoose syntax - no toArray() needed
    const userChatbots = await Chatbot.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .lean(); // Convert Mongoose documents to plain objects

    return NextResponse.json({
      chatbots: userChatbots,
    });
  } catch (error) {
    console.error("Chatbots fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
