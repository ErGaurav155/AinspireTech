import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import Subscription from "@/lib/database/models/Websubcription.model";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatbotType, plan, billingCycle } = await request.json();

    if (!chatbotType || !plan || !billingCycle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingSubscription = await Subscription.findOne({
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
      userId: userId,
      clerkId: userId,
      chatbotType,
      plan,
      billingCycle,
      status: "active",
      createdAt: now,
      expiresAt,
      updatedAt: now,
    };

    const result = await Subscription.create(newSubscription);

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
