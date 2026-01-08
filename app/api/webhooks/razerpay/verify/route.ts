import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { addPurchasedTokens } from "@/lib/services/token";
import { auth } from "@clerk/nextjs/server";

export interface VerifyBody {
  subscription_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  tokens?: number;
  amount?: number;
  currency?: string;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const {
      subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      tokens,
      amount,
      currency,
    }: VerifyBody = await request.json();
    console.log("Verifying payment with data:", {
      subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      tokens,
      amount,
      currency,
    });

    if (
      !subscription_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !amount ||
      !tokens ||
      !currency
    ) {
      return NextResponse.json(
        { error: "Missing required parameters", success: false },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret not found" },
        { status: 400 }
      );
    }

    const HMAC = crypto.createHmac("sha256", secret);

    HMAC.update(`${razorpay_payment_id}|${subscription_id}`, "utf8");
    const data = `${razorpay_payment_id}|${subscription_id}`;
    const generatedSignature = HMAC.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Add tokens to user's balance
    await addPurchasedTokens(userId, tokens, {
      razorpayOrderId: subscription_id,
      amount,
      currency,
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred", success: false },
      { status: 500 }
    );
  }
}
