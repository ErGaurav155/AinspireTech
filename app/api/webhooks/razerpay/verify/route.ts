import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export interface VerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }: VerifyBody = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required parameters", success: false },
        { status: 400 }
      );
    }
    console.log("razorpay_order_id", razorpay_order_id);
    console.log("razorpay_payment_id", razorpay_payment_id);
    console.log("razorpay_signature", razorpay_signature);

    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret not found" },
        { status: 400 }
      );
    }

    const HMAC = crypto.createHmac("sha256", secret);
    console.log("Secret Key:", secret);

    HMAC.update(`${razorpay_order_id}|${razorpay_payment_id}`, "utf8");
    const data = `${razorpay_order_id}|${razorpay_payment_id}`;
    console.log("Data to hash:", data);
    const generatedSignature = HMAC.digest("hex");
    console.log("generatedSignature", generatedSignature);
    console.log("razorpay_signature", razorpay_signature);

    if (generatedSignature === razorpay_signature) {
      return NextResponse.json({
        message: "Payment verified successfully",
        success: true,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid signature", success: false },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred", success: false },
      { status: 500 }
    );
  }
}
