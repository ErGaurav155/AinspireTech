// app/api/affiliate/track-referral/route.ts
import { trackReferral } from "@/lib/action/affiliate.action";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, affiliateCode, amount, buyerId } = body;

    if (!subscriptionId || !affiliateCode || !amount || !buyerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const referral = await trackReferral(
      buyerId,
      affiliateCode,
      subscriptionId,
      amount
    );

    return NextResponse.json({ success: true, referral });
  } catch (error: any) {
    console.error("Error tracking referral:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track referral" },
      { status: 500 }
    );
  }
}
