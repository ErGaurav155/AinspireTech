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
    subscriptionStatus: {
      type: String,
      enum: ["pending", "active", "expired"],
      default: "pending", // Default status is pending
    },
    subscriptionEndDate: {
      type: Date,
      default: null, // Null until payment is confirmed
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set to the current date
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
