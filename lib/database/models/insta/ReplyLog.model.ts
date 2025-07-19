import mongoose, { Schema, Document } from "mongoose";

export interface IReplyLog extends Document {
  accountId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  commentId: string;
  commentText: string;
  replyText: string;
  success: boolean;
  responseTime: number;
  errorMessage?: string;
  mediaId: string;
  commenterUsername: string;
  timestamp: Date;
  createdAt: Date;
}

const ReplyLogSchema = new Schema<IReplyLog>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "ReplyTemplate",
      required: true,
    },
    commentId: {
      type: String,
      required: true,
      unique: true,
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
      index: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
    errorMessage: {
      type: String,
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
      index: true,
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
