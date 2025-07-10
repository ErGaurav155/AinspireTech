// app/api/subscriptions/web/cancel/route.ts
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { subscriptionId, reason, mode } = await req.json();

    if (!subscriptionId || !mode) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Cancel with Razorpay first
    const razorpayResponse =
      mode === "Immediate"
        ? await razorpay.subscriptions.cancel(subscriptionId, false)
        : await razorpay.subscriptions.cancel(subscriptionId, true);

    if (!razorpayResponse) {
      throw new Error("Failed to cancel with Razorpay");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Web subscription cancelled",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Web cancellation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to cancel Web subscription",
      },
      { status: 500 }
    );
  }
}
