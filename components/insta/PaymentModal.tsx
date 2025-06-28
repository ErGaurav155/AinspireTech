"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, MapPin, Globe } from "lucide-react";
import { PricingPlan } from "@/types/types";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createRazerPaySubscription } from "@/lib/action/subscription.action";

import React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import OTPVerification from "../shared/OTPVerification";
import { countryCodes } from "@/constant";
import Script from "next/script";
import { getRazerpayPlanInfo } from "@/lib/action/plan.action";
import { toast } from "../ui/use-toast";
import AddAccount from "./AddAccount";
import { InstagramConnectDialog } from "./InstagramConnect";
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricingPlan | null;
  billingCycle: "monthly" | "yearly";
  buyerId: string;
  isSubscribed: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
const phoneFormSchema = z.object({
  MobileNumber: z
    .string()
    .min(10, "MOBILE number is required")
    .regex(/^\d+$/, "invalid number"),
});

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  billingCycle,
  buyerId,
  isSubscribed,
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "paypal">(
    "razorpay"
  );

  const [feedInfo, setFeedInfo] = useState(false);
  const razorpayplanId = useRef<string | null>(null);
  const router = useRouter();

  if (!plan) return null;

  const price =
    billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const inrPrice = Math.round(price * 87); // Approximate INR to USD conversion

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/webhooks/razerpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          razorpayplanId: razorpayplanId.current,
          productId: plan.id,
          buyerId,
        }),
      });

      const subscriptionCreate = await response.json();
      if (!subscriptionCreate.isOk) {
        throw new Error("Purchase Order is not created");
      }
      const options = {
        key_id: process.env.RAZORPAY_KEY_ID!,
        amount: price * 100,
        currency: "INR",
        name: "GK Services",
        description: `${plan.name} Plan - ${billingCycle}`,
        subscription_id: subscriptionCreate.subsId,
        notes: {
          productId: razorpayplanId.current,
          buyerId: buyerId,
          amount: price,
        },
        handler: async (response: any) => {
          const data = {
            subscription_id: subscriptionCreate.subsId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          const verifyResponse = await fetch("/api/webhooks/razerpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const res = await verifyResponse.json();

          if (res.success) {
            toast({
              title: "Payment Successful!",
              description: "Code added to your Dashboard",
              duration: 3000,
              className: "success-toast",
            });

            await createRazerPaySubscription(
              buyerId,
              plan.id,
              subscriptionCreate.subsId,
              billingCycle
            );

            router.push("/insta/dashboard");
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
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        toast({
          title: "Order failed!",
          description: response.error.description,
          duration: 3000,
          className: "error-toast",
        });
      });
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Checkout Error",
        description: error.message,
        duration: 3000,
        className: "error-toast",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onCheckout = async () => {
    try {
      // Fetch plan data
      const info = await getRazerpayPlanInfo(plan.id);
      if (!info.razorpaymonthlyplanId || !info.razorpayyearlyplanId) {
        router.push("/");
        throw new Error("Plan not found");
      }

      if (billingCycle === "monthly") {
        razorpayplanId.current = info.razorpaymonthlyplanId;
      } else if (billingCycle === "yearly") {
        razorpayplanId.current = info.razorpayyearlyplanId;
      } else {
        router.push("/");
        return false;
      }
    } catch (error) {
      console.error("Error fetching plan info:", error);
      return false;
    } finally {
      setFeedInfo(true);
      onClose();
      // await handleRazorpayPayment();
    }
  };
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-[#0a0a0a]/90 backdrop-blur-lg border border-[#333] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-white font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
              Complete Your Subscription
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Plan Summary */}
            <div className="bg-[#1a1a1a]/50 backdrop-blur-sm p-4 rounded-xl border border-[#333]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-300">
                  {plan.name} Plan
                </span>
                <Badge className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-white">
                  {billingCycle}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xl font-bold mt-4">
                <span className="text-gray-300">Total</span>
                <span className="text-white">${price.toLocaleString()}</span>
              </div>
              {billingCycle === "yearly" && (
                <p className="text-sm text-green-400 mt-3 font-medium">
                  Save ₹
                  {(plan.monthlyPrice * 12 - plan.yearlyPrice).toLocaleString()}{" "}
                  with yearly billing
                </p>
              )}
            </div>

            <Separator className="bg-[#333]" />

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-300 text-center">
                Price in <span className="text-[#00F0FF]">USD</span> and{" "}
                <span className="text-[#B026FF]">INR</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 border ${
                    paymentMethod === "razorpay"
                      ? "border-[#00F0FF] bg-[#00F0FF]/10"
                      : "border-[#333] hover:border-[#00F0FF]/50"
                  }`}
                  onClick={() => setPaymentMethod("razorpay")}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#00F0FF]" />
                    <span className="text-xs font-medium text-gray-300">
                      International
                    </span>
                  </div>
                  <span className="text-md font-medium text-white mt-2">
                    Razorpay
                  </span>
                  <span className="font-bold text-white">
                    ${price.toLocaleString()}
                  </span>
                </div>

                <div
                  className={`rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 border ${
                    paymentMethod === "paypal"
                      ? "border-[#B026FF] bg-[#B026FF]/10"
                      : "border-[#333] hover:border-[#B026FF]/50"
                  }`}
                  onClick={() => setPaymentMethod("paypal")}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#B026FF]" />
                    <span className="text-xs font-medium text-gray-300">
                      India
                    </span>
                  </div>
                  <span className="text-md font-medium text-white mt-2">
                    Razorpay
                  </span>
                  <span className="font-bold text-white">
                    ₹{inrPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <SignedIn>
              {isSubscribed ? (
                <Button className="w-full py-6 rounded-full font-bold text-lg bg-gradient-to-r from-[#33e49d] to-[#044624] hover:from-[#79b59b]/90 hover:to-[#30d472]/90">
                  Subscribed
                </Button>
              ) : (
                <Button
                  className="w-full py-6 rounded-full font-bold text-lg bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90"
                  onClick={() => onCheckout()}
                  disabled={isProcessing}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  {isProcessing ? "Processing..." : `Pay with Razorpay`}
                </Button>
              )}
            </SignedIn>
            <SignedOut>
              <Button
                className="w-full min-w- py-6 rounded-full font-bold text-lg bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90"
                onClick={() => {
                  router.push("/sign-in?redirect_to=/pricing");
                }}
              >
                Sign-in
              </Button>
            </SignedOut>
            {isSubscribed ? (
              <p className="text-xs text-gray-400 text-center px-4">
                Your subscription will be activated immediately after successful
                payment. You can cancel anytime from your dashboard.
              </p>
            ) : (
              <p className="text-xs text-gray-400 text-center px-4">
                You had already take one of those subscription.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {feedInfo && (
        // <AddAccount
        //   onVerified={() => {
        //     setFeedInfo(false);
        //     onClose();
        //     handleRazorpayPayment();
        //   }}
        //   buyerId={buyerId}
        // />
        <InstagramConnectDialog
          buyerId={buyerId}
          onVerified={() => {
            setFeedInfo(false);
            handleRazorpayPayment();
          }}
        />
      )}
      <div>
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
        />
      </div>
    </>
  );
}
