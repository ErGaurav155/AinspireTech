// app/api/affiliates/dashboard/route.ts
import Affiliate from "@/lib/database/models/affiliate/Affiliate";
import CommissionRecord from "@/lib/database/models/affiliate/CommissionRecord";
import Payout from "@/lib/database/models/affiliate/Payout";
import Referral from "@/lib/database/models/affiliate/Referral";
import User from "@/lib/database/models/user.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const affiliate = await Affiliate.findOne({ userId: clerkId });
    if (!affiliate) {
      return NextResponse.json({
        success: false,
        message: "Not an affiliate",
        isAffiliate: false,
      });
    }

    // Get referrals with subscription details
    const referrals = await Referral.find({ affiliateId: affiliate._id })
      .populate("referredUserId", "firstName lastName email")
      .sort({ createdAt: -1 });

    // Get commission records for current month
    const currentDate = new Date();
    const currentPeriod = `${currentDate.getFullYear()}-${(
      currentDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;

    const monthlyCommissions = await CommissionRecord.find({
      affiliateId: affiliate._id,
      period: currentPeriod,
      status: "pending",
    });

    // Get payout history
    const payoutHistory = await Payout.find({ affiliateId: affiliate._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate stats
    const stats = {
      totalReferrals: affiliate.totalReferrals,
      activeReferrals: affiliate.activeReferrals,
      totalEarnings: affiliate.totalEarnings,
      pendingEarnings: affiliate.pendingEarnings,
      paidEarnings: affiliate.paidEarnings,
      monthlyEarnings: monthlyCommissions.reduce((sum, c) => sum + c.amount, 0),
      webChatbotReferrals: referrals.filter(
        (r) => r.productType === "web-chatbot"
      ).length,
      instaReferrals: referrals.filter(
        (r) => r.productType === "insta-automation"
      ).length,
    };

    return NextResponse.json({
      success: true,
      isAffiliate: true,
      affiliate,
      stats,
      referrals,
      monthlyCommissions,
      payoutHistory,
      affiliateLink: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${affiliate.affiliateCode}`,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
