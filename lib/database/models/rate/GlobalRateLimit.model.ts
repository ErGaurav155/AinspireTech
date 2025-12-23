// app/database/models/rate/GlobalRateLimit.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGlobalRateLimit extends Document {
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

const GlobalRateLimitSchema = new Schema<IGlobalRateLimit>(
  {
    windowLabel: { type: String, required: true, index: true },
    windowStartHour: { type: Number, required: true },
    totalCalls: { type: Number, default: 0 },
    appLimit: { type: Number, default: 10000 }, // Default global limit
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

// TTL index - auto delete after 1 hours
GlobalRateLimitSchema.index({ endsAt: 1 }, { expireAfterSeconds: 3600 });

export const RateGlobalRateLimit: Model<IGlobalRateLimit> =
  mongoose.models?.RateGlobalRateLimit ||
  mongoose.model<IGlobalRateLimit>(
    "RateGlobalRateLimit",
    GlobalRateLimitSchema
  );
