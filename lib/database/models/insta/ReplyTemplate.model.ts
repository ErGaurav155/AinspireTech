import mongoose, { Schema, Document } from "mongoose";

export interface IReplyTemplate extends Document {
  userId: string;
  accountId: string;
  mediaId: string;
  mediaUrl: string;
  name: string;
  reply: string[];
  content: string[];
  triggers: string[];
  isActive: boolean;
  priority: number;
  accountUsername: string;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReplyTemplateSchema = new Schema<IReplyTemplate>(
  {
    userId: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    mediaId: {
      type: String,
      unique: true,
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    reply: [
      {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },
    ],
    content: [
      {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },
    ],
    triggers: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },

    accountUsername: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsed: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const InstaReplyTemplate =
  mongoose.models?.InstaReplyTemplate ||
  mongoose.model<IReplyTemplate>("InstaReplyTemplate", ReplyTemplateSchema);
export default InstaReplyTemplate;
