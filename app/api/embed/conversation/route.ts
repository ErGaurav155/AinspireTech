import WebConversation from "@/lib/database/models/web/Conversation.model";
import WebSubscription from "@/lib/database/models/web/Websubcription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      chatbotId,
      chatbotType,
      userId,
      customerEmail,
      customerName,
      messages,
      formData,
      status,
    } = await request.json();

    if (!chatbotId || !chatbotType || !userId || !messages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase(); // Added parentheses
    const subscriptions = await WebSubscription.find({
      clerkId: userId,
      chatbotType: {
        $in: [
          "chatbot-customer-support",
          "chatbot-e-commerce",
          "chatbot-lead-generation",
          "chatbot-education",
        ],
      },
      status: "active",
    });

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const newConversation = {
      chatbotId: chatbotId,
      chatbotType: chatbotType,
      clerkId: userId,
      customerName: customerName || "Anonymous",
      customerEmail: customerEmail || null,
      messages: messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
      formData: formData || null,
      status: status || "active",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await WebConversation.create(newConversation);

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
