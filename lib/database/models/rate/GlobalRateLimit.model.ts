// app/database/models/rate/RateGlobalRateLimit.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRateGlobalRateLimit extends Document {
  windowLabel: string; // "10-11", "11-12", etc.
  windowStartHour: number; // 10, 11, 12
  totalCalls: number;
  appLimit: number; // Global app limit for this window
  isActive: boolean;
  startedAt: Date;
  endsAt: Date;
  metadata: {
    accountsProcessed: string[]; // Account IDs processed in this window
    blockedAccounts: string[]; // Accounts that hit individual limits
    queueSize: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RateGlobalRateLimitSchema = new Schema<IRateGlobalRateLimit>(
  {
    windowLabel: { type: String, required: true, index: true },
    windowStartHour: { type: Number, required: true },
    totalCalls: { type: Number, default: 0 },
    appLimit: { type: Number, default: 10000 },
    isActive: { type: Boolean, default: true },
    startedAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    metadata: {
      accountsProcessed: [{ type: String }],
      blockedAccounts: [{ type: String }],
      queueSize: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// TTL index - auto delete after 2 hours
RateGlobalRateLimitSchema.index({ endsAt: 1 }, { expireAfterSeconds: 3600 });

export const RateGlobalRateLimit: Model<IRateGlobalRateLimit> =
  mongoose.models?.RateGlobalRateLimit ||
  mongoose.model<IRateGlobalRateLimit>(
    "RateGlobalRateLimit",
    RateGlobalRateLimitSchema
  );
