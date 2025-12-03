// app/api/web/subscription/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import WebSubscription from "@/lib/database/models/web/Websubcription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";
import User from "@/lib/database/models/user.model";
import { productSubscriptionDetails } from "@/constant";
import Affiliate from "@/lib/database/models/affiliate/Affiliate";
import Referral from "@/lib/database/models/affiliate/Referral";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatbotType, plan, billingCycle, subscriptionId, referralCode } =
      await request.json();

    if (!chatbotType || !plan || !billingCycle || !subscriptionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingSubscription = await WebSubscription.findOne({
      clerkId,
      chatbotType,
      status: "active",
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "Active subscription already exists for this chatbot type" },
        { status: 409 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now);
    if (billingCycle === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Get plan price for commission calculation
    const productDetail = productSubscriptionDetails[chatbotType];
    const subscriptionPrice =
      billingCycle === "monthly"
        ? productDetail?.mprice || 0
        : productDetail?.yprice || 0;

    const newSubscription = await WebSubscription.create({
      clerkId,
      chatbotType,
      subscriptionId,
      plan,
      billingCycle,
      status: "active",
      createdAt: now,
      expiresAt,
      updatedAt: now,
    });

    // Handle referral if exists and user hasn't used one before
    let referralRecord = null;
    if (referralCode && !user.hasUsedReferral) {
      const affiliate = await Affiliate.findOne({
        affiliateCode: referralCode,
        status: "active",
      });

      if (affiliate && affiliate.userId.toString() !== clerkId.toString()) {
        // Calculate commission
        const commissionRate = affiliate.commissionRate || 0.3; // Default 30%
        const monthlyCommission =
          billingCycle === "monthly" ? subscriptionPrice * commissionRate : 0;
        const yearlyCommission =
          billingCycle === "yearly" ? subscriptionPrice * commissionRate : 0;

        // Create referral record
        referralRecord = await Referral.create({
          affiliateId: affiliate._id,
          referredUserId: clerkId,
          productType: "web-chatbot",
          subscriptionId: newSubscription._id,
          subscriptionModel: "WebSubscription",
          subscriptionType: billingCycle,
          chatbotType: chatbotType,
          subscriptionPrice,
          commissionRate,
          monthlyCommission,
          yearlyCommission,
          monthsRemaining:
            billingCycle === "monthly" ? affiliate.monthlyMonths || 10 : 0,
          yearsRemaining:
            billingCycle === "yearly" ? affiliate.yearlyYears || 3 : 0,
          lastCommissionDate: now,
          nextCommissionDate: expiresAt,
          status: "active",
        });

        // Update user
        user.referredBy = affiliate._id;
        user.hasUsedReferral = true;
        await user.save();

        // Update affiliate stats
        affiliate.totalReferrals += 1;
        affiliate.activeReferrals += 1;
        await affiliate.save();
      }
    }

    return NextResponse.json({
      message: "Subscription created successfully",
      subscription: newSubscription,
      referral: referralRecord,
    });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
