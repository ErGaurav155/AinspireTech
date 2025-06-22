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
    currency: "INR";
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
export async function createAllProducts() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Unable to fetch PayPal access token.");
  }

  try {
    for (const [productId, details] of Object.entries(plans)) {
      const productPayload = {
        name: productId,
        description: `${productId} Subscription Service`,
        type: "SERVICE",
        category: "SOFTWARE",
      };

      const response = await fetch(
        "https://api-m.sandbox.paypal.com/v1/catalogs/products",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "PayPal-Request-Id": `PRODUCT-${productId}-${Date.now()}`,
          },
          body: JSON.stringify(productPayload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          `Error creating product for ${productId}:`,
          JSON.stringify(data, null, 2)
        );
        continue; // Skip to the next product
      }

      console.log(`Product created successfully: ${data.id}`);
    }

    console.log("All products processed successfully.");
  } catch (error: any) {
    console.error("Error creating products:", error.message);
  }
}

export async function createRazerpayPlans() {
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
        razorpayplanId: plan.id,
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

export const getRazerpayPlanInfo = async (productId: string) => {
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

// export async function createPaypalPlans() {
//   await connectToDatabase(); // Connect to the database

//   try {
//     for (const [productId, details] of Object.entries(plans)) {
//       const newPlan = new Plan({
//         productId,
//         razorpaymonthlyplanId: "hi",
//         paypalmonthlyplanId: "hello",
//         razorpayyearlyplanId: "how",
//         paypalyearlyplanId: "you",
//       });

//       await newPlan.save();
//     }

//     return { success: true };
//   } catch (error: any) {
//     console.error("Error creating PayPal plans:", error.message);
//     throw new Error("Plan creation failed.");
//   }
// }

// Helper function to get PayPal access token
async function getAccessToken() {
  try {
    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
      }
    );

    const data = await response.json();

    return data.access_token;
  } catch (error) {
    console.error("Error fetching PayPal access token:", error);
    return null;
  }
}

// Call this function once during deployment or setup
// createPlans();
export const getPaypalPlanInfo = async (productId: string) => {
  // try {
  //   await connectToDatabase();

  //   const plans = await Plan.find();

  //   for (const plan of plans) {
  //     await Plan.updateOne(
  //       { _id: plan._id },
  //       {
  //         $set: {
  //           razorpaymonthlyplanId: "hi",
  //           paypalmonthlyplanId: "hello",
  //           razorpayyearlyplanId: "how",
  //           paypalyearlyplanId: "you",
  //         },
  //       },
  //       { strict: false }
  //     );
  //   }

  //   console.log("Plans updated successfully!");
  // } catch (error) {
  //   console.error("Error updating plans:", error);
  // }
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

// const axios = require("axios");

// export const createPlan = async () => {
//   const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
//   const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
//   const authUrl = "https://api-m.sandbox.paypal.com/v1/oauth2/token";
//   const createPlanUrl = "https://api-m.sandbox.paypal.com/v1/billing/plans";

//   try {
//     // Step 1: Get access token
//     const authResponse = await axios.post(
//       authUrl,
//       new URLSearchParams({ grant_type: "client_credentials" }),
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         auth: {
//           username: clientId,
//           password: clientSecret,
//         },
//       }
//     );

//     const accessToken = authResponse.data.access_token;

//     // Step 2: Create plan
//     const planData = {
//       product_id: "PROD-4UH72577M8920910H", // Replace with your product ID
//       name: "ai-agent-customer-support plan",
//       description: "Monthly subscription plan for premium services.",
//       status: "ACTIVE",
//       billing_cycles: [
//         {
//           frequency: {
//             interval_unit: "MONTH",
//             interval_count: 1,
//           },
//           tenure_type: "REGULAR",
//           sequence: 1,
//           total_cycles: 0, // 0 means infinite cycles
//           pricing_scheme: {
//             fixed_price: {
//               value: "100.00",
//               currency_code: "USD",
//             },
//           },
//         },
//       ],
//       payment_preferences: {
//         auto_bill_outstanding: true,
//         setup_fee: {
//           value: "0.00",
//           currency_code: "USD",
//         },
//         setup_fee_failure_action: "CONTINUE",
//         payment_failure_threshold: 3,
//       },
//     };

//     const planResponse = await axios.post(createPlanUrl, planData, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     console.log("Plan Created Successfully:", planResponse.data);
//     return planResponse;
//   } catch (error: any) {
//     console.error(
//       "Error creating plan:",
//       error.response?.data || error.message
//     );
//   }
// };
