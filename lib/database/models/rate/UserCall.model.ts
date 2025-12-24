// app/database/models/rate/RateUserCall.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRateUserCall extends Document {
  userId: string;
  instagramId: string;
  count: number;
  currentWindow: string; // "10-11", "11-12"
  windowStartHour: number; // 10, 11, 12
  subscriptionLimit: number; // From subscription plan
  lastUpdated: Date;
  metadata: {
    subscriptionType: string;
    accountLimit: number;
    replyLimit: number;
    accountsUsed: string[]; // Instagram account IDs used
    totalDmCount: number;
    totalCommentCount: number;
    accountCalls: Map<
      string,
      {
        // Change this to Map
        calls: number;
        lastCall: Date;
        isBlocked: boolean;
        blockedUntil?: Date;
      }
    >;
  };
}

const RateUserCallSchema = new Schema<IRateUserCall>(
  {
    userId: { type: String, required: true, index: true },
    instagramId: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
    currentWindow: { type: String, default: "" },
    windowStartHour: { type: Number, default: -1 },
    subscriptionLimit: { type: Number, default: 500 },
    lastUpdated: { type: Date, default: Date.now },
    metadata: {
      subscriptionType: { type: String, default: "Insta-Automation-Starter" },
      accountLimit: { type: Number, default: 1 },
      replyLimit: { type: Number, default: 500 },
      accountsUsed: [{ type: String }],
      totalDmCount: { type: Number, default: 0 },
      totalCommentCount: { type: Number, default: 0 },
      accountCalls: {
        type: Map,
        of: new Schema({
          calls: { type: Number, default: 0 },
          lastCall: { type: Date, default: Date.now },
          isBlocked: { type: Boolean, default: false },
          blockedUntil: { type: Date },
        }),
        default: {},
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
RateUserCallSchema.index({ clerkId: 1, currentWindow: 1 });
RateUserCallSchema.index({ lastUpdated: 1 });

export const RateUserCall: Model<IRateUserCall> =
  mongoose.models?.RateUserCall ||
  mongoose.model<IRateUserCall>("RateUserCall", RateUserCallSchema);
