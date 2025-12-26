import mongoose, { Schema, Document, model } from "mongoose";

export interface IAccountUsage {
  instagramAccountId: string;
  callsMade: number;
  lastCallAt: Date;
  accountUsername?: string;
  accountProfile?: string;
}

export interface IUserRateLimit extends Document {
  clerkId: string;
  windowStart: Date;
  totalCallsMade: number;
  tier: "free" | "starter" | "grow" | "professional";
  tierLimit: number;
  isAutomationPaused: boolean;
  accountUsage: IAccountUsage[]; // Detailed account usage
  createdAt: Date;
  updatedAt: Date;
}

const AccountUsageSchema = new Schema<IAccountUsage>(
  {
    instagramAccountId: {
      type: String,
      required: true,
    },
    callsMade: {
      type: Number,
      default: 0,
    },
    lastCallAt: {
      type: Date,
      default: Date.now,
    },
    accountUsername: {
      type: String,
    },
    accountProfile: {
      type: String,
    },
  },
  { _id: false }
);

const UserRateLimitSchema = new Schema<IUserRateLimit>(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    windowStart: {
      type: Date,
      required: true,
      index: true,
    },
    totalCallsMade: {
      type: Number,
      default: 0,
    },
    tier: {
      type: String,
      enum: ["free", "starter", "grow", "professional"],
      default: "free",
    },
    tierLimit: {
      type: Number,
      default: 100, // Free tier default
    },
    isAutomationPaused: {
      type: Boolean,
      default: false,
    },
    accountUsage: {
      type: [AccountUsageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
UserRateLimitSchema.index({ clerkId: 1, windowStart: 1 });
UserRateLimitSchema.index({ "accountUsage.instagramAccountId": 1 });

const RateUserRateLimit =
  mongoose.models?.RateUserRateLimit ||
  model<IUserRateLimit>("RateUserRateLimit", UserRateLimitSchema);

export default RateUserRateLimit;
