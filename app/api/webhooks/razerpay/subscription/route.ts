import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Subscription from "@/lib/database/models/subscription.model";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { planId, buyerId, productId } = (await request.json()) as {
      planId: string;
      buyerId: string;
      productId: string;
    };

    const options = {
      plan_id: planId, // Use the pre-created plan ID
      total_count: 12, // Number of billing cycles (e.g., 12 for yearly)
      customer_notify: 1 as 0 | 1,
      notes: {
        buyerId: buyerId,
      },
    };

    const subscription = await razorpay.subscriptions.create(options);
    // Store order ID and other details in your database
    await connectToDatabase();

    const newSubscription = new Subscription({
      userId: buyerId,
      productId,
      subscriptionId: subscription.id,
      subscriptionStatus: "pending",
    });
    await newSubscription.save();

    return NextResponse.json(
      { subscription: subscription.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating subscription:", error.message);
    return NextResponse.json(
      { error: "Failed to create subscription", details: error.message },
      { status: 500 }
    );
  }
}
