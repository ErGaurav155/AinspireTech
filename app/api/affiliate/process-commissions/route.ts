// app/api/cron/process-commissions/route.ts
import { instagramPricingPlans, productSubscriptionDetails } from "@/constant";
import Affiliate from "@/lib/database/models/affiliate/Affiliate";
import InstaSubscription from "@/lib/database/models/insta/InstaSubscription.model";
import WebSubscription from "@/lib/database/models/web/Websubcription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextRequest, NextResponse } from "next/server";
import AffiCommissionRecord from "@/lib/database/models/affiliate/CommissionRecord";
import AffiReferral from "@/lib/database/models/affiliate/Referral";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();

    const currentDate = new Date();
    const currentPeriod = `${currentDate.getFullYear()}-${(
      currentDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;

    console.log(`Processing commissions for period: ${currentPeriod}`);

    // Get all active referrals
    const activeReferrals = await AffiReferral.find({
      status: "active",
    }).populate("referredUserId", "clerkId");

    let processedCount = 0;
    let totalCommission = 0;
    const commissionsProcessed: any[] = [];

    for (const referral of activeReferrals) {
      // Check if subscription is still active
      let subscriptionActive = false;
      let productName = "";

      if (referral.subscriptionModel === "WebSubscription") {
        const subscription = await WebSubscription.findById(
          referral.subscriptionId
        );
        if (subscription && subscription.status === "active") {
          subscriptionActive = true;
          const productDetail =
            productSubscriptionDetails[referral.chatbotType || ""];
          productName = productDetail?.name || "Web Chatbot";
        }
      } else if (referral.subscriptionModel === "InstaSubscription") {
        const subscription = await InstaSubscription.findById(
          referral.subscriptionId
        );
        if (subscription && subscription.status === "active") {
          subscriptionActive = true;
          const planDetail = instagramPricingPlans.find(
            (p) => p.id === referral.instaPlan
          );
          productName = planDetail?.name || "Instagram Automation";
        }
      }

      if (!subscriptionActive) {
        referral.status = "cancelled";
        await referral.save();
        continue;
      }

      // Process commission based on subscription type
      let commissionAmount = 0;
      let shouldProcess = false;

      if (
        referral.subscriptionType === "monthly" &&
        referral.monthsRemaining > 0
      ) {
        if (currentDate >= referral.nextCommissionDate) {
          commissionAmount =
            referral.monthlyCommission ||
            referral.subscriptionPrice * referral.commissionRate;
          referral.monthsRemaining -= 1;
          shouldProcess = true;
        }
      } else if (
        referral.subscriptionType === "yearly" &&
        referral.yearsRemaining > 0
      ) {
        // Check if it's time for yearly commission (once per year)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        if (
          !referral.lastCommissionDate ||
          referral.lastCommissionDate <= oneYearAgo
        ) {
          commissionAmount =
            referral.yearlyCommission ||
            referral.subscriptionPrice * referral.commissionRate;
          referral.yearsRemaining -= 1;
          shouldProcess = true;
        }
      }

      if (shouldProcess && commissionAmount > 0) {
        // Create commission record
        const commissionRecord = await AffiCommissionRecord.create({
          affiliateId: referral.affiliateId,
          referralId: referral._id,
          referredUserId: referral.referredUserId,
          amount: commissionAmount,
          period: currentPeriod,
          productType: referral.productType,
          productName,
          subscriptionType: referral.subscriptionType,
          status: "pending",
        });

        // Update affiliate earnings
        await Affiliate.findByIdAndUpdate(referral.affiliateId, {
          $inc: {
            pendingEarnings: commissionAmount,
            totalEarnings: commissionAmount,
          },
        });

        // Update referral
        referral.totalCommissionEarned += commissionAmount;
        referral.lastCommissionDate = currentDate;

        // Set next commission date
        const nextDate = new Date(currentDate);
        if (referral.subscriptionType === "monthly") {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
        referral.nextCommissionDate = nextDate;

        // Check if commission period is completed
        if (referral.monthsRemaining === 0 && referral.yearsRemaining === 0) {
          referral.status = "completed";
          referral.completionDate = currentDate;
        }

        await referral.save();

        commissionsProcessed.push({
          referralId: referral._id,
          commission: commissionAmount,
          product: productName,
        });

        processedCount++;
        totalCommission += commissionAmount;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} referrals with $${totalCommission.toFixed(
        2
      )} total commission`,
      processedCount,
      totalCommission,
      period: currentPeriod,
      commissions: commissionsProcessed,
    });
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
