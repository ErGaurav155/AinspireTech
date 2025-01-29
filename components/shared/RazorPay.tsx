"use client";
import Script from "next/script";
import React, { useEffect } from "react";
import { toast } from "@/components/ui/use-toast"; // Assuming you have a toast utility
import { useRouter } from "next/navigation";
import { createTransaction } from "@/lib/action/transaction.action";
interface CheckoutProps {
  amount: number;
  razorpayplanId: string;
  buyerId: string;
  productId: string;
}
const RazerPay = ({
  amount,
  razorpayplanId,
  buyerId,
  productId,
}: CheckoutProps) => {
  const router = useRouter();
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
        body: JSON.stringify({ razorpayplanId, buyerId, productId }),
        headers: { "Content-Type": "application/json" },
      });

      const subscriptionCreate = await response.json();
      if (!subscriptionCreate.isOk) {
        throw new Error("Purchase Order is not created");
      }

      const paymentOptions = {
        key_id: process.env.RAZORPAY_KEY_ID!,
        amount: amount * 100,
        currency: "INR",
        name: "GK Services",
        description: "Thanks For Taking Our Services",
        subscription_id: subscriptionCreate.subsId,
        notes: {
          plan: razorpayplanId,
          buyerId: buyerId,
          amount: amount,
        },
        method: "upi", // Enable UPI as the default payment method
        upi: {
          recurring: "true", // Enables UPI AutoPay
        },
        handler: async function (response: any) {
          const data = {
            orderCreationId: subscriptionCreate.subsId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          const result = await fetch("/api/webhooks/razerpay/verify", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });

          const res = await result.json();

          if (res.isOk) {
            toast({
              title: "Payment Successful!",
              description: "Code are added to your Dashoboard",
              duration: 3000,
              className: "success-toast",
            });
            const transaction1 = {
              customerId: subscriptionCreate.subsId,
              amount: amount,
              plan: razorpayplanId,
              buyerId: buyerId,
              createdAt: new Date(),
            };
            await createTransaction(transaction1);
            router.push(
              `/WebsiteOnboarding?userId=${buyerId}&agentId=${productId}&subscriptionId=${subscriptionCreate.subsId}`
            );
          } else {
            toast({
              title: "Order canceled!",
              description: res.message,
              duration: 3000,
              className: "error-toast",
            });
          }
        },
        theme: {
          color: "#3399cc",
        },
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
    console.log(razorpayplanId);
    runCheckout();
  });
  return (
    <div>
      <div>
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
        />
      </div>
    </div>
  );
};

export default RazerPay;
