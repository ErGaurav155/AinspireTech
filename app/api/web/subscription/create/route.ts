import { NextRequest, NextResponse } from "next/server";
import WebSubscription from "@/lib/database/models/web/Websubcription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase(); // 👈 ensure DB connection before queries

    const { userId } = await auth();
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

    const now = new Date();
    const expiresAt = new Date(now);
    if (billingCycle === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const newSubscription = await WebSubscription.create({
      clerkId: userId,
      chatbotType,
      subscriptionId,
      plan,
      billingCycle,
      status: "active",
      createdAt: now,
      expiresAt,
      updatedAt: now,
    });

    return NextResponse.json({
      message: "Subscription created successfully",
      subscription: newSubscription,
    });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
