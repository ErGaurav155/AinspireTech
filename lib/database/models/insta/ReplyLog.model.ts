import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReplyLog extends Document {
  userId: string;
  accountId: string;
  templateId: string;
  templateName: string;
  commentId: string;
  commentText: string;
  replyText: string;
  success: boolean;
  responseTime: number;
  mediaId: string;
  commenterUsername: string;
  createdAt: Date;
}

const ReplyLogSchema = new Schema<IReplyLog>(
  {
    userId: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    templateId: {
      type: String,
      required: true,
    },
    templateName: {
      type: String,
      required: true,
    },
    commentId: {
      type: String,
      required: true,
    },
    commentText: {
      type: String,
      required: true,
    },
    replyText: {
      type: String,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
    mediaId: {
      type: String,
      required: true,
    },
    commenterUsername: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add TTL index to automatically delete documents after 3 hours
ReplyLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 10800 });

const InstaReplyLog: Model<IReplyLog> =
  mongoose.models?.InstaReplyLog ||
  mongoose.model<IReplyLog>("InstaReplyLog", ReplyLogSchema);

export default InstaReplyLog;
