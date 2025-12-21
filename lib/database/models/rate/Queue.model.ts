// app/database/models/rate/Queue.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQueueItem extends Document {
  accountId: string;
  userId: string;
  clerkId: string;
  actionType: "COMMENT" | "DM" | "POSTBACK" | "PROFILE" | "FOLLOW_CHECK";
  payload: any;
  priority: number; // 1-5, 1 being highest
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "QUEUED" | "HOLD";
  attempts: number;
  maxAttempts: number;
  scheduledFor: Date;
  windowLabel: string; // Which window this belongs to
  processedAt?: Date;
  result?: any;
  error?: string;
  metadata: {
    commentId?: string;
    mediaId?: string;
    recipientId?: string;
    templateId?: string;
    action?: string;
    commenterUsername?: string;
    originalTimestamp: Date; // When this was originally queued
    retryCount: number;
    source?: "RATE_LIMIT" | "SUBSCRIPTION_LIMIT" | "APP_LIMIT";
  };
  position: number; // FIFO position in queue
  createdAt: Date;
  updatedAt: Date;
}

const QueueItemSchema = new Schema<IQueueItem>(
  {
    accountId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    clerkId: { type: String, required: true, index: true },
    actionType: {
      type: String,
      enum: ["COMMENT", "DM", "POSTBACK", "PROFILE", "FOLLOW_CHECK"],
      required: true,
    },
    payload: { type: Schema.Types.Mixed, required: true },
    priority: { type: Number, default: 3, min: 1, max: 5 },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "QUEUED", "HOLD"],
      default: "PENDING",
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    scheduledFor: { type: Date, default: Date.now },
    windowLabel: { type: String, required: true, index: true },
    processedAt: { type: Date },
    result: { type: Schema.Types.Mixed },
    error: { type: String },
    metadata: {
      commentId: { type: String },
      mediaId: { type: String },
      recipientId: { type: String },
      templateId: { type: String },
      action: { type: String },
      commenterUsername: { type: String },
      originalTimestamp: { type: Date, default: Date.now },
      retryCount: { type: Number, default: 0 },
      source: {
        type: String,
        enum: ["RATE_LIMIT", "SUBSCRIPTION_LIMIT", "APP_LIMIT"],
      },
    },
    position: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient FIFO queries
QueueItemSchema.index({ windowLabel: 1, status: 1, priority: 1, position: 1 });
QueueItemSchema.index({ status: 1, scheduledFor: 1 });
QueueItemSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 * 7 }); // Auto-delete after 7 days

export const QueueItem: Model<IQueueItem> =
  mongoose.models?.QueueItem ||
  mongoose.model<IQueueItem>("QueueItem", QueueItemSchema);
