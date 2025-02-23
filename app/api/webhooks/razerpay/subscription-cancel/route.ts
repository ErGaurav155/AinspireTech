// app/api/razorpay-webhook/route.ts
import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import {
  setSubsciptionActive,
  setSubsciptionCanceled,
} from "@/lib/action/subscription.action";

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Get Razorpay signature from headers
    const razorpaySignature = req.headers.get("x-razorpay-signature");

    // Verify webhook signature
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

    // Handle subscription cancelled event
    if (body.event === "subscription.cancelled") {
      const subscriptionId = body.payload.subscription.entity.id;
      const reason = body.payload.subscription.entity.status;

      // Update database
      await setSubsciptionCanceled(subscriptionId, reason);
    }
    if (body.event === "subscription.charged") {
      const subscriptionId = body.payload.subscription.entity.id;
      const nextBillingDate = new Date(
        body.payload.subscription.entity.charge_at * 1000
      );

      await setSubsciptionActive(subscriptionId, nextBillingDate);
    }

    return NextResponse.json(
      { success: true, message: "Webhook received" },
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
