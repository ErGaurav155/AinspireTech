import mongoose, { Schema, Document, model } from "mongoose";

export interface IRateLimitQueue extends Document {
  clerkId: string;
  instagramAccountId: string;
  actionType: "comment_reply" | "dm" | "follow_check" | "media_fetch";
  actionPayload: any;
  priority: number; // Lower number = higher priority
  status: "pending" | "processing" | "completed" | "failed";
  retryCount: number;
  maxRetries: number;
  windowStart: Date; // The window when this was queued
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
  errorMessage?: string;
  metadata?: {
    commentId?: string;
    mediaId?: string;
    userId?: string;
    username?: string;
    reason?: "user_limit" | "app_limit" | "error"; // Why it was queued
  };
  createdAt: Date;
  updatedAt: Date;
}

const RateLimitQueueSchema = new Schema<IRateLimitQueue>(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    instagramAccountId: {
      type: String,
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: ["comment_reply", "dm", "follow_check", "media_fetch"],
      required: true,
    },
    actionPayload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    priority: {
      type: Number,
      default: 5, // Default medium priority
      min: 1,
      max: 10,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    windowStart: {
      type: Date,
      required: true,
      index: true,
    },
    processingStartedAt: {
      type: Date,
    },
    processingCompletedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      commentId: String,
      mediaId: String,
      userId: String,
      username: String,
      reason: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queue queries
RateLimitQueueSchema.index({ status: 1, priority: 1, createdAt: 1 });
RateLimitQueueSchema.index({ clerkId: 1, status: 1 });
RateLimitQueueSchema.index({ windowStart: 1, status: 1 });
RateLimitQueueSchema.index({ instagramAccountId: 1, status: 1 });

const RateLimitQueue =
  mongoose.models?.RateLimitQueue ||
  model<IRateLimitQueue>("RateLimitQueue", RateLimitQueueSchema);

export default RateLimitQueue;
