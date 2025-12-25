import mongoose, { Schema, Document, model } from "mongoose";

export interface IUserRateLimit extends Document {
  clerkId: string;
  windowStart: Date;
  callsMade: number;
  tier: "free" | "starter" | "grow" | "professional";
  tierLimit: number;
  isAutomationPaused: boolean;
  instagramAccounts: string[]; // Array of Instagram account IDs
  createdAt: Date;
  updatedAt: Date;
}

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
    callsMade: {
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
    instagramAccounts: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
UserRateLimitSchema.index({ clerkId: 1, windowStart: 1 });

const RateUserRateLimit =
  mongoose.models?.RateUserRateLimit ||
  model<IUserRateLimit>("RateUserRateLimit", UserRateLimitSchema);

export default RateUserRateLimit;
