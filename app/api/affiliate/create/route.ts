// app/api/affiliates/create/route.ts
import Affiliate from "@/lib/database/models/affiliate/Affiliate";
import User from "@/lib/database/models/user.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function generateAffiliateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      paymentMethod,
      accountName,
      accountNumber,
      bankName,
      ifscCode,
      upiId,
      paypalEmail,
    } = data;

    // Get user
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already an affiliate
    const existingAffiliate = await Affiliate.findOne({ userId: clerkId });
    if (existingAffiliate) {
      return NextResponse.json({
        success: true,
        message: "Already an affiliate",
        affiliate: existingAffiliate,
      });
    }

    // Generate unique affiliate code
    let affiliateCode;
    let isUnique = false;
    while (!isUnique) {
      affiliateCode = generateAffiliateCode();
      const existing = await Affiliate.findOne({ affiliateCode });
      if (!existing) isUnique = true;
    }

    // Prepare payment details
    let paymentDetails;
    if (paymentMethod === "bank") {
      paymentDetails = {
        method: "bank",
        accountName,
        accountNumber,
        bankName,
        ifscCode,
      };
    } else if (paymentMethod === "upi") {
      paymentDetails = {
        method: "upi",
        upiId,
      };
    } else if (paymentMethod === "paypal") {
      paymentDetails = {
        method: "paypal",
        paypalEmail,
      };
    }

    // Create affiliate
    const affiliate = await Affiliate.create({
      userId: clerkId,
      affiliateCode,
      paymentDetails,
      status: "active",
      commissionRate: 0.3,
      monthlyMonths: 10,
      yearlyYears: 3,
    });

    return NextResponse.json({
      success: true,
      affiliate,
      affiliateLink: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${affiliateCode}`,
    });
  } catch (error: any) {
    console.error("Error creating affiliate:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
