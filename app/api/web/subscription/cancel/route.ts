import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDatabase } from "@/lib/database/mongoose";
import Subscription from "@/lib/database/models/Websubcription.model";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatbotType } = await request.json();

    if (!chatbotType) {
      return NextResponse.json(
        { error: "Chatbot type is required" },
        { status: 400 }
      );
    }
    await connectToDatabase;

    const result = await Subscription.updateOne(
      {
        clerkId: userId,
        chatbotType,
        status: "active",
      },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Active subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
