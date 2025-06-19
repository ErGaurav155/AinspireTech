"use client";

import { useEffect, useState } from "react";
import EmbedCode from "@/components/shared/EmbedCode";
import {
  cancelPayPalSubscription,
  cancelRazorPaySubscription,
  getSubscription,
  getSubscriptionInfo,
} from "@/lib/action/subscription.action";
import { useAuth } from "@clerk/nextjs";
import { getUserById } from "@/lib/action/user.actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "@/components/ui/use-toast";
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
import { Input } from "@/components/ui/input";
import { countryCodes } from "@/constant";
import OTPVerification from "@/components/shared/OTPVerification";
import { Footer } from "@/components/shared/Footer";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";

interface Subscription {
  productId: string;
  userId: string;
  subscriptionId: string;
  subscriptionStatus: string;
}
const phoneFormSchema = z.object({
  MobileNumber: z
    .string()
    .min(10, "MOBILE number is required")
    .regex(/^\d+$/, "invalid number"),
});
type PhoneFormData = z.infer<typeof phoneFormSchema>;

const agentIds = [
  "ai-agent-customer-support",
  "ai-agent-e-commerce",
  "ai-agent-lead-generation",
  "ai-agent-education",
  "chatbot-customer-support",
  "chatbot-e-commerce",
  "chatbot-lead-generation",
  "chatbot-education",
  "template-pathology",
  "template-e-commerce",
  "template-business",
  "template-saas",
];

export default function Dashboard() {
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      productId: "",
      userId: "",
      subscriptionId: "",
      subscriptionStatus: "",
    },
  ]);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImmediateSubmitting, setIsImmediateSubmitting] = useState(false);

  const [phone, setPhone] = useState("");
  const [buyer, setBuyer] = useState("");
  const [mode, setMode] = useState<"Immediate" | "End-of-term">("End-of-term");

  const [countryCode, setCountryCode] = useState("+1");
  const [step, setStep] = useState<"phone" | "otp" | "payment">("payment");
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  const [open, setOpen] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<
    string | null
  >("");
  const {
    handleSubmit: handlePhoneSubmit,
    register: registerPhone,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneFormSchema),
  });
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
  const handleOTPVerified = () => {
    setStep("payment");
  };
  useEffect(() => {
    async function fetchSubscriptions() {
      if (!userId) {
        router.push("/sign-in");
        return;
      }

      try {
        const user = await getUserById(userId);
        setBuyer(user._id);
        setUserPhone(user.phone);
        const response = await getSubscriptionInfo(user._id);

        setSubscriptions(
          response.map((sub: any) => ({
            productId: sub.productId,
            userId: sub.userId,
            subscriptionId: sub.subscriptionId,
            subscriptionStatus: sub.subscriptionStatus,
          })) || []
        );
      } catch (error: any) {
        console.error("Error fetching subscriptions:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, [userId, router]);

  const handleCancelSubscription = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedSubscriptionId) return;

    const formData = new FormData(event.currentTarget);
    const reason = formData.get("reason") as string;

    try {
      if (mode === "Immediate") {
        setIsSubmitting(true);
      } else {
        setIsImmediateSubmitting(true);
      }
      const getSub = await getSubscription(selectedSubscriptionId);
      if (!getSub) {
        router.push("/");
        return;
      }

      let result;
      if (getSub.mode === "paypal") {
        result = await cancelPayPalSubscription(
          selectedSubscriptionId,
          reason,
          mode
        );
      } else {
        result = await cancelRazorPaySubscription(
          selectedSubscriptionId,
          reason,
          mode
        );
      }
      if (result.success) {
        toast({
          title: "Subscription cancelled successfully!",
          description: result.message,
          duration: 3000,
          className: "success-toast",
        });
        router.refresh();
        setOpen(false);
      } else {
        toast({
          title: "Subscription cancelled Failed!",
          description: result.message,
          duration: 3000,
          className: "error-toast",
        });
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    } finally {
      setIsSubmitting(false);
      setIsImmediateSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <BreadcrumbsDefault />

      <div className="wrapper2 w-full max-w-6xl px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
          Your Subscriptions
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {agentIds.map((agentId) => {
            const subscription = subscriptions.find(
              (sub) => sub.productId === agentId
            );
            const isSubscribed = subscription?.subscriptionStatus === "active";

            return (
              <div
                key={agentId}
                className="flex flex-col w-full min-h-max gap-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all duration-300 hover:border-[#B026FF]/50"
              >
                <Link
                  href={`/product/${agentId}`}
                  className={`p-4 w-full rounded-lg text-center transition-all ${
                    isSubscribed
                      ? "bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]"
                      : "bg-gray-800"
                  }`}
                >
                  <h2 className="text-xl font-bold text-white">
                    {agentId.replace(/-/g, " ").toUpperCase()}
                  </h2>
                </Link>
                {isSubscribed ? (
                  <div className="mt-4 space-y-4">
                    {agentId === "ai-agent-education" ||
                    agentId === "ai-agent-customer-support" ||
                    agentId === "ai-agent-lead-generation" ||
                    agentId === "ai-agent-e-commerce" ? (
                      <div className="flex flex-col items-center justify-between gap-4 w-full">
                        <div className="flex flex-col w-full bg-gray-800/50 gap-2 p-4 rounded-lg">
                          <label className="text-sm font-medium text-gray-300">
                            Add this number in your mobile call forwarding
                            options (Busy/Unanswered/Unreachable):
                          </label>
                          <span className="text-lg font-bold text-[#00F0FF]">
                            {process.env.NEXT_PUBLIC_TWILIO_NUMBER}
                          </span>
                        </div>
                        <div className="flex flex-row items-center justify-between w-full bg-gray-800/50 p-4 rounded-lg">
                          <label className="text-sm lg:text-base font-medium text-gray-300">
                            Linked Number:
                          </label>
                          <span className="text-base font-bold text-[#00F0FF]">
                            {userPhone}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <EmbedCode
                        userId={subscription?.userId || ""}
                        agentId={agentId}
                      />
                    )}
                    <div className="flex items-center justify-center gap-3 w-full">
                      <button
                        onClick={() => setStep("phone")}
                        className={`flex-1 ${
                          agentId === "ai-agent-education" ||
                          agentId === "ai-agent-customer-support" ||
                          agentId === "ai-agent-lead-generation" ||
                          agentId === "ai-agent-e-commerce"
                            ? "block"
                            : "hidden"
                        } bg-gradient-to-r from-[#00F0FF]/80 to-[#00F0FF] text-black font-medium py-2 px-4 rounded-md transition duration-300 hover:opacity-90`}
                      >
                        Change Number
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubscriptionId(
                            subscription.subscriptionId
                          );
                          setOpen(true);
                        }}
                        className="flex-1 bg-gradient-to-r from-[#FF2E9F]/80 to-[#FF2E9F] text-black font-medium py-2 px-4 rounded-md transition duration-300 hover:opacity-90"
                      >
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 w-auto flex gap-2 items-center justify-center">
                    <Link
                      href={`/product/${agentId}`}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <LockClosedIcon className="h-6 w-6" />
                      <span className="font-medium">Locked</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900/80 backdrop-blur-lg border border-[#B026FF]/30 p-8 rounded-xl max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF2E9F] to-[#B026FF]">
                  Cancel Subscription
                </h2>
                <XMarkIcon
                  onClick={() => setOpen(false)}
                  className="text-gray-400 size-6 cursor-pointer hover:text-white"
                />
              </div>
              <form onSubmit={handleCancelSubscription} className="space-y-6">
                <label className="block text-lg font-semibold text-gray-200">
                  Please Provide Reason
                </label>
                <textarea
                  name="reason"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#B026FF]"
                  placeholder="Cancellation reason"
                  required
                />
                <div className="flex justify-center gap-4">
                  <button
                    type="submit"
                    onClick={() => setMode("Immediate")}
                    className="px-6 py-2 bg-gradient-to-r from-[#FF2E9F] to-[#B026FF] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    {isSubmitting ? "Cancelling..." : "Immediate"}
                  </button>
                  <button
                    type="submit"
                    onClick={() => setMode("End-of-term")}
                    className="px-6 py-2 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    {isImmediateSubmitting ? "Cancelling..." : "End-of-term"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {step === "phone" && (
          <AlertDialog defaultOpen>
            <AlertDialogContent className="bg-gray-900/80 backdrop-blur-lg border border-[#00F0FF]/30 rounded-xl max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="sr-only">
                  Enter Your Phone Number
                </AlertDialogTitle>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                    ENTER YOUR NEW MOBILE NUMBER
                  </p>
                  <AlertDialogCancel
                    onClick={() => {
                      setStep("payment");
                      router.push(`/UserDashboard`);
                    }}
                    className="border-0 p-0 hover:bg-transparent text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="size-6 cursor-pointer" />
                  </AlertDialogCancel>
                </div>
              </AlertDialogHeader>
              <form
                onSubmit={handlePhoneSubmit(handlePhoneSubmission)}
                className="space-y-6 mt-4"
              >
                <div className="w-full">
                  <label
                    htmlFor="MobileNumber"
                    className="block text-lg font-semibold text-gray-200 mb-2"
                  >
                    Enter Your New Phone Number
                  </label>
                  <div className="flex items-center justify-start bg-gray-800/50 border border-gray-700 rounded-lg p-2 mt-2 w-full">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-transparent text-white border-none focus:outline-none p-2"
                    >
                      {countryCodes.map((countryCode, index) => (
                        <option
                          key={index}
                          className="bg-gray-800 text-white"
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
                      className="bg-transparent text-white border-none focus:outline-none w-full p-2"
                      placeholder="Phone number"
                    />
                  </div>
                  {phoneErrors.MobileNumber && (
                    <p className="text-red-400 text-sm mt-1">
                      {phoneErrors.MobileNumber.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium py-2 px-8 rounded-lg transition duration-300 hover:opacity-90"
                    disabled={isOtpSubmitting}
                  >
                    {isOtpSubmitting ? "Sending OTP..." : "Send OTP"}
                  </button>
                </div>
              </form>

              <AlertDialogDescription className="text-center text-green-400 mt-4 font-medium">
                IT WILL HELP US PROVIDE BETTER SERVICES
              </AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {step === "otp" && (
          <OTPVerification
            phone={phone}
            onVerified={handleOTPVerified}
            buyerId={buyer}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
