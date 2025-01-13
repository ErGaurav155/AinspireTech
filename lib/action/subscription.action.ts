"use server";

import Subscription from "@/lib/database/models/subscription.model";
import { connectToDatabase } from "@/lib/database/mongoose";

export const getSubscriptionInfo = async (userId: string) => {
  try {
    await connectToDatabase(); // Ensure database connection

    // Filter subscriptions by userId and subscriptionStatus
    const subscriptions = await Subscription.find({
      userId,

      subscriptionStatus: "active", // Only fetch active subscriptions
    });

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No active subscriptions found");
      return []; // Return an empty array if no active subscriptions
    }

    return JSON.parse(JSON.stringify(subscriptions)); // Serialize the response for frontend
  } catch (error: any) {
    console.error("Error retrieving subscription info:", error.message);
    throw new Error("Failed to retrieve subscription info.");
  }
};
export const getAgentSubscriptionInfo = async (
  userId: string,
  agentId: string
) => {
  try {
    await connectToDatabase(); // Ensure database connection

    // Filter subscriptions by userId and subscriptionStatus
    const subscriptions = await Subscription.find({
      userId,
      productId: agentId,
      subscriptionStatus: "active", // Only fetch active subscriptions
    });

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No active subscriptions found");
      return []; // Return an empty array if no active subscriptions
    }

    return JSON.parse(JSON.stringify(subscriptions)); // Serialize the response for frontend
  } catch (error: any) {
    console.error("Error retrieving subscription info:", error.message);
    throw new Error("Failed to retrieve subscription info.");
  }
};
