import Conversation from "@/lib/database/models/Conversation.model";
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
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (chatbotId) {
      query.chatbotId = new mongoose.Types.ObjectId(chatbotId);
    }

    const result = await Conversation.find(query)
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

export async function POST(request: NextRequest) {
  try {
    const { chatbotId, userId, customerEmail, customerName, message } =
      await request.json();

    if (!chatbotId || !userId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase(); // Added parentheses

    const newConversation = {
      chatbotId: new mongoose.Types.ObjectId(chatbotId),
      userId: new mongoose.Types.ObjectId(userId),
      customerEmail,
      customerName,
      messages: [
        {
          id: new mongoose.Types.ObjectId().toString(),
          type: "user",
          content: message,
          timestamp: new Date(),
        },
      ],
      status: "active",
      tags: [],
    };

    const result = await Conversation.create(newConversation);

    return NextResponse.json({
      message: "Conversation created successfully",
      conversationId: result._id, // Changed from insertedId to _id for Mongoose
    });
  } catch (error) {
    console.error("Conversation creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
