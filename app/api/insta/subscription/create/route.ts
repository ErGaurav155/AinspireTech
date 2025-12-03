// app/api/subscriptions/insta/razorpay/route.ts
import { NextResponse } from "next/server";
import { addMonths, addYears } from "date-fns";
import { connectToDatabase } from "@/lib/database/mongoose";
import InstaSubscription from "@/lib/database/models/insta/InstaSubscription.model";
import { auth } from "@clerk/nextjs/server";
import User from "@/lib/database/models/user.model";
import { instagramPricingPlans } from "@/constant";
import Affiliate from "@/lib/database/models/affiliate/Affiliate";
import Referral from "@/lib/database/models/affiliate/Referral";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId, billingCycle, chatbotType, plan, referralCode } =
      await req.json();

    if (!subscriptionId || !billingCycle || !chatbotType || !plan) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get user from database
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const existingSubscription = await InstaSubscription.findOne({
      clerkId,
      chatbotType,
      status: "active",
    });

    if (existingSubscription) {
      return NextResponse.json(
        {
          error:
            "Active subscription already exists for this instagram account.",
        },
        { status: 409 }
      );
    }
    // Calculate expiry date
    const now = new Date();
    const expiresAt = new Date(now);
    if (billingCycle === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Get plan price for commission calculation
    const planDetail = instagramPricingPlans.find((p) => p.id === chatbotType);
    const subscriptionPrice =
      billingCycle === "monthly"
        ? planDetail?.monthlyPrice || 0
        : planDetail?.yearlyPrice || 0;

    // Create subscription
    const newSubscription = await InstaSubscription.create({
      clerkId,
      chatbotType,
      plan,
      subscriptionId,
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
          productType: "insta-automation",
          subscriptionId: newSubscription._id,
          subscriptionModel: "InstaSubscription",
          subscriptionType: billingCycle,
          instaPlan: chatbotType,
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

    return NextResponse.json(
      {
        subscription: newSubscription,
        referral: referralRecord,
        message: "Subscription created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating subscription:", error.message);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
