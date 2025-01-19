"use server";

import Subscription from "@/lib/database/models/subscription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "../utils";
import { revalidateTag } from "next/cache";

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
      return []; // Return an empty array if no active subscriptions
    }

    return JSON.parse(JSON.stringify(subscriptions)); // Serialize the response for frontend
  } catch (error: any) {
    console.error("Error retrieving subscription info:", error.message);
    throw new Error("Failed to retrieve subscription info.");
  }
};
export async function setSubscriptionActive(orderCreationId: string) {
  try {
    await connectToDatabase();

    const Subs = await Subscription.findOneAndUpdate(
      { subscriptionId: orderCreationId },
      { $set: { isScapped: true } },
      { new: true }
    );

    if (!Subs) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(Subs));
  } catch (error) {
    handleError(error);
  }

  revalidateTag("users");
}
