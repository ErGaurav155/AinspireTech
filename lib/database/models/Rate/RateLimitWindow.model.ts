import mongoose, { Schema, Document, model } from "mongoose";

export interface IRateLimitWindow extends Document {
  windowStart: Date;
  windowEnd: Date;
  globalCalls: number;
  appLimit: number;
  accountsProcessed: number;
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

// Compound index for window queries
RateLimitWindowSchema.index({ windowStart: 1, windowEnd: 1 });

const RateLimitWindow =
  mongoose.models?.RateLimitWindow ||
  model<IRateLimitWindow>("RateLimitWindow", RateLimitWindowSchema);

export default RateLimitWindow;
