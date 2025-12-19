// app/database/models/rate/Queue.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQueueItem extends Document {
  accountId: string;
  userId: string;
  actionType: "COMMENT" | "DM" | "POSTBACK" | "PROFILE" | "FOLLOW_CHECK";
  payload: any;
  priority: number;
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
    action?: string;
    commenterUsername?: string;
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
      action: { type: String },
      commenterUsername: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const QueueItem: Model<IQueueItem> =
  mongoose.models.QueueItem ||
  mongoose.model<IQueueItem>("QueueItem", QueueItemSchema);
