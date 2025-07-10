import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebsiteData extends Document {
  clerkId: string;
  chatbotType:
    | "chatbot-customer-support"
    | "chatbot-e-commerce"
    | "chatbot-lead-generation"
    | "chatbot-education";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteDataSchema = new Schema<IWebsiteData>(
  {
    clerkId: {
      type: String,
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
    content: {
      type: String,
      required: true,
      validate: {
        validator: function (content: string) {
          return content.length > 0 && content.length <= 10000;
        },
        message: "Content must be between 1 and 10,000 characters",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
WebsiteDataSchema.index({ clerkId: 1 });
WebsiteDataSchema.index({ updatedAt: -1 });

const WebsiteData =
  mongoose.models.WebsiteData ||
  mongoose.model<IWebsiteData>("WebsiteData", WebsiteDataSchema);

export default WebsiteData;
