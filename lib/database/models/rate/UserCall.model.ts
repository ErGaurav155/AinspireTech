// app/database/models/rate/UserCall.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserCall extends Document {
  userId: string;
  clerkId: string;
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
  };
}

const UserCallSchema = new Schema<IUserCall>(
  {
    userId: { type: String, required: true, index: true },
    clerkId: { type: String, required: true, index: true },
    count: { type: Number, default: 0 },
    currentWindow: { type: String, default: "" },
    windowStartHour: { type: Number, default: -1 },
    subscriptionLimit: { type: Number, default: 500 }, // Default to starter plan
    lastUpdated: { type: Date, default: Date.now },
    metadata: {
      subscriptionType: { type: String, default: "Insta-Automation-Starter" },
      accountLimit: { type: Number, default: 1 },
      replyLimit: { type: Number, default: 500 },
      accountsUsed: [{ type: String }],
      totalDmCount: { type: Number, default: 0 },
      totalCommentCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
UserCallSchema.index({ clerkId: 1, currentWindow: 1 });
UserCallSchema.index({ lastUpdated: 1 });

export const UserCall: Model<IUserCall> =
  mongoose.models?.UserCall ||
  mongoose.model<IUserCall>("UserCall", UserCallSchema);
