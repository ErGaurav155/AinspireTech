import mongoose, { Schema, Document, model } from "mongoose";

export interface IRateLimitQueue extends Document {
  clerkId: string;
  instagramAccountId: string;
  actionType: "comment_reply" | "dm" | "follow_check" | "media_fetch";
  actionPayload: any;
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
      index: true,
    },
    actionPayload: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index for automatic cleanup of queue items (2 days = 48 hours)
RateLimitQueueSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 172800, // 48 hours in seconds
  }
);

// Index for FIFO processing
RateLimitQueueSchema.index({ createdAt: 1 });

// Compound indexes for efficient queries
RateLimitQueueSchema.index({ clerkId: 1 });
RateLimitQueueSchema.index({ instagramAccountId: 1 });

const RateLimitQueue =
  mongoose.models?.RateLimitQueue ||
  model<IRateLimitQueue>("RateLimitQueue", RateLimitQueueSchema);

export default RateLimitQueue;
