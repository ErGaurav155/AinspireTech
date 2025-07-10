import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import WebSubscription from "@/lib/database/models/web/Websubcription.model";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatbotType, plan, billingCycle, subscriptionId } =
      await request.json();

    if (!chatbotType || !plan || !billingCycle || !subscriptionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingSubscription = await WebSubscription.findOne({
      clerkId: userId,
      chatbotType,
      status: "active",
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "Active subscription already exists for this chatbot type" },
        { status: 409 }
      );
    }

    // Calculate expiry date
    const now = new Date();
    const expiresAt = new Date(now);
    if (billingCycle === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const newSubscription = {
      clerkId: userId,
      chatbotType,
      subscriptionId,
      plan,
      billingCycle,
      status: "active",
      createdAt: now,
      expiresAt,
      updatedAt: now,
    };

    const result = await WebSubscription.create(newSubscription);

    return NextResponse.json({
      message: "Subscription created successfully",
      subscription: {
        id: result.insertedId,
        ...newSubscription,
      },
    });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
