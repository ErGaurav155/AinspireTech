"use server";

import Plan from "@/lib/database/models/plan.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const plans: Record<
  string,
  {
    amount: number;
    currency: "INR"; // You can add more currencies if needed
    period: "monthly" | "daily" | "weekly" | "yearly"; // Restrict to allowed values
  }
> = {
  // AI Agents
  "ai-agent-customer-support": {
    amount: 100, // 300 INR
    currency: "INR",
    period: "monthly", // Monthly subscription
  },
  "ai-agent-e-commerce": {
    amount: 100, // 300 INR
    period: "monthly",
    currency: "INR",
  },
  "ai-agent-lead-generation": {
    amount: 100, // 300 INR
    period: "monthly",
    currency: "INR",
  },
  "ai-agent-education": {
    amount: 100, // 300 INR
    period: "monthly",
    currency: "INR",
  },

  // Chatbots
  "chatbot-customer-support": {
    amount: 100, // 100 INR
    period: "monthly",
    currency: "INR",
  },
  "chatbot-e-commerce": {
    amount: 100, // 100 INR
    period: "monthly",
    currency: "INR",
  },
  "chatbot-lead-generation": {
    amount: 100, // 100 INR
    period: "monthly",
    currency: "INR",
  },
  "chatbot-education": {
    amount: 100, // 100 INR
    period: "monthly",
    currency: "INR",
  },

  // Website Templates
  "template-pathology": {
    amount: 100, // 200 INR
    period: "monthly",
    currency: "INR",
  },
  "template-e-commerce": {
    amount: 100, // 200 INR
    period: "monthly",
    currency: "INR",
  },
  "template-business": {
    amount: 100, // 200 INR
    period: "monthly",
    currency: "INR",
  },
  "template-saas": {
    amount: 100, // 200 INR
    period: "monthly",
    currency: "INR",
  },
};

export async function createPlans() {
  await connectToDatabase(); // Connect to the database
  try {
    for (const [productId, details] of Object.entries(plans)) {
      const options = {
        period: details.period,
        interval: 1, // Monthly interval
        item: {
          name: `${productId} Subscription`,
          amount: details.amount,
          currency: details.currency,
        },
        notes: {
          productId: productId,
        },
      };

      const plan = await razorpay.plans.create(options);
      // Save the plan to the database
      const newPlan = new Plan({
        productId,
        planId: plan.id,
        name: `${productId} Subscription`,
        amount: details.amount,
        currency: details.currency,
        period: details.period,
      });
      await newPlan.save();
    }

    // You can store these createdPlans in a database or a file for future use.
  } catch (error: any) {
    console.error("Error creating plans:", error.message);
    throw new Error("Plan creation failed.");
  }
}

// Call this function once during deployment or setup
// createPlans();

export const getPlanInfo = async (productId: string) => {
  try {
    await connectToDatabase(); // Ensure database connection

    const plan = await Plan.findOne({ productId });
    if (!plan) {
      console.log("plan not found");
      throw new Error(`Plan with productId ${productId} not found.`);
    }

    return JSON.parse(JSON.stringify(plan));
  } catch (error: any) {
    console.error("Error retrieving plan info:", error.message);
    throw new Error("Failed to retrieve plan info.");
  }
};
