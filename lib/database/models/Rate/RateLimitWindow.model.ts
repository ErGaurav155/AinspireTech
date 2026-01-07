import mongoose, { Schema, Document, model } from "mongoose";

export interface IRateLimitWindow extends Document {
  windowStart: Date;
  windowEnd: Date;
  globalCalls: number;
  appLimit: number;
  accountsProcessed: number;
  isAutomationPaused: boolean; // New: Track if app automation is paused due to global limit
  status: "active" | "completed" | "processing";
  createdAt: Date;
  updatedAt: Date;
}

const RateLimitWindowSchema = new Schema<IRateLimitWindow>(
  {
    windowStart: {
      type: Date,
      required: true,
      index: true,
    },
    windowEnd: {
      type: Date,
      required: true,
      index: true,
    },
    globalCalls: {
      type: Number,
      default: 0,
    },
    appLimit: {
      type: Number,
      default: 0,
    },
    accountsProcessed: {
      type: Number,
      default: 0,
    },
    isAutomationPaused: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "completed", "processing"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const RateLimitWindow =
  mongoose.models?.RateLimitWindow ||
  model<IRateLimitWindow>("RateLimitWindow", RateLimitWindowSchema);

export default RateLimitWindow;
