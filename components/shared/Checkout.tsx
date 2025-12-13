"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { getRazerpayPlanInfo } from "@/lib/action/plan.action";
import { getUserById, updateUserByDbId } from "@/lib/action/user.actions";

import { toast } from "../ui/use-toast";
import Script from "next/script";
import { createTransaction } from "@/lib/action/transaction.action";
import { apiClient } from "@/lib/utils";
import { Button } from "../ui/button";

interface CheckoutProps {
  userId: string;
  amount: number;
  productId: string;
  billingCycle: string;
}
const phoneFormSchema = z.object({
  MobileNumber: z
    .string()
    .min(10, "MOBILE number is required")
    .regex(/^\d+$/, "invalid number"),
});

const websiteFormSchema = z.object({
  websiteUrl: z.string().url("Invalid URL").min(1, "Website URL is required"),
});

type PhoneFormData = z.infer<typeof phoneFormSchema>;
type WebsiteFormData = z.infer<typeof websiteFormSchema>;

export const Checkout = ({
  userId,
  amount,
  productId,
  billingCycle,
}: CheckoutProps) => {
  const router = useRouter();

  if (!userId) {
    router.push("/sign-in");
  }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyerId, setBuyerId] = useState(null);

  const [isActive, setIsActive] = useState(false);
  const [feedInfo, setFeedInfo] = useState(false);
  const [step, setStep] = useState<"weblink" | "payment">("weblink");
  const locationRef = useRef<string>("India"); // Store location without causing re-renders
  const razorpaymonthlyplanId = useRef<string | null>(null);
  const razorpayyearlyplanId = useRef<string | null>(null);
  const razorpayplanId = useRef<string | null>(null);

  const buyerIdRef = useRef<string | null>(null);

  const {
    handleSubmit: handleWebsiteSubmit,
    register: registerWebsite,
    formState: { errors: websiteErrors },
  } = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteFormSchema),
  });

  const fetchPlanInfo = async () => {
    try {
      // Fetch plan data
      const info = await getRazerpayPlanInfo(productId);
      if (!info.razorpaymonthlyplanId || !info.razorpayyearlyplanId) {
        router.push("/");
        throw new Error("Plan not found");
      }

      razorpaymonthlyplanId.current = info.razorpaymonthlyplanId;
      razorpayyearlyplanId.current = info.razorpayyearlyplanId;
    } catch (error) {
      console.error("Error fetching plan info:", error);
      return false;
    }

    // Fetch user data
    if (userId) {
      try {
        const buyer = await getUserById(userId);
        if (!buyer) {
          router.push("/sign-in");
          throw new Error("User not found");
        }

        buyerIdRef.current = buyer._id;
        setBuyerId(buyer._id);
      } catch (error) {
        console.error("Error fetching user info:", error);
        return false;
      }
    }

    return true;
  };

  // In your existing Checkout component, update the handleRazorpayPayment function:
  const handleRazorpayPayment = async () => {
    try {
      // Get referral code from localStorage
      const referralCode = localStorage.getItem("referral_code");

      const response = await fetch("/api/webhooks/razerpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          razorpayplanId: razorpayplanId.current,
          productId,
          buyerId,
          referralCode: referralCode || null, // Add referral code
        }),
      });

      const subscriptionCreate = await response.json();
      if (!subscriptionCreate.isOk) {
        throw new Error("Purchase Order is not created");
      }
      const options = {
        key_id: process.env.RAZORPAY_KEY_ID!,
        amount: amount * 100,
        currency: "INR",
        name: "GK Services",
        description: `${razorpayplanId.current} Plan - ${billingCycle}`,
        subscription_id: subscriptionCreate.subsId,
        notes: {
          productId: productId,
          buyerId: buyerId,
          amount: amount,
          referralCode: referralCode || "", // Add to notes
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

            // Create subscription with referral code
            await apiClient.createSubscription(
              productId,
              razorpayplanId.current!,
              billingCycle,
              subscriptionCreate.subsId,
              referralCode || null // Add referral code parameter
            );

            await createTransaction({
              customerId: subscriptionCreate.subsId,
              amount,
              plan: razorpayplanId.current!,
              buyerId: buyerId!,
              createdAt: new Date(),
            });

            // Clear referral code after successful purchase
            if (referralCode) {
              localStorage.removeItem("referral_code");
            }

            router.push(
              `/web/WebsiteOnboarding?userId=${userId}&agentId=${productId}&subscriptionId=${subscriptionCreate.subsId}`
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
    }
  };
  const handleWebsiteSubmission = async (data: WebsiteFormData) => {
    setIsSubmitting(true);
    try {
      if (!userId || !buyerId) {
        throw new Error("User database ID is not available.");
      }

      const response = await updateUserByDbId(buyerId, data.websiteUrl);
      if (response) {
        toast({
          title: "URL successfully submitted!",
          duration: 2000,
          className: "success-toast",
        });
        setStep("payment");
        await handleRazorpayPayment();
      } else {
        toast({
          title: "Failed to submit the URL",
          duration: 2000,
          className: "error-toast",
        });
      }
    } catch (error) {
      console.error("Error submitting the URL:", error);
      toast({
        title: "Error submitting the URL",
        duration: 2000,
        className: "error-toast",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCheckout = async (event: React.FormEvent) => {
    event.preventDefault();

    const isDataFetched = await fetchPlanInfo();
    if (isDataFetched) {
      if (billingCycle === "monthly") {
        razorpayplanId.current = razorpaymonthlyplanId.current;
      } else if (billingCycle === "yearly") {
        razorpayplanId.current = razorpayyearlyplanId.current;
      } else {
        router.push("/");
        return false;
      }
      setFeedInfo(true);
      setIsActive(true);
    }
  };
  return (
    <>
      <form className="w-full" onSubmit={onCheckout}>
        <section className="w-full">
          <Button
            type="submit"
            role="link"
            className={`w-full relative z-10 py-3 mt-3  rounded-full font-medium hover:opacity-90 transition-opacity whitespace-nowrap ${
              productId === "chatbot-customer-support"
                ? "bg-gradient-to-r from-[#B026FF] to-[#FF2E9F]"
                : productId === "chatbot-lead-generation"
                ? "bg-gradient-to-r from-[#00F0FF]/80 to-[#00F0FF]"
                : "bg-gradient-to-r from-[#FF2E9F]/80 to-[#FF2E9F]"
            } text-black`}
          >
            Start Automating
          </Button>
        </section>
      </form>
      {feedInfo && (
        <>
          <div>
            {step === "weblink" && (
              <div>
                <AlertDialog defaultOpen>
                  <AlertDialogContent className="bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] backdrop-blur-2xl border border-white/10 rounded-2xl max-w-md p-0 overflow-hidden shadow-2xl">
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        visible: {
                          opacity: 1,
                          scale: 1,
                          transition: {
                            duration: 0.5,
                            ease: "easeOut",
                          },
                        },
                      }}
                      initial="hidden"
                      animate="visible"
                      className="relative"
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/5 via-transparent to-[#B026FF]/5"></div>

                      {/* Header */}
                      <div className="relative p-6 border-b border-white/10">
                        <div className="flex justify-between items-center">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <AlertDialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                              Enter Website URL
                            </AlertDialogTitle>
                            <p className="text-sm text-gray-400 mt-1">
                              Connect your website
                            </p>
                          </motion.div>

                          <AlertDialogCancel
                            onClick={() => router.push(`/`)}
                            className="border-0 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group bg-transparent"
                          >
                            <XMarkIcon className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                          </AlertDialogCancel>
                        </div>
                      </div>

                      {/* Content */}
                      <form
                        onSubmit={handleWebsiteSubmit(handleWebsiteSubmission)}
                        className="p-6 space-y-6"
                      >
                        {/* Title */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-center"
                        >
                          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                            PLEASE ENTER YOUR WEBSITE URL/LINK
                          </h3>
                        </motion.div>

                        {/* Website Input */}
                        <motion.div
                          className="space-y-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <label className="block text-sm font-medium text-gray-300">
                            Website URL
                          </label>

                          <motion.div
                            whileFocus={{
                              borderColor: "#00F0FF",
                              boxShadow: "0 0 20px rgba(0, 240, 255, 0.2)",
                            }}
                            whileHover={{
                              borderColor: "#B026FF",
                              boxShadow: "0 0 15px rgba(176, 38, 255, 0.1)",
                            }}
                            className="relative"
                          >
                            <input
                              id="websiteUrl"
                              type="url"
                              {...registerWebsite("websiteUrl")}
                              className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border-2 border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-gray-500 focus:outline-none text-lg transition-all duration-300"
                              placeholder="https://example.com"
                            />
                            {/* URL Icon */}
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="w-6 h-6 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-lg flex items-center justify-center"
                              >
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
                              </motion.div>
                            </div>
                          </motion.div>

                          <AnimatePresence>
                            {websiteErrors.websiteUrl && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-center"
                              >
                                <p className="text-red-400 text-sm bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                                  {websiteErrors.websiteUrl.message}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Save URL Button */}
                        <motion.button
                          type="submit"
                          variants={{
                            initial: {
                              background:
                                "linear-gradient(135deg, #00F0FF 0%, #B026FF 100%)",
                            },
                            hover: {
                              background:
                                "linear-gradient(135deg, #00F0FF 20%, #B026FF 80%)",
                              scale: 1.02,
                              boxShadow: "0 10px 30px rgba(0, 240, 255, 0.3)",
                              transition: {
                                duration: 0.3,
                                ease: "easeOut",
                              },
                            },
                            tap: {
                              scale: 0.98,
                            },
                            loading: {
                              background:
                                "linear-gradient(135deg, #666 0%, #888 100%)",
                            },
                          }}
                          initial="initial"
                          whileHover={isSubmitting ? "loading" : "hover"}
                          whileTap="tap"
                          animate={isSubmitting ? "loading" : "initial"}
                          className={`w-full py-4 relative z-30 rounded-xl font-bold text-lg text-white transition-all duration-300 ${
                            isSubmitting ? "cursor-not-allowed" : ""
                          }`}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <motion.div
                              className="flex items-center justify-center gap-3"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              />
                              Saving URL...
                            </motion.div>
                          ) : (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center justify-center gap-2"
                            >
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Save URL
                            </motion.span>
                          )}
                        </motion.button>
                      </form>

                      {/* Footer */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="p-4 text-center border-t border-white/10 bg-black/20"
                      >
                        <AlertDialogDescription className="text-sm">
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF] font-semibold font-montserrat">
                            IT WILL HELP US TO PROVIDE BETTER SERVICES
                          </span>
                        </AlertDialogDescription>
                      </motion.div>

                      {/* Decorative Elements */}
                      <div className="absolute top-0 left-0 w-20 h-20 bg-[#00F0FF]/10 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#B026FF]/10 rounded-full blur-xl translate-x-1/2 translate-y-1/2"></div>
                    </motion.div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </>
      )}
      {isActive && (
        <div>
          <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
          />
        </div>
      )}
    </>
  );
};
