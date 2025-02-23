import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    subscriptionId: {
      type: String,
      required: true,
      unique: true, // Ensure the order ID is unique
    },
    billingMode: {
      type: String,
      enum: ["monthly", "yearly"],
      reuired: true,
    },
    mode: {
      type: String,
      enum: ["PayPal", "RazorPay"],
      reuired: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },
    cancelReason: {
      type: String,
    },
    subscriptionEndDate: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "subscriptions", // Explicitly specify the collection name
    timestamps: true, // Automatically create `createdAt` and `updatedAt` fields
  }
);

// Ensure the model is only created once in development
const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);

export default Subscription;
