import mongoose, { Schema, Document } from "mongoose";

export interface IReplyTemplate extends Document {
  accountId: mongoose.Types.ObjectId;
  name: string;
  content: string;
  triggers: string[];
  isActive: boolean;
  priority: number;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReplyTemplateSchema = new Schema<IReplyTemplate>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
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
      default: 1,
      min: 1,
      max: 10,
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
  mongoose.models.InstaReplyTemplate ||
  mongoose.model<IReplyTemplate>("InstaReplyTemplate", ReplyTemplateSchema);
export default InstaReplyTemplate;
