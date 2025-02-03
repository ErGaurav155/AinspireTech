"use server";

import Subscription from "@/lib/database/models/subscription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "../utils";
import { NextResponse } from "next/server";

export async function createRazerPaySubscription(
  buyerId: string,
  productId: string,
  subscriptionId: string
) {
  try {
    await connectToDatabase();

    const newSubscription = await Subscription.create({
      userId: buyerId,
      productId,
      subscriptionId,
      subscriptionStatus: "active",
      mode: "RazorPay",
    });
    if (!newSubscription) {
      throw new Error("Failed to create subscription.");
    }

    return JSON.parse(JSON.stringify(newSubscription));
  } catch (error) {
    handleError(error);
  }
}
export async function createPayPalSubscription(
  buyerId: string,
  productId: string,
  subscriptionId: string
) {
  try {
    await connectToDatabase();

    const newSubscription = await Subscription.create({
      userId: buyerId,
      productId,
      subscriptionId,
      subscriptionStatus: "active",
      mode: "PayPal",
    });
    await newSubscription.save();
    if (!newSubscription) {
      throw new Error("Failed to create subscription.");
    }

    return JSON.parse(JSON.stringify(newSubscription)); // Serialize the response for frontend
  } catch (error) {
    handleError(error);
  }
}

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
export async function setIsScrapped(orderCreationId: string) {
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
}

// export async function setSubsciptionActive(orderCreationId: string) {
//   try {
//     const subscriptionEndDate = new Date();
//     subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // One month subscription
//     await connectToDatabase();

//     const Subs = await Subscription.findOneAndUpdate(
//       { subscriptionId: orderCreationId },
//       {
//         $set: {
//           subscriptionStatus: "active",
//           subscriptionEndDate: subscriptionEndDate,
//         },
//       },
//       { new: true }
//     );

//     if (!Subs) {
//       throw new Error("No matching subscription found to update.");
//     }

//     return JSON.parse(JSON.stringify(Subs));
//   } catch (error) {
//     handleError(error);
//   }
// }
