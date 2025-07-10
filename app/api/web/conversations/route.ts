import WebConversation from "@/lib/database/models/web/Conversation.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose"; // Import mongoose for ObjectId

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const chatbotId = searchParams.get("chatbotId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    await connectToDatabase(); // Added parentheses

    // Convert string IDs to ObjectId if needed
    const query: any = { clerkId: userId };
    if (chatbotId) {
      query.chatbotId = new mongoose.Types.ObjectId(chatbotId);
    }

    const result = await WebConversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ conversations: result });
  } catch (error) {
    console.error("Conversations fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
