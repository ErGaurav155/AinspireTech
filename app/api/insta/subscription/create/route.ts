// app/api/subscriptions/insta/razorpay/route.ts

import { NextResponse } from "next/server";
import { addMonths, addYears } from "date-fns";
import { connectToDatabase } from "@/lib/database/mongoose";
import InstaSubscription from "@/lib/database/models/insta/InstaSubscription.model";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId, billingCycle, chatbotType, plan } =
      await req.json();

    if (!subscriptionId || !billingCycle || !chatbotType || !plan) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Calculate expiry date
    const now = new Date();
    const expiresAt = new Date(now);
    if (billingCycle === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const newSubscription = await InstaSubscription.create({
      clerkId: userId,
      chatbotType,
      plan,
      subscriptionId,
      billingCycle,
      status: "active",
      createdAt: now,
      expiresAt,
      updatedAt: now,
    });

    return NextResponse.json(newSubscription, { status: 201 });
  } catch (error: any) {
    console.error("Error creating subscription:", error.message);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
