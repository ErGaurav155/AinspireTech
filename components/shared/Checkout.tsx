"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Components
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

// Actions
import { getRazerpayPlanInfo } from "@/lib/action/plan.action";
import { getUserById, updateUserByDbId } from "@/lib/action/user.actions";
import { createTransaction } from "@/lib/action/transaction.action";

// Utils
import { apiClient } from "@/lib/utils";
import { sendSubscriptionEmailToUser } from "@/lib/action/sendEmail.action";

// Types
interface CheckoutProps {
  userId: string;
  amount: number;
  productId: string;
  billingCycle: "monthly" | "yearly";
}

type CheckoutStep = "weblink" | "payment";

// Form Schemas
const websiteFormSchema = z.object({
  websiteUrl: z
    .string()
    .min(1, "Website URL is required")
    .url("Please enter a valid URL"),
});

type WebsiteFormData = z.infer<typeof websiteFormSchema>;

// Constants
const RAZORPAY_SCRIPT_ID = "razorpay-checkout-js";
const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export const Checkout = ({
  userId,
  amount,
  productId,
  billingCycle,
}: CheckoutProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("weblink");
  const [showModal, setShowModal] = useState(false);
  const [srcolling, setSrcolling] = useState<boolean>(false);
  const userEmailRef = useRef<string>("");

  const buyerIdRef = useRef<string | null>(null);
  const razorpayPlanRef = useRef<{
    monthly: string | null;
    yearly: string | null;
  }>({ monthly: null, yearly: null });

  // Form handling
  const {
    handleSubmit: handleWebsiteSubmit,
    register: registerWebsite,
    formState: { errors: websiteErrors },
  } = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: { websiteUrl: "" },
  });

  // Helper Functions
  const redirectToSignIn = useCallback(() => {
    router.push("/sign-in");
  }, [router]);

  const showSuccessToast = (message: string) => {
    toast({
      title: "Success!",
      description: message,
      duration: 3000,
      className: "success-toast",
    });
  };

  const showErrorToast = (message: string) => {
    toast({
      title: "Error",
      description: message,
      duration: 3000,
      className: "error-toast",
    });
  };

  // Data fetching
  const fetchRequiredData = async (): Promise<boolean> => {
    try {
      // Fetch plan info
      const planInfo = await getRazerpayPlanInfo(productId);

      if (!planInfo.razorpaymonthlyplanId || !planInfo.razorpayyearlyplanId) {
        router.push("/");
        throw new Error("Plan information not found");
      }

      razorpayPlanRef.current = {
        monthly: planInfo.razorpaymonthlyplanId,
        yearly: planInfo.razorpayyearlyplanId,
      };

      // Fetch user info
      if (!userId) {
        redirectToSignIn();
        return false;
      }

      const user = await getUserById(userId);

      if (!user) {
        redirectToSignIn();
        throw new Error("User not found");
      }
      userEmailRef.current = user.email;
      buyerIdRef.current = user._id;
      return true;
    } catch (error) {
      console.error("Error fetching required data:", error);
      showErrorToast(
        error instanceof Error ? error.message : "An error occurred"
      );
      return false;
    }
  };

  // Payment handling
  const processPayment = async () => {
    const currentPlanId =
      billingCycle === "monthly"
        ? razorpayPlanRef.current.monthly
        : razorpayPlanRef.current.yearly;

    if (!currentPlanId) {
      showErrorToast("Plan not available");
      return;
    }

    try {
      const referralCode = localStorage.getItem("referral_code");

      const response = await fetch("/api/webhooks/razerpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          razorpayplanId: currentPlanId,
          productId,
          buyerId: buyerIdRef.current,
          referralCode: referralCode || null,
        }),
      });

      const subscriptionData = await response.json();

      if (!subscriptionData.isOk) {
        throw new Error("Failed to create purchase order");
      }

      const paymentOptions = {
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: amount * 100,
        currency: "INR",
        name: "GK Services",
        description: `${currentPlanId} Plan - ${billingCycle}`,
        subscription_id: subscriptionData.subsId,
        notes: {
          productId,
          buyerId: buyerIdRef.current,
          amount,
          referralCode: referralCode || "",
        },
        handler: async (response: any) => {
          await handlePaymentSuccess(
            response,
            subscriptionData.subsId,
            currentPlanId
          );
        },
        theme: { color: "#2563eb" },
      };

      const razorpay = new (window as any).Razorpay(paymentOptions);

      razorpay.on("payment.failed", (response: any) => {
        showErrorToast(response.error?.description || "Payment failed");
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment processing error:", error);
      showErrorToast(error instanceof Error ? error.message : "Payment failed");
    }
  };

  const handlePaymentSuccess = async (
    razorpayResponse: any,
    subscriptionId: string,
    planId: string
  ) => {
    try {
      const verificationData = {
        subscription_id: subscriptionId,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      };

      const verifyResponse = await fetch("/api/webhooks/razerpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verificationData),
      });

      const verificationResult = await verifyResponse.json();

      if (verificationResult.success) {
        const referralCode = localStorage.getItem("referral_code");

        // Create subscription
        await apiClient.createSubscription(
          productId,
          planId,
          billingCycle,
          subscriptionId,
          referralCode || null
        );

        // Create transaction record
        await createTransaction({
          customerId: subscriptionId,
          amount,
          plan: planId,
          buyerId: buyerIdRef.current!,
          createdAt: new Date(),
        });

        // Clear referral code
        if (referralCode) {
          localStorage.removeItem("referral_code");
        }

        showSuccessToast("Payment successful! Code added to your Dashboard");

        // Redirect to onboarding
        if (productId === "chatbot-education") {
          await sendSubscriptionEmailToUser({
            email: userEmailRef.current,
            userDbId: userId,
            agentId: productId,
            subscriptionId: subscriptionId,
          });
          router.push("/web/UserDashboard");
          return;
        }
        router.push(
          `/web/WebsiteOnboarding?userId=${userId}&agentId=${productId}&subscriptionId=${subscriptionId}`
        );
      } else {
        showErrorToast(verificationResult.message || "Verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      showErrorToast("Payment verification failed");
    }
  };

  // Form submission
  const handleWebsiteFormSubmit = async (data: WebsiteFormData) => {
    if (!userId || !buyerIdRef.current) {
      showErrorToast("User information not available");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateResponse = await updateUserByDbId(
        buyerIdRef.current,
        data.websiteUrl
      );

      if (updateResponse) {
        showSuccessToast("URL successfully submitted!");
        setCurrentStep("payment");
        await processPayment();
      } else {
        showErrorToast("Failed to save website URL");
      }
    } catch (error) {
      console.error("Error submitting website URL:", error);
      showErrorToast("Error saving website URL");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main checkout handler
  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userId) {
      redirectToSignIn();
      return;
    }

    const dataFetched = await fetchRequiredData();
    if (!dataFetched) return;

    setShowModal(true);

    if (productId === "chatbot-education") {
      setCurrentStep("payment");
      await processPayment();
      setSrcolling(false);
    } else {
      setCurrentStep("weblink");
    }
  };

  // Modal rendering
  const renderWebsiteModal = () => (
    <AlertDialog open={showModal} onOpenChange={setShowModal}>
      <AlertDialogContent className="bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] backdrop-blur-2xl border border-white/10 rounded-2xl max-w-md p-0 overflow-hidden shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/5 via-transparent to-[#B026FF]/5" />
          <div className="absolute top-0 left-0 w-20 h-20 bg-[#00F0FF]/10 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#B026FF]/10 rounded-full blur-xl translate-x-1/2 translate-y-1/2" />

          {/* Header */}
          <div className="relative p-6 border-b border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <AlertDialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                  Enter Website URL
                </AlertDialogTitle>
                <p className="text-sm text-gray-400 mt-1">
                  Connect your website
                </p>
              </div>
              <AlertDialogCancel
                onClick={() => router.push("/")}
                className="border-0 p-2 hover:bg-white/10 rounded-xl transition-all bg-transparent"
              >
                <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white transition-colors" />
              </AlertDialogCancel>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleWebsiteSubmit(handleWebsiteFormSubmit)}
            className="p-6 space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                PLEASE ENTER YOUR WEBSITE URL
              </h3>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                Website URL
              </label>
              <div className="relative">
                <input
                  {...registerWebsite("websiteUrl")}
                  className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border-2 border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-gray-500 focus:outline-none text-lg transition-all duration-300 focus:border-[#00F0FF] focus:shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-lg flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {websiteErrors.websiteUrl && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-sm bg-red-400/10 py-2 rounded-lg border border-red-400/20 text-center"
                  >
                    {websiteErrors.websiteUrl.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:opacity-90 transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving URL...
                </div>
              ) : (
                "Save URL"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="p-4 text-center border-t border-white/10 bg-black/20">
            <AlertDialogDescription className="text-sm">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF] font-semibold">
                IT WILL HELP US TO PROVIDE BETTER SERVICES
              </span>
            </AlertDialogDescription>
          </div>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Get button gradient based on product
  const getButtonGradient = () => {
    switch (productId) {
      case "chatbot-customer-support":
        return "bg-gradient-to-r from-[#B026FF] to-[#FF2E9F]";
      case "chatbot-lead-generation":
        return "bg-gradient-to-r from-[#00F0FF]/80 to-[#00F0FF]";
      default:
        return "bg-gradient-to-r from-[#FF2E9F]/80 to-[#FF2E9F]";
    }
  };

  return (
    <>
      <form onSubmit={handleCheckout} className="w-full">
        <Button
          type="submit"
          onClick={() => setSrcolling(true)}
          className={`w-full relative py-3 mt-3 rounded-full font-medium hover:opacity-90 transition-opacity ${getButtonGradient()} text-black z-10`}
        >
          {srcolling ? "Processing..." : "Start Automating"}
        </Button>
      </form>

      {showModal && currentStep === "weblink" && renderWebsiteModal()}

      {currentStep === "payment" && (
        <Script id={RAZORPAY_SCRIPT_ID} src={RAZORPAY_SCRIPT_SRC} />
      )}
    </>
  );
};
