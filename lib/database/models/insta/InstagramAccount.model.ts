// app/database/models/insta/InstagramAccount.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRateLimitInfo {
  calls: number;
  remaining: number;
  isBlocked: boolean;
  blockedUntil?: Date;
  resetAt?: Date;
  windowStart: Date;
  lastUpdated: Date;
}

export interface IInstagramAccount extends Document {
  userId: string;
  instagramId: string;
  userInstaId: string;
  username: string;
  accessToken: string;
  profilePicture?: string;
  isActive?: boolean;
  accountReply: number;
  lastTokenRefresh?: Date;
  expiresAt?: Date;
  rateLimitInfo?: IRateLimitInfo;
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RateLimitInfoSchema = new Schema(
  {
    calls: { type: Number, default: 0 },
    remaining: { type: Number, default: 180 },
    isBlocked: { type: Boolean, default: false },
    blockedUntil: { type: Date },
    resetAt: { type: Date },
    windowStart: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const InstagramAccountSchema = new Schema<IInstagramAccount>(
  {
    userId: {
      type: String,
      required: true,
    },
    instagramId: { type: String, unique: true, sparse: true },
    userInstaId: { type: String, unique: true, sparse: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    accessToken: String,
    profilePicture: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    accountReply: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
    },
    rateLimitInfo: {
      type: RateLimitInfoSchema,
      default: () => ({
        calls: 0,
        remaining: 180,
        isBlocked: false,
        windowStart: new Date(),
        lastUpdated: new Date(),
      }),
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 24 * 1000),
    },
    lastTokenRefresh: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for rate limiting queries
InstagramAccountSchema.index({
  "rateLimitInfo.isBlocked": 1,
  "rateLimitInfo.blockedUntil": 1,
});
InstagramAccountSchema.index({ "rateLimitInfo.windowStart": 1 });

const InstagramAccount =
  mongoose.models?.InstagramAccount ||
  mongoose.model<IInstagramAccount>("InstagramAccount", InstagramAccountSchema);

export default InstagramAccount;
