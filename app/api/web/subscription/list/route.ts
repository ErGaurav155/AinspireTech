import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs";
import WebSubscription from "@/lib/database/models/web/Websubcription.model";
import { connectToDatabase } from "@/lib/database/mongoose";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
