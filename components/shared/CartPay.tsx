"use client";
import React, { useState } from "react";

import {
  PayPalButtons,
  PayPalButtonsComponentProps,
  PayPalScriptProvider,
  ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import {
  createPayPalSubscription,
  setSubsciptionActive,
} from "@/lib/action/subscription.action";
interface CartPayProps {
  paypalplanId: string;
  productId: string;
  amount: number;
  buyerId: string;
}
const NEXT_PUBLIC_PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

const CartPay = ({
  paypalplanId,
  productId,

  buyerId,
}: CartPayProps) => {
  const initialOptions: ReactPayPalScriptOptions = {
    clientId: NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    vault: true,
    intent: "subscription",
  };

  const createSubscription: PayPalButtonsComponentProps["createSubscription"] =
    async (data, actions) => {
      const createSubscription = await actions.subscription.create({
        plan_id: paypalplanId,
        custom_id: buyerId,
      });
      if (!createSubscription) {
        throw new Error("Subscription Creation Failed");
      }
      const subscriptionId = createSubscription;
      await createPayPalSubscription(buyerId, productId, subscriptionId);
      return createSubscription;
    };

  const onApprove: PayPalButtonsComponentProps["onApprove"] = async (data) => {
    if (!data.subscriptionID) {
      window.location.assign("/");
      return;
    }
    await setSubsciptionActive(data.subscriptionID);
    window.location.assign("/UserDashboard");
  };
  const onCancel: PayPalButtonsComponentProps["onCancel"] = (data) => {
    window.location.assign("/");
  };
  const onError: PayPalButtonsComponentProps["onError"] = (err) => {
    window.location.assign("/");
  };
  console.log(paypalplanId);
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
