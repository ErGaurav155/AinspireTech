import mongoose, { Schema, Document } from "mongoose";

export interface IAnalytics extends Document {
  accountId: mongoose.Types.ObjectId;
  date: Date;
  totalReplies: number;
  successfulReplies: number;
  failedReplies: number;
  avgResponseTime: number;
  engagementRate: number;
  topTemplates: Array<{
    templateId: mongoose.Types.ObjectId;
    usageCount: number;
  }>;
  commentsProcessed: number;
  newFollowers: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    totalReplies: {
      type: Number,
      default: 0,
    },
    successfulReplies: {
      type: Number,
      default: 0,
    },
    failedReplies: {
      type: Number,
      default: 0,
    },
    avgResponseTime: {
      type: Number,
      default: 0,
    },
    engagementRate: {
      type: Number,
      default: 0,
    },
    topTemplates: [
      {
        templateId: {
          type: Schema.Types.ObjectId,
          ref: "ReplyTemplate",
        },
        usageCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    commentsProcessed: {
      type: Number,
      default: 0,
    },
    newFollowers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
AnalyticsSchema.index({ accountId: 1, date: 1 }, { unique: true });

const InstaAnalytics =
  mongoose.models.InstaAnalytics ||
  mongoose.model<IAnalytics>("InstaAnalytics", AnalyticsSchema);
export default InstaAnalytics;
