// models/Affiliate.ts
import { Schema, model, models, Document, Types } from "mongoose";

export interface IAffiliate extends Document {
  affiliateCode: string;
  clerkId: string;
  userId: Types.ObjectId;
  totalEarnings: number;
  earnedBalance: number;
  totalReferrals: number;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateSchema = new Schema<IAffiliate>(
  {
    affiliateCode: {
      type: String,
      required: true,
      unique: true,
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    earnedBalance: {
      type: Number,
      default: 0,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Affiliate =
  models?.Affiliate || model<IAffiliate>("Affiliate", AffiliateSchema);

// models/Referral.ts
export interface IReferral extends Document {
  affiliateId: Types.ObjectId;
  referredUserId: Types.ObjectId;
  subscriptionId: string;
  amount: number;
  commission: number;
  commissionPercentage: number;
  isPaid: boolean;
  paidAt?: Date;
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    commission: {
      type: Number,
      required: true,
    },
    commissionPercentage: {
      type: Number,
      default: 50, // 50%
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Referral =
  models?.Referral || model<IReferral>("Referral", ReferralSchema);
