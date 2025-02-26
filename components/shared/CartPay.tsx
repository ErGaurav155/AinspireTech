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
import { createTransaction } from "@/lib/action/transaction.action";

interface CartPayProps {
  paypalplanId: string;
  productId: string;
  buyerId: string;
  billingCycle: string;
  amount: number;
}

const NEXT_PUBLIC_PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

const CartPay = ({
  paypalplanId,
  productId,
  buyerId,
  billingCycle,
  amount,
}: CartPayProps) => {
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

      await createPayPalSubscription(
        buyerId,
        productId,
        data.subscriptionID,
        billingCycle
      );
      await createTransaction({
        customerId: data.subscriptionID,
        amount,
        plan: paypalplanId,
        buyerId,
        createdAt: new Date(),
      });
      if (
        productId === "chatbot-customer-support" ||
        productId === "chatbot-education"
      ) {
        router.push(
          `/WebsiteOnboarding?userId=${buyerId}&agentId=${productId}&subscriptionId=${data.subscriptionID}`
        );
      } else {
        router.push("/UserDashboard");
      }
      window.location.assign("/UserDashboard");
    } catch (error) {
      window.location.assign("/");
    }
  };

  const onCancel: PayPalButtonsComponentProps["onCancel"] = () => {
    window.location.assign("/");
  };

  const onError: PayPalButtonsComponentProps["onError"] = (err) => {
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
