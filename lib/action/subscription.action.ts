"use server";

import Subscription from "@/lib/database/models/subscription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "../utils";
import Razorpay from "razorpay";
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay credentials are not set in .env");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

function addYears(date: Date, years: number): Date {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
}
export async function createRazerPaySubscription(
  buyerId: string,
  productId: string,
  subscriptionId: string,
  billingCycle: string
) {
  try {
    await connectToDatabase();
    let endDate = new Date();
    if (billingCycle === "monthly") {
      endDate = addMonths(endDate, 1);
    } else if (billingCycle === "yearly") {
      endDate = addYears(endDate, 1);
    } else {
      throw new Error("Invalid billing cycle.");
    }
    const newSubscription = await Subscription.create({
      userId: buyerId,
      productId,
      subscriptionId,
      billingMode: billingCycle,
      subscriptionStatus: "active",
      mode: "RazorPay",
      subscriptionEndDate: endDate,
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
  subscriptionId: string,
  billingCycle: string
) {
  try {
    await connectToDatabase();
    let endDate = new Date();
    if (billingCycle === "monthly") {
      endDate = addMonths(endDate, 1);
    } else if (billingCycle === "yearly") {
      endDate = addYears(endDate, 1);
    } else {
      throw new Error("Invalid billing cycle.");
    }
    const newSubscription = await Subscription.create({
      userId: buyerId,
      productId,
      subscriptionId,
      billingMode: billingCycle,
      subscriptionStatus: "active",
      mode: "PayPal",
      subscriptionEndDate: endDate,
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

export const getSubscription = async (selectedSubscriptionId: string) => {
  try {
    await connectToDatabase(); // Ensure database connection

    // Filter subscriptions by userId and subscriptionStatus
    const subscriptions = await Subscription.findOne({
      subscriptionId: selectedSubscriptionId,
    });

    if (!subscriptions || subscriptions.length === 0) {
      throw new Error("No matching subscription found.");
    }

    return JSON.parse(JSON.stringify(subscriptions)); // Serialize the response for frontend
  } catch (error: any) {
    console.error("Error retrieving subscription info:", error.message);
    throw new Error("Failed to retrieve subscription info.");
  }
};
export const getSubscriptionInfo = async (userId: string) => {
  try {
    await connectToDatabase(); // Ensure database connection

    // Filter subscriptions by userId and subscriptionStatus
    const subscriptions = await Subscription.find({
      userId,

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

export async function setSubsciptionActive(
  orderCreationId: string,
  nextBillingDate: Date
) {
  try {
    await connectToDatabase();

    const Subs = await Subscription.findOneAndUpdate(
      { subscriptionId: orderCreationId },
      {
        $set: {
          subscriptionStatus: "active",
          subscriptionEndDate: nextBillingDate,
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
  reason: string,
  mode: string
) => {
  try {
    // Get PayPal access token from environment variables
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("Missing PayPal access token");
    }
    let res;
    if (mode === "Immediate") {
      res = await fetch(
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
    } else {
      res = await fetch(
        `https://api-m.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify([
            {
              op: "replace",
              path: "/auto_renewal",
              value: false,
            },
          ]),
        }
      );
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to cancel subscription");
    }
    const isOk = await setSubsciptionCanceled(subscriptionId, reason);
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
export async function cancelRazorPaySubscription(
  subscriptionId: string,
  reason: string,
  mode: string
) {
  try {
    let response;
    if (mode === "Immediate") {
      response = await razorpay.subscriptions.cancel(subscriptionId, false);
    } else {
      response = await razorpay.subscriptions.cancel(subscriptionId, true);
    }
    if (!response) {
      throw new Error("Failed to cancel subscription");
    }

    return { success: true, message: "Subscription cancelled successfully" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
export async function setSubsciptionCanceled(
  subscriptionId: string,
  reason: string
) {
  try {
    await connectToDatabase();

    const Subs = await Subscription.findOneAndUpdate(
      { subscriptionId: subscriptionId },
      {
        $set: {
          subscriptionStatus: "cancelled",
          cancelReason: reason,
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
