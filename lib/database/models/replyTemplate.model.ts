import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReplyTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  chatbotId: mongoose.Types.ObjectId;
  chatbotType:
    | "customer-support"
    | "e-commerce"
    | "lead-generation"
    | "instagram-automation";
  name: string;
  triggers: string[];
  response: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReplyTemplateSchema = new Schema<IReplyTemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clerkId: {
      type: String,
      required: true,
    },
    chatbotId: {
      type: Schema.Types.ObjectId,
      ref: "Chatbot",
      required: true,
    },
    chatbotType: {
      type: String,
      required: true,
      enum: [
        "customer-support",
        "e-commerce",
        "lead-generation",
        "instagram-automation",
      ],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    triggers: [
      {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: 2,
        maxlength: 50,
      },
    ],
    response: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
ReplyTemplateSchema.index({ userId: 1, chatbotId: 1 });
ReplyTemplateSchema.index({ chatbotType: 1, isActive: 1 });
ReplyTemplateSchema.index({ name: "text", triggers: "text", response: "text" });

const WebReplyTemplate =
  mongoose.models.ReplyTemplate ||
  mongoose.model<IReplyTemplate>("WebReplyTemplate", ReplyTemplateSchema);

export default WebReplyTemplate;
