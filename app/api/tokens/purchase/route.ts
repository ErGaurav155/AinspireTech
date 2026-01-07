import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { addPurchasedTokens } from "@/lib/services/token";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tokens, amount, currency = "INR", planId } = body;

    if (!tokens || !amount) {
      return NextResponse.json(
        { error: "Tokens and amount are required" },
        { status: 400 }
      );
    }

    // Create order in Razorpay
    const options = {
      amount: amount * 100,
      currency,
      receipt: userId,
      notes: {
        userId,
        tokens,
        planId: planId || "custom",
        type: "token_purchase",
      },
    };

    const order = await razorpay.orders.create(options);
    console.log("order:", order);
    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      tokens,
    });
  } catch (error) {
    console.error("Error creating token purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      tokens,
      amount,
      currency,
    } = body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !tokens
    ) {
      return NextResponse.json(
        { error: "Payment verification data missing" },
        { status: 400 }
      );
    }

    // Verify payment signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Add tokens to user's balance
    const result = await addPurchasedTokens(userId, tokens, {
      razorpayOrderId: razorpay_order_id,
      amount,
      currency,
    });

    return NextResponse.json({
      success: true,
      message: "Tokens purchased successfully",
      tokensAdded: tokens,
      newBalance: result.newBalance,
    });
  } catch (error) {
    console.error("Error verifying token purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
