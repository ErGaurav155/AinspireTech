// app/api/webhooks/razerpay/subscription/route.ts
import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay credentials are not configured");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const {
      razorpayplanId,
      buyerId,
      productId,

      amount,
    } = (await request.json()) as {
      razorpayplanId: string;
      buyerId: string;
      productId: string;

      amount: number;
    };

    if (!buyerId || !productId || !razorpayplanId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayplanId,
      total_count: 12,
      customer_notify: 1 as 0 | 1,

      notes: {
        buyerId: buyerId,
        productId: productId,
      },
    });

    if (!subscription) {
      throw new Error("Subscription creation failed");
    }

    const subscriptionId = subscription.id;

    return NextResponse.json({
      isOk: true,
      subsId: subscriptionId,
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription", details: error.message },
      { status: 500 }
    );
  }
}
