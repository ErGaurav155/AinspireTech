import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";

import { createRazerPaySubscription } from "@/lib/action/subscription.action";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { razorpayplanId, buyerId, productId } = (await request.json()) as {
      razorpayplanId: string;
      buyerId: string;
      productId: string;
    };
    const options = {
      plan_id: razorpayplanId, // Use the pre-created plan ID
      total_count: 12, // Number of billing cycles (e.g., 12 for yearly)
      customer_notify: 1 as 0 | 1,
      notes: {
        buyerId: buyerId,
      },
    };
    const subscription = await razorpay.subscriptions.create(options);
    if (!subscription) {
      throw new Error("Subscription creation Failed");
    }

    const subscriptionId = subscription.id;

    await createRazerPaySubscription(buyerId, productId, subscriptionId);

    return NextResponse.json({ isOk: true, subsId: subscriptionId });
  } catch (error: any) {
    console.error("Error creating subscription:", error.message);
    return NextResponse.json(
      { error: "Failed to create subscription", details: error.message },
      { status: 500 }
    );
  }
}
