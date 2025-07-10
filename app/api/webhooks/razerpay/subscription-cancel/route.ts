import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/database/mongoose";
import InstaSubscription from "@/lib/database/models/insta/InstaSubscription.model";
import WebSubscription from "@/lib/database/models/web/Websubcription.model";

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Verify Razorpay signature
    const razorpaySignature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const subscriptionId = body.payload.subscription?.entity.id;

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, message: "No subscription ID found" },
        { status: 400 }
      );
    }

    // Handle different webhook events
    switch (body.event) {
      case "subscription.cancelled":
        await handleSubscriptionCancelled(subscriptionId);
        break;

      case "subscription.charged":
        const nextBillingDate = new Date(
          body.payload.subscription.entity.charge_at * 1000
        );
        await handleSubscriptionCharged(subscriptionId, nextBillingDate);
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Unhandled event type" },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { success: true, message: "Webhook processed" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Webhook handler failed",
      },
      { status: 500 }
    );
  }
}

// Helper function to handle cancellation
async function handleSubscriptionCancelled(subscriptionId: string) {
  // Try to update in InstaSubscription first
  let updatedSub = await InstaSubscription.findOneAndUpdate(
    { subscriptionId },
    {
      $set: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    },
    { new: true }
  );

  // If not found, try WebSubscription
  if (!updatedSub) {
    updatedSub = await WebSubscription.findOneAndUpdate(
      { subscriptionId },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      },
      { new: true }
    );
  }

  if (!updatedSub) {
    console.warn(`Subscription ${subscriptionId} not found in any model`);
  }
}

// Helper function to handle successful charges
async function handleSubscriptionCharged(
  subscriptionId: string,
  nextBillingDate: Date
) {
  // Try to update in InstaSubscription first
  let updatedSub = await InstaSubscription.findOneAndUpdate(
    { subscriptionId },
    {
      $set: {
        status: "active",
        expiresAt: nextBillingDate,
      },
    },
    { new: true }
  );

  // If not found, try WebSubscription
  if (!updatedSub) {
    updatedSub = await WebSubscription.findOneAndUpdate(
      { subscriptionId },
      {
        $set: {
          status: "active",
          expiresAt: nextBillingDate,
        },
      },
      { new: true }
    );
  }

  if (!updatedSub) {
    console.warn(`Subscription ${subscriptionId} not found in any model`);
  }
}
