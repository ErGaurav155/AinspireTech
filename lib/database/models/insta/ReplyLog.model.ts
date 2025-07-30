import mongoose, { Schema, Document } from "mongoose";

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
  timestamp: Date;
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
    timestamp: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const InstaReplyLog =
  mongoose.models?.InstaReplyLog ||
  mongoose.model<IReplyLog>("InstaReplyLog", ReplyLogSchema);
export default InstaReplyLog;
