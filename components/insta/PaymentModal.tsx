"use client";

import { useRef, useState } from "react";
import { CreditCard } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PricingPlan } from "@/types/types";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Script from "next/script";
import { getRazerpayPlanInfo } from "@/lib/action/plan.action";
import { updateUserLimits } from "@/lib/action/user.actions";

// Payment Modal Component
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSubscription: any) => void;
  plan: PricingPlan | null;
  billingCycle: "monthly" | "yearly";
  buyerId: string;
  isSubscribed: boolean;
  isInstaAccount: boolean;
  isgettingAcc: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  billingCycle,
  buyerId,
  isSubscribed,
  isInstaAccount,
  isgettingAcc,
  onSuccess,
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "paypal">(
    "razorpay"
  );
  const razorpayplanId = useRef<string | null>(null);
  const router = useRouter();

  if (!plan) return null;

  const price =
    billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const inrPrice = Math.round(price * 87);

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/webhooks/razerpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          razorpayplanId: razorpayplanId.current!,
          productId: plan.id,
          buyerId,
        }),
      });

      const subscriptionCreate = await response.json();
      if (!subscriptionCreate.isOk) {
        throw new Error("Purchase Order is not created");
      }

      const options = {
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
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
            toast.success("Payment Successful! Code added to your Dashboard");

            await fetch("/api/insta/subscription/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chatbotType: plan.id,
                plan: razorpayplanId.current,
                subscriptionId: subscriptionCreate.subsId,
                billingCycle: billingCycle,
              }),
            });

            const UserData = await updateUserLimits(
              buyerId,
              plan.limit,
              plan.account
            );

            await onSuccess(plan.id);
            router.push("/insta/dashboard");
          } else {
            toast.error("Order canceled! " + res.message);
          }
        },
        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        toast.error("Order failed! " + response.error.description);
      });
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Checkout Error: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const onCheckout = async () => {
    try {
      setIsProcessing(true);
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
      setIsProcessing(false);
      onClose();
      await handleRazorpayPayment();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-[#0a0a0a]/90 backdrop-blur-lg border border-[#333] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-white font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
              {isInstaAccount ? "Step-2: Payment" : "Step-1: Connect Instagram"}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {isInstaAccount
              ? "Make an instant payment to activate your subscription and elevate your Instagram engagement!"
              : "Please connect your Instagram Business account to proceed with the payment."}
          </DialogDescription>

          {isInstaAccount ? (
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
                  <span className="text-white">${price}</span>
                </div>
                {billingCycle === "yearly" && (
                  <p className="text-sm text-green-400 mt-3 font-medium">
                    Save ${plan.monthlyPrice * 12 - plan.yearlyPrice} with
                    yearly billing
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
                      <span className="text-xs font-medium text-gray-300">
                        International
                      </span>
                    </div>
                    <span className="text-md font-medium text-white mt-2">
                      Razorpay
                    </span>
                    <span className="font-bold text-white">${price}</span>
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
                      <span className="text-xs font-medium text-gray-300">
                        India
                      </span>
                    </div>
                    <span className="text-md font-medium text-white mt-2">
                      Razorpay
                    </span>
                    <span className="font-bold text-white">₹{inrPrice}</span>
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
                    onClick={() => {
                      onCheckout();
                    }}
                    disabled={isProcessing}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    {isProcessing
                      ? "Processing..."
                      : isInstaAccount
                      ? `Pay with Razorpay`
                      : "Connect Instagram "}
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
                  Your subscription will be activated immediately after
                  successful payment. You can cancel anytime from your
                  dashboard.
                </p>
              ) : (
                <p className="text-xs text-gray-400 text-center px-4">
                  You had already take one of those subscription.
                </p>
              )}
            </div>
          ) : (
            <div className="p-4">
              <p className="text-gray-400 mb-4">
                You need to connect an Instagram account before purchasing a
                subscription.
              </p>
              <Button
                className="w-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-white"
                onClick={() => router.push("/insta/connect")}
              >
                Connect Instagram Account
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div>
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
        />
      </div>
    </>
  );
}
