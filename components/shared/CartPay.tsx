"use client";

import React from "react";
import {
  PayPalButtons,
  PayPalButtonsComponentProps,
  PayPalScriptProvider,
  ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import { createPayPalSubscription } from "@/lib/action/subscription.action";
import { useRouter } from "next/navigation";

interface CartPayProps {
  paypalplanId: string;
  productId: string;
  buyerId: string;
}

const NEXT_PUBLIC_PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

const CartPay = ({ paypalplanId, productId, buyerId }: CartPayProps) => {
  const router = useRouter();
  const initialOptions: ReactPayPalScriptOptions = {
    clientId: NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    vault: true,
    intent: "subscription",
  };

  const createSubscription: PayPalButtonsComponentProps["createSubscription"] =
    async (data, actions) => {
      const subscription = await actions.subscription.create({
        plan_id: paypalplanId,
        custom_id: buyerId,
      });

      return subscription;
    };

  const onApprove: PayPalButtonsComponentProps["onApprove"] = async (data) => {
    try {
      if (!data.subscriptionID) {
        throw new Error("Subscription ID not found");
      }

      await createPayPalSubscription(buyerId, productId, data.subscriptionID);
      if (productId === "chatbot-customer-support" || "chatbot-education") {
        router.push(
          `/WebsiteOnboarding?userId=${buyerId}&agentId=${productId}&subscriptionId=${data.subscriptionID}`
        );
      } else {
        router.push("/UserDashboard");
      }
      window.location.assign("/UserDashboard");
    } catch (error) {
      console.error("Error approving subscription:", error);
      window.location.assign("/");
    }
  };

  const onCancel: PayPalButtonsComponentProps["onCancel"] = () => {
    window.location.assign("/");
  };

  const onError: PayPalButtonsComponentProps["onError"] = (err) => {
    console.error("PayPal error:", err);
    window.location.assign("/");
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        createSubscription={createSubscription}
        onApprove={onApprove}
        onCancel={onCancel}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
};

export default CartPay;
