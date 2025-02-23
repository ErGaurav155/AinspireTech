"use client";
import Script from "next/script";
import React, { useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/lib/action/transaction.action";
import { createRazerPaySubscription } from "@/lib/action/subscription.action";

interface CheckoutProps {
  amount: number;
  razorpayplanId: string;
  buyerId: string;
  productId: string;
  billingCycle: string;
}

const RazerPay = ({
  amount,
  razorpayplanId,
  buyerId,
  productId,
  billingCycle,
}: CheckoutProps) => {
  const router = useRouter();
  const hasRun = useRef(false); // ✅ Track if runCheckout has executed

  const runCheckout = async () => {
    toast({
      title: "For International Users Use Paypal",
      description: "Buy Credits > Wallet > Paypal",
      duration: 3000,
      className: "success-toast z-55",
    });

    try {
      const response = await fetch("/api/webhooks/razerpay/subscription", {
        method: "POST",
        body: JSON.stringify({
          razorpayplanId,
          buyerId,
          productId,
          amount,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const subscriptionCreate = await response.json();

      if (!subscriptionCreate.isOk) {
        throw new Error("Purchase Order is not created");
      }

      const paymentOptions = {
        key_id: process.env.RAZORPAY_KEY_ID!,
        amount: amount * 100, // Amount in paise
        currency: "INR",
        name: "GK Services",
        description: "Thanks For Taking Our Services",
        subscription_id: subscriptionCreate.subsId,
        notes: {
          plan: razorpayplanId,
          buyerId: buyerId,
          amount: amount,
        },

        handler: async function (response: any) {
          const data = {
            subscription_id: subscriptionCreate.subsId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          const result = await fetch("/api/webhooks/razerpay/verify", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });

          const res = await result.json();

          if (res.success) {
            toast({
              title: "Payment Successful!",
              description: "Code added to your Dashboard",
              duration: 3000,
              className: "success-toast",
            });

            await createRazerPaySubscription(
              buyerId,
              productId,
              subscriptionCreate.subsId,
              billingCycle
            );

            await createTransaction({
              customerId: subscriptionCreate.subsId,
              amount,
              plan: razorpayplanId,
              buyerId,
              createdAt: new Date(),
            });
            if (
              productId === "chatbot-customer-support" ||
              productId === "chatbot-education"
            ) {
              router.push(
                `/WebsiteOnboarding?userId=${buyerId}&agentId=${productId}&subscriptionId=${subscriptionCreate.subsId}`
              );
            } else {
              router.push("/UserDashboard");
            }
          } else {
            toast({
              title: "Order canceled!",
              description: res.message,
              duration: 3000,
              className: "error-toast",
            });
          }
        },
        theme: { color: "#3399cc" },
      };

      const paymentObject = new (window as any).Razorpay(paymentOptions);
      paymentObject.on("payment.failed", function (response: any) {
        toast({
          title: "Order failed!",
          description: response.error.description,
          duration: 3000,
          className: "error-toast",
        });
      });

      paymentObject.open();
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast({
        title: "Checkout Error",
        description: error.message,
        duration: 3000,
        className: "error-toast",
      });
    }
  };

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true; // ✅ Mark as executed
      runCheckout(); // ✅ Runs only once
    }
  });

  return (
    <div>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
    </div>
  );
};

export default RazerPay;
