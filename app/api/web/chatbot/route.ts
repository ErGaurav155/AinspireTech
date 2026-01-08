import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";
import WebChatbot from "@/lib/database/models/web/WebChatbot.model";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const userChatbots = await WebChatbot.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .lean();

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
