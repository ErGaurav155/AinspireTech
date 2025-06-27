"use client";

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

import { Button } from "@material-tailwind/react";
import { getRazerpayPlanInfo } from "@/lib/action/plan.action";
import { getUserById, updateUserByDbId } from "@/lib/action/user.actions";
import OTPVerification from "./OTPVerification";
import { countryCodes } from "@/constant";
import { toast } from "../ui/use-toast";
import Script from "next/script";
import { createRazerPaySubscription } from "@/lib/action/subscription.action";
import { createTransaction } from "@/lib/action/transaction.action";

interface CheckoutProps {
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
  amount,
  productId,
  billingCycle,
}: CheckoutProps) => {
  const router = useRouter();
  const { userId } = useAuth();

  if (!userId) {
    router.push("/sign-in");
  }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [buyerId, setBuyerId] = useState(null);
  const [countryCode, setCountryCode] = useState("+1"); // Default to US

  const [isActive, setIsActive] = useState(false);
  const [feedInfo, setFeedInfo] = useState(false);
  const [step, setStep] = useState<"phone" | "otp" | "weblink" | "payment">(
    "phone"
  );
  const [phone, setPhone] = useState("");
  const locationRef = useRef<string>("India"); // Store location without causing re-renders
  const razorpaymonthlyplanId = useRef<string | null>(null);
  const razorpayyearlyplanId = useRef<string | null>(null);
  const razorpayplanId = useRef<string | null>(null);

  const buyerIdRef = useRef<string | null>(null);
  const {
    handleSubmit: handlePhoneSubmit,
    register: registerPhone,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneFormSchema),
  });

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
  const handlePhoneSubmission = async (data: PhoneFormData) => {
    setIsOtpSubmitting(true);
    try {
      const fullPhoneNumber = `${countryCode}${data.MobileNumber}`;

      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullPhoneNumber }),
      });
      if (res.ok) {
        setPhone(fullPhoneNumber);
        setStep("otp");
      } else {
        console.error("Failed to send OTP:", res.statusText);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setIsOtpSubmitting(false);
    }
  };
  const handleRazorpayPayment = async () => {
    try {
      const response = await fetch("/api/webhooks/razerpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          razorpayplanId: razorpayplanId.current,
          productId,
          buyerId,
        }),
      });

      const subscriptionCreate = await response.json();
      if (!subscriptionCreate.isOk) {
        throw new Error("Purchase Order is not created");
      }
      const options = {
        key_id: process.env.RAZORPAY_KEY_ID!,
        amount: amount * 100,
        currency: "USD",
        name: "GK Services",
        description: `${razorpayplanId.current} Plan - ${billingCycle}`,
        subscription_id: subscriptionCreate.subsId,
        notes: {
          productId: productId,
          buyerId: buyerId,
          amount: amount,
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
              buyerId!,
              razorpayplanId.current!,
              subscriptionCreate.subsId,
              billingCycle
            );
            await createTransaction({
              customerId: subscriptionCreate.subsId,
              amount,
              plan: razorpayplanId.current!,
              buyerId: buyerId!,
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
              router.push("/web/UserDashboard");
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
            {step === "phone" && (
              <AlertDialog defaultOpen>
                <AlertDialogContent className="bg-[#0a0a0a]/90 backdrop-blur-lg border border-[#333] rounded-xl max-w-md">
                  <AlertDialogTitle className="text-pink-400">
                    Otp Verification
                  </AlertDialogTitle>
                  <AlertDialogHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="p-16-semibold text-white text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                        PLEASE ENTER YOUR MOBILE NUMBER
                      </h3>
                      <AlertDialogCancel
                        onClick={() => router.push(`/`)}
                        className="border-0 p-0 hover:bg-transparent text-gray-400 hover:text-white transition-colors"
                      >
                        <XMarkIcon className="size-6 cursor-pointer" />
                      </AlertDialogCancel>
                    </div>
                  </AlertDialogHeader>

                  <form
                    onSubmit={handlePhoneSubmit(handlePhoneSubmission)}
                    className="space-y-6 p-4"
                  >
                    <div className="w-full">
                      <label
                        htmlFor="MobileNumber"
                        className="block text-md font-medium text-gray-300 mb-2"
                      >
                        Enter Your Phone Number
                      </label>
                      <div className="flex items-center justify-start w-full bg-[#1a1a1a]/50 backdrop-blur-sm border border-[#333] rounded-xl overflow-hidden">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="bg-transparent text-white p-3 border-r border-[#333] focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
                        >
                          {countryCodes.map((countryCode, index) => (
                            <option
                              key={index}
                              className="bg-[#1a1a1a] text-gray-300"
                              value={countryCode.code}
                            >
                              {countryCode.code}
                            </option>
                          ))}
                        </select>
                        <input
                          id="MobileNumber"
                          type="text"
                          {...registerPhone("MobileNumber")}
                          className="w-full bg-transparent py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none"
                          placeholder="Phone number"
                        />
                      </div>
                      {phoneErrors.MobileNumber && (
                        <p className="text-red-400 text-sm mt-2">
                          {phoneErrors.MobileNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="submit"
                        className={`w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90 transition-all ${
                          isOtpSubmitting ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                        disabled={isOtpSubmitting}
                      >
                        {isOtpSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                            Sending OTP...
                          </div>
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    </div>
                  </form>

                  <AlertDialogDescription className="p-4 text-center text-sm text-gray-400 border-t border-[#333] pt-4">
                    <span className="text-[#00F0FF]">
                      IT WILL HELP US TO PROVIDE BETTER SERVICES
                    </span>
                  </AlertDialogDescription>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {step === "otp" && (
              <OTPVerification
                phone={phone}
                onVerified={() => {
                  setStep("weblink");
                }}
                buyerId={buyerId}
              />
            )}
            {step === "weblink" && (
              <div>
                <AlertDialog defaultOpen>
                  <AlertDialogContent className="bg-[#0a0a0a]/90 backdrop-blur-lg border border-[#333] rounded-xl max-w-md">
                    {" "}
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-pink-400">
                        Enter Website URL
                      </AlertDialogTitle>
                      <div className="flex justify-between items-center">
                        <p className="p-16-semibold text-white text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                          PLEASE ENTER YOUR WEBSITE URL/LINK
                        </p>
                        <AlertDialogCancel
                          onClick={() => router.push(`/`)}
                          className="border-0 p-0 hover:bg-transparent text-gray-400 hover:text-white transition-colors"
                        >
                          <XMarkIcon className="size-6 cursor-pointer" />
                        </AlertDialogCancel>
                      </div>
                    </AlertDialogHeader>
                    <form
                      onSubmit={handleWebsiteSubmit(handleWebsiteSubmission)}
                      className="space-y-4"
                    >
                      <div className="w-full">
                        <label
                          htmlFor="websiteUrl"
                          className="block text-md font-medium text-gray-300 mb-2"
                        >
                          Website URL
                        </label>
                        <input
                          id="websiteUrl"
                          type="url"
                          {...registerWebsite("websiteUrl")}
                          className="w-full bg-[#1a1a1a]/50 backdrop-blur-sm border border-[#333] rounded-xl py-4 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
                        />
                        {websiteErrors.websiteUrl && (
                          <p className="text-red-500 text-xs mt-1">
                            {websiteErrors.websiteUrl.message}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-center">
                        <button
                          type="submit"
                          className={`w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90 transition-all ${
                            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                              Saving Url...
                            </div>
                          ) : (
                            "Save Url"
                          )}
                        </button>
                      </div>
                    </form>
                    <AlertDialogDescription className="p-16-regular py-3 text-green-500">
                      IT WILL HELP US TO PROVIDE BETTER SERVICES
                    </AlertDialogDescription>
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
