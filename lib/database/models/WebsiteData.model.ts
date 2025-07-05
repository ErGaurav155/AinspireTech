import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebsiteData extends Document {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  chatbotType:
    | "customer-support"
    | "e-commerce"
    | "lead-generation"
    | "instagram-automation";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteDataSchema = new Schema<IWebsiteData>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clerkId: {
      type: String,
      required: true,
      index: true,
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
      index: true,
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
WebsiteDataSchema.index({ userId: 1, chatbotType: 1 });
WebsiteDataSchema.index({ clerkId: 1 });
WebsiteDataSchema.index({ updatedAt: -1 });

const WebsiteData =
  mongoose.models.WebsiteData ||
  mongoose.model<IWebsiteData>("WebsiteData", WebsiteDataSchema);

export default WebsiteData;
