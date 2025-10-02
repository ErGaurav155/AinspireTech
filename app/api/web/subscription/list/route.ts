import { NextRequest, NextResponse } from "next/server";
import WebSubscription from "@/lib/database/models/web/Websubcription.model";
import { connectToDatabase } from "@/lib/database/mongoose";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "No user ID provided" },
        { status: 400 }
      );
    }
    await connectToDatabase();

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

    return NextResponse.json(subscriptions, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching subscriptions:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch subscription information" },
      { status: 500 }
    );
  }
}
