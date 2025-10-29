// lib/action/affiliate.action.ts
"use server";

import { Types } from "mongoose";
import { connectToDatabase } from "../database/mongoose";
import { Affiliate, Referral } from "../database/models/Affiliate";
import User from "../database/models/user.model";

export async function createOrGetAffiliate(clerkId: string, userId: string) {
  try {
    await connectToDatabase();

    let affiliate = await Affiliate.findOne({ clerkId });

    if (!affiliate) {
      const affiliateCode = generateAffiliateCode();
      affiliate = await Affiliate.create({
        affiliateCode,
        clerkId,
        userId: new Types.ObjectId(userId),
      });
    }

    return JSON.parse(JSON.stringify(affiliate));
  } catch (error) {
    console.error("Error creating/getting affiliate:", error);
    throw error;
  }
}

export async function trackReferral(
  referredUserId: string,
  affiliateCode: string,
  subscriptionId: string,
  amount: number
) {
  try {
    await connectToDatabase();

    // Find affiliate by code
    const affiliate = await Affiliate.findOne({ affiliateCode });
    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    // Check if this user was already referred (prevent multiple commissions)
    const user = await User.findById(referredUserId);
    if (user?.hasUsedReferral) {
      throw new Error("User already used a referral");
    }

    // Check if referral already exists for this subscription
    const existingReferral = await Referral.findOne({ subscriptionId });
    if (existingReferral) {
      throw new Error("Referral already processed for this subscription");
    }

    const commission = amount * 0.5; // 50% commission

    // Create referral record
    const referral = await Referral.create({
      affiliateId: affiliate._id,
      referredUserId: new Types.ObjectId(referredUserId),
      subscriptionId,
      amount,
      commission,
      commissionPercentage: 50,
    });

    // Update affiliate stats
    await Affiliate.findByIdAndUpdate(affiliate._id, {
      $inc: {
        totalEarnings: commission,
        earnedBalance: commission,
        totalReferrals: 1,
      },
    });

    // Mark user as having used referral
    await User.findByIdAndUpdate(referredUserId, {
      referredBy: affiliate._id,
      hasUsedReferral: true,
    });

    return JSON.parse(JSON.stringify(referral));
  } catch (error) {
    console.error("Error tracking referral:", error);
    throw error;
  }
}

export async function getAffiliateStats(clerkId: string) {
  try {
    await connectToDatabase();

    const affiliate = await Affiliate.findOne({ clerkId }).populate("userId");

    if (!affiliate) {
      return null;
    }

    const referrals = await Referral.find({ affiliateId: affiliate._id })
      .populate("referredUserId")
      .sort({ createdAt: -1 });

    return JSON.parse(
      JSON.stringify({
        affiliate,
        referrals,
      })
    );
  } catch (error) {
    console.error("Error getting affiliate stats:", error);
    throw error;
  }
}

function generateAffiliateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
