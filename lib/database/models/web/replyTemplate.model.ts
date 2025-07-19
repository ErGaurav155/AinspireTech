import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReplyTemplate extends Document {
  clerkId: string;
  chatbotId: mongoose.Types.ObjectId;
  chatbotType:
    | "chatbot-customer-support"
    | "chatbot-e-commerce"
    | "chatbot-lead-generation"
    | "chatbot-education";
  name: string;
  triggers: string[];
  response: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReplyTemplateSchema = new Schema<IReplyTemplate>(
  {
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
        "chatbot-customer-support",
        "chatbot-e-commerce",
        "chatbot-lead-generation",
        "chatbot-education",
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
ReplyTemplateSchema.index({ chatbotType: 1, isActive: 1 });
ReplyTemplateSchema.index({ name: "text", triggers: "text", response: "text" });

const WebReplyTemplate =
  mongoose.models?.ReplyTemplate ||
  mongoose.model<IReplyTemplate>("WebReplyTemplate", ReplyTemplateSchema);

export default WebReplyTemplate;
