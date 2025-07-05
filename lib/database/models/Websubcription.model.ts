import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  chatbotType:
    | "customer-support"
    | "e-commerce"
    | "lead-generation"
    | "instagram-automation";
  plan: string;
  billingCycle: "monthly" | "yearly";
  status: "active" | "cancelled" | "expired";
  createdAt: Date;
  expiresAt: Date;
  cancelledAt?: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
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
    plan: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    billingCycle: {
      type: String,
      required: true,
      enum: ["monthly", "yearly"],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "cancelled", "expired"],
      default: "active",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ clerkId: 1, status: 1 });
SubscriptionSchema.index({ chatbotType: 1, status: 1 });
SubscriptionSchema.index({ expiresAt: 1 });
SubscriptionSchema.index({ status: 1, expiresAt: 1 });

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

export default Subscription;
