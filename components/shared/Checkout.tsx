"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Loader2, Zap, CreditCard } from "lucide-react";

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

// Utils
import { apiClient } from "@/lib/utils";
import { sendSubscriptionEmailToUser } from "@/lib/action/sendEmail.action";

// Types
interface CheckoutProps {
  userId: string;
  amount: number;
  productId: string;
  billingCycle: "monthly" | "yearly" | "one-time";
  planType: "chatbot" | "tokens";
  tokens?: number;
}

type CheckoutStep = "weblink" | "payment" | "scraping";

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
  planType = "chatbot",
  tokens,
}: CheckoutProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("weblink");
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
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
    });
  };

  const showErrorToast = (message: string) => {
    toast({
      title: "Error",
      description: message,
      duration: 3000,
      variant: "destructive",
    });
  };

  // Data fetching
  const fetchRequiredData = async (): Promise<boolean> => {
    try {
      // For chatbot subscriptions, fetch plan info
      if (planType === "chatbot") {
        const planInfo = await getRazerpayPlanInfo(productId);

        if (!planInfo.razorpaymonthlyplanId || !planInfo.razorpayyearlyplanId) {
          router.push("/");
          throw new Error("Plan information not found");
        }

        razorpayPlanRef.current = {
          monthly: planInfo.razorpaymonthlyplanId,
          yearly: planInfo.razorpayyearlyplanId,
        };
      }

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

  // Payment handling - Token Purchase
  const processTokenPayment = async () => {
    if (!tokens) {
      showErrorToast("Token amount is required");
      return;
    }

    try {
      // Create token purchase order
      setShowModal(false);
      const response = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokens,
          amount,
          planId: productId,
        }),
      });

      const orderData = await response.json();

      if (!orderData.success) {
        throw new Error("Failed to create token purchase order");
      }

      const paymentOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AI Chatbot Tokens",
        description: `${tokens.toLocaleString()} tokens purchase`,
        order_id: orderData.orderId,
        notes: {
          userId,
          tokens,
          planId: productId,
          type: "token_purchase",
        },
        handler: async (response: any) => {
          await handleTokenPaymentSuccess(response, orderData.orderId, tokens);
        },
        theme: { color: "#3B82F6" },
      };

      const razorpay = new (window as any).Razorpay(paymentOptions);
      razorpay.open();
    } catch (error) {
      console.error("Token payment processing error:", error);
      showErrorToast(error instanceof Error ? error.message : "Payment failed");
    }
  };

  // Payment handling - Chatbot Subscription
  const processChatbotPayment = async () => {
    const currentPlanId =
      billingCycle === "monthly"
        ? razorpayPlanRef.current.monthly
        : razorpayPlanRef.current.yearly;

    if (!currentPlanId) {
      showErrorToast("Plan not available");
      return;
    }

    try {
      setShowModal(false);
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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: amount * 100,
        currency: "INR",
        name: "AI Chatbot Subscription",
        description: `${productId} - ${billingCycle}`,
        subscription_id: subscriptionData.subsId,
        notes: {
          productId,
          buyerId: buyerIdRef.current,
          amount,
          referralCode: referralCode || "",
        },
        handler: async (response: any) => {
          await handleChatbotPaymentSuccess(
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
      console.error("Chatbot payment processing error:", error);
      showErrorToast(error instanceof Error ? error.message : "Payment failed");
    }
  };

  const handleTokenPaymentSuccess = async (
    razorpayResponse: any,
    orderId: string,
    tokens: number
  ) => {
    try {
      const verificationData = {
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        tokens,
        amount,
        currency: "INR",
      };

      const verifyResponse = await fetch("/api/tokens/purchase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verificationData),
      });

      const verificationResult = await verifyResponse.json();

      if (verificationResult.success) {
        showSuccessToast(
          `${tokens.toLocaleString()} tokens added to your account!`
        );
        router.push("/web/TokenDashboard");
      } else {
        showErrorToast(verificationResult.message || "Verification failed");
      }
    } catch (error) {
      console.error("Token payment verification error:", error);
      showErrorToast("Payment verification failed");
    }
  };

  const handleChatbotPaymentSuccess = async (
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

        // Clear referral code
        if (referralCode) {
          localStorage.removeItem("referral_code");
        }

        showSuccessToast("Subscription activated successfully!");

        // Redirect based on chatbot type
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

        // Check if website needs scraping for free tier
        const user = await getUserById(userId);
        if (!user.isScrapped) {
          router.push(
            `/web/WebsiteOnboarding?userId=${userId}&agentId=${productId}&subscriptionId=${subscriptionId}`
          );
        } else {
          router.push("/web/UserDashboard");
        }
      } else {
        showErrorToast(verificationResult.message || "Verification failed");
      }
    } catch (error) {
      console.error("Chatbot payment verification error:", error);
      showErrorToast("Payment verification failed");
    }
  };

  // Handle website scraping
  const handleScrapeWebsite = async (websiteUrl: string) => {
    if (!userId || !buyerIdRef.current) {
      showErrorToast("User information not available");
      return;
    }

    setProcessing(true);

    try {
      // Update user with website URL
      await updateUserByDbId(buyerIdRef.current, websiteUrl);

      // Call scraping API
      const scrapeResponse = await fetch(
        `/api/scrape-anu?url=${encodeURIComponent(
          websiteUrl
        )}&userId=${encodeURIComponent(userId)}&agentId=${encodeURIComponent(
          productId
        )}`
      );

      if (!scrapeResponse.ok) {
        throw new Error("Failed to scrape website");
      }

      const scrapeResult = await scrapeResponse.json();

      if (scrapeResult.success) {
        // Process scraped data
        const processResponse = await fetch("/api/scrape-anu/process-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scrapeResult.data),
        });

        if (!processResponse.ok) {
          throw new Error("Failed to process scraped data");
        }

        showSuccessToast("Website scraped successfully!");
        return true;
      }

      throw new Error("Scraping failed");
    } catch (error) {
      console.error("Error scraping website:", error);
      showErrorToast(
        "Failed to scrape website. You can still proceed, but chatbot may have limited knowledge."
      );
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Form submission
  const handleWebsiteFormSubmit = async (data: WebsiteFormData) => {
    await handleScrapeWebsite(data.websiteUrl);
    setCurrentStep("payment");
    setShowModal(false);
    if (planType === "tokens") {
      await processTokenPayment();
    } else {
      await processChatbotPayment();
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

    // For education chatbot or token purchases, skip website scraping
    if (productId === "chatbot-education" || planType === "tokens") {
      setCurrentStep("payment");
      if (planType === "tokens") {
        await processTokenPayment();
      } else {
        await processChatbotPayment();
      }
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
                  {currentStep === "weblink"
                    ? "Enter Website URL"
                    : "Processing Payment"}
                </AlertDialogTitle>
                <p className="text-sm text-gray-400 mt-1 font-montserrat">
                  {currentStep === "weblink"
                    ? "Connect your website for better AI training"
                    : "Complete your purchase"}
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

          {currentStep === "weblink" ? (
            <form
              onSubmit={handleWebsiteSubmit(handleWebsiteFormSubmit)}
              className="p-6 space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                  PLEASE ENTER YOUR WEBSITE URL
                </h3>
                <p className="text-sm text-gray-400 mt-2 font-montserrat">
                  This helps train your chatbot with relevant information
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Website URL
                </label>
                <div className="relative">
                  <input
                    {...registerWebsite("websiteUrl")}
                    className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border-2 border-white/10 rounded-xl py-4 px-4 text-white font-montserrat placeholder:text-gray-500 focus:outline-none text-lg transition-all duration-300 focus:border-[#00F0FF] focus:shadow-[0_0_20px_rgba(0,240,255,0.2)] "
                    placeholder="https://example.com"
                    disabled={isSubmitting || processing}
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
                      className="text-red-400 text-sm bg-red-400/10 py-2 rounded-lg border border-red-400/20 text-center font-montserrat"
                    >
                      {websiteErrors.websiteUrl.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || processing}
                className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:opacity-90 transition-all relative"
              >
                {processing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </div>
                ) : isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Continue to Payment"
                )}
              </Button>
            </form>
          ) : (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-[#00F0FF] animate-spin" />
                <p className="text-gray-300">Redirecting to payment...</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 text-center border-t border-white/10 bg-black/20">
            <AlertDialogDescription className="text-sm">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF] font-semibold font-montserrat">
                {currentStep === "weblink"
                  ? "IMPROVES CHATBOT ACCURACY & PERFORMANCE"
                  : "SECURE PAYMENT PROCESSING"}
              </span>
            </AlertDialogDescription>
          </div>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Get button text based on plan type
  const getButtonText = () => {
    if (planType === "tokens") {
      return tokens ? `Buy ${tokens.toLocaleString()} Tokens` : "Buy Tokens";
    }

    return `Subscribe - ${billingCycle === "monthly" ? "Monthly" : "Yearly"}`;
  };

  // Get button gradient based on plan type
  const getButtonGradient = () => {
    if (planType === "tokens") {
      return "bg-gradient-to-r from-[#B026FF] to-[#FF2E9F]";
    }

    // Different gradients for different chatbots
    switch (productId) {
      case "chatbot-customer-support":
        return "bg-gradient-to-r from-[#00F0FF] to-[#0080FF]";
      case "chatbot-lead-generation":
        return "bg-gradient-to-r from-[#B026FF] to-[#FF2E9F]";
      case "chatbot-education":
        return "bg-gradient-to-r from-[#FFD700] to-[#FFA500]";
      default:
        return "bg-gradient-to-r from-[#00F0FF] to-[#B026FF]";
    }
  };

  // Get icon based on plan type
  const getButtonIcon = () => {
    if (planType === "tokens") {
      return <Zap className="h-4 w-4 mr-2" />;
    }
    return <CreditCard className="h-4 w-4 mr-2" />;
  };

  return (
    <>
      <form onSubmit={handleCheckout} className="flex-1 w-full">
        <Button
          type="submit"
          className={`w-full relative  rounded-full font-medium hover:opacity-90 transition-opacity ${getButtonGradient()} text-white z-10`}
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>
      </form>

      {showModal && renderWebsiteModal()}

      {(currentStep === "payment" || planType === "tokens") && (
        <Script id={RAZORPAY_SCRIPT_ID} src={RAZORPAY_SCRIPT_SRC} />
      )}
    </>
  );
};
