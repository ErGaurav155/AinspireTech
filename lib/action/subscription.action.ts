"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "../utils";
import Razorpay from "razorpay";
import InstaSubscription from "@/lib/database/models/insta/InstaSubscription.model";
import WebSubscription from "../database/models/web/Websubcription.model";
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
export async function createWebRazerPaySubscription(
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
    const newSubscription = await WebSubscription.create({
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
export async function createInstaRazerPaySubscription(
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
    const newSubscription = await InstaSubscription.create({
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
export const getSubscription = async (
  chatbotId: string,
  selectedSubscriptionId: string
) => {
  try {
    await connectToDatabase(); // Ensure database connection

    // Filter subscriptions by userId and subscriptionStatus
    const subscriptions = await WebSubscription.find({
      chatbotId: chatbotId,
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
    const subscriptions = await WebSubscription.find({
      userId,
      productId: {
        $in: [
          "chatbot-customer-support",
          "chatbot-e-commerce",
          "chatbot-lead-generation",
          "chatbot-education",
        ],
      },
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
export const getInstaSubscriptionInfo = async (userId: string) => {
  try {
    await connectToDatabase(); // Ensure database connection

    const subscriptions = await InstaSubscription.find({
      clerkId: userId,
      chatbotType: {
        $in: [
          "Insta-Automation-Starter",
          "Insta-Automation-Grow",
          "Insta-Automation-Professional",
        ],
      },
      status: "active", // Only fetch active subscriptions
    });

    if (!subscriptions || subscriptions.length === 0) {
      return []; // Return an empty array if no active subscriptions
    }

    return JSON.parse(JSON.stringify(subscriptions)); // Serialize for frontend
  } catch (error: any) {
    console.error("Error retrieving subscription info:", error.message);
    throw new Error("Failed to retrieve subscription info.");
  }
};
export const getWebSubscriptionInfo = async (
  userId: string,
  agentId: string,
  billingCycle: string
) => {
  try {
    await connectToDatabase(); // Ensure database connection

    // Filter subscriptions by userId and subscriptionStatus
    const subscriptions = await WebSubscription.find({
      userId,
      productId: agentId,
      billingMode: billingCycle,
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
    const subscriptions = await WebSubscription.find({
      _id: userId,
      chatbotType: agentId,
      status: "active", // Only fetch active subscriptions
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
