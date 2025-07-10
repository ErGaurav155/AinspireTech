// app/api/chatbot/route.ts
import { generateGptResponse } from "@/lib/action/ai.action";

import WebSubscription from "@/lib/database/models/web/Websubcription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message, fileData, userId, agentId } = await request.json();

    if (!message || !userId || !agentId) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    await connectToDatabase();

    const subscriptions = await WebSubscription.find({
      clerkId: userId,
      chatbotType: agentId,
      status: "active",
    });

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const response = await generateGptResponse({
      userInput: message,
      userfileName: fileData || "default",
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
