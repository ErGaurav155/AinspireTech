// app/database/models/rate/RateLimit.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRateLimit extends Document {
  accountId: string;
  userId: string;
  calls: number;
  windowStart: Date;
  isBlocked: boolean;
  blockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRateLimitLog extends Document {
  accountId: string;
  userId: string;
  action: string;
  timestamp: Date;
  remainingCalls: number;
  status: "SUCCESS" | "RATE_LIMITED" | "QUEUED";
  delayMs?: number;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    accountId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    calls: { type: Number, default: 0 },
    windowStart: { type: Date, default: Date.now },
    isBlocked: { type: Boolean, default: false },
    blockedUntil: { type: Date },
  },
  {
    timestamps: true,
  }
);

const RateLimitLogSchema = new Schema<IRateLimitLog>({
  accountId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  remainingCalls: { type: Number, required: true },
  status: {
    type: String,
    enum: ["SUCCESS", "RATE_LIMITED", "QUEUED"],
    required: true,
  },
  delayMs: { type: Number },
});

export const RateLimit: Model<IRateLimit> =
  mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);
export const RateLimitLog: Model<IRateLimitLog> =
  mongoose.models.RateLimitLog ||
  mongoose.model("RateLimitLog", RateLimitLogSchema);
