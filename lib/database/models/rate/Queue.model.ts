// app/database/models/rate/Queue.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQueueItem extends Document {
  accountId: string;
  userId: string;
  actionType: "COMMENT" | "DM" | "POSTBACK" | "PROFILE" | "FOLLOW_CHECK";
  payload: any;
  priority: number; // 1 = high, 5 = low
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "QUEUED";
  attempts: number;
  maxAttempts: number;
  scheduledFor: Date;
  processedAt?: Date;
  result?: any;
  error?: string;
  metadata: {
    commentId?: string;
    mediaId?: string;
    recipientId?: string;
    templateId?: string;
    action?: string; // Added this
    commenterUsername?: string; // Added this
    rateLimitStatus?: {
      calls?: number;
      remaining?: number;
      isBlocked?: boolean;
      blockedUntil?: Date;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const QueueItemSchema = new Schema<IQueueItem>(
  {
    accountId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    actionType: {
      type: String,
      enum: ["COMMENT", "DM", "POSTBACK", "PROFILE", "FOLLOW_CHECK"],
      required: true,
    },
    payload: { type: Schema.Types.Mixed, required: true },
    priority: { type: Number, default: 3, min: 1, max: 5 },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "QUEUED"],
      default: "PENDING",
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    scheduledFor: { type: Date, default: Date.now },
    processedAt: { type: Date },
    result: { type: Schema.Types.Mixed },
    error: { type: String },
    metadata: {
      commentId: { type: String },
      mediaId: { type: String },
      recipientId: { type: String },
      templateId: { type: String },
      action: { type: String }, // Added this
      commenterUsername: { type: String }, // Added this
      rateLimitStatus: {
        calls: { type: Number },
        remaining: { type: Number },
        isBlocked: { type: Boolean },
        blockedUntil: { type: Date },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queue processing
QueueItemSchema.index({ status: 1, priority: 1, scheduledFor: 1 });
QueueItemSchema.index({ accountId: 1, status: 1 });
QueueItemSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // Auto-delete after 7 days

export const QueueItem: Model<IQueueItem> =
  mongoose.models.QueueItem || mongoose.model("QueueItem", QueueItemSchema);
