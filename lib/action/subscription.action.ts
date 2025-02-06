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

export async function setSubsciptionActive(orderCreationId: string) {
  try {
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // One month subscription
    await connectToDatabase();

    const Subs = await Subscription.findOneAndUpdate(
      { subscriptionId: orderCreationId },
      {
        $set: {
          subscriptionStatus: "active",
          subscriptionEndDate: subscriptionEndDate,
        },
      },
      { new: true }
    );

    if (!Subs) {
      throw new Error("No matching subscription found to update.");
    }

    return JSON.parse(JSON.stringify(Subs));
  } catch (error) {
    handleError(error);
  }
}

async function getAccessToken() {
  try {
    const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    const data = await response.json();

    return data.access_token;
  } catch (error) {
    console.error("Error fetching PayPal access token:", error);
    return null;
  }
}
export const cancelPayPalSubscription = async (
  subscriptionId: string,
  reason: string
) => {
  try {
    // Get PayPal access token from environment variables
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("Missing PayPal access token");
    }

    const response = await fetch(
      `https://api-m.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to cancel subscription");
    }
    const isOk = await setSubsciptionCanceled(subscriptionId);
    if (!isOk) {
      throw new Error("Can not cancelled subscription.");
    }
    return { success: true, message: "Subscription cancelled successfully" };
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};
export async function setSubsciptionCanceled(subscriptionId: string) {
  try {
    await connectToDatabase();

    const Subs = await Subscription.findOneAndUpdate(
      { subscriptionId: subscriptionId },
      {
        $set: {
          subscriptionStatus: "cancelled",
        },
      },
      { new: true }
    );

    if (!Subs) {
      throw new Error("No matching subscription found to update.");
    }

    return JSON.parse(JSON.stringify(Subs));
  } catch (error) {
    handleError(error);
  }
}
