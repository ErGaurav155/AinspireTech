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
import { CrossIcon } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast, useToast } from "@/components/ui/use-toast";
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
  const [phone, setPhone] = useState("");
  const [buyer, setBuyer] = useState("");
  const [mode, setMode] = useState<"Immediate" | "End-of-term">("End-of-term");

  const [countryCode, setCountryCode] = useState("+1"); // Default to US
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
    <div className="wrapper2">
      <h1 className="text-2xl font-bold text-white text-center mb-4">
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
              className="flex flex-col w-full min-h-max gap-4 bg-gray-800 p-2 rounded-xl text-white"
            >
              <Link
                href={`/product/${agentId}`}
                className={`p-4 mt-2 w-full rounded-lg ${
                  isSubscribed ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <h2 className="flex text-lg items-center justify-center font-bold">
                  {agentId}
                </h2>
              </Link>
              {isSubscribed ? (
                <div className="mt-4  space-y-4">
                  {agentId === "ai-agent-education" ||
                  agentId === "ai-agent-customer-support" ||
                  agentId === "ai-agent-lead-generation" ||
                  agentId === "ai-agent-e-commerce" ? (
                    <div className="flex flex-col items-center justify-between gap-2 w-full ">
                      <div className="flex flex-row items-center  w-full bg-gray-100 gap-2  p-2 rounded-lg shadow-md">
                        <label className="text-sm  font-semibold text-gray-700">
                          Add number in your mobile call forwading option.Choose
                          unanswered option.
                        </label>
                        <span className="text-base lg:text-base font-bold text-gray-900">
                          {process.env.NEXT_PUBLIC_TWILIO_NUMBER}
                        </span>
                      </div>
                      <div className="flex flex-row items-center justify-between  w-full bg-gray-100 gap-2  p-2 rounded-lg shadow-md">
                        <label className="text-sm lg:text-base  text-nowrap font-semibold text-gray-700">
                          Linked Number:
                        </label>
                        <span className="text-base lg:text-base font-bold text-gray-900">
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
                      }  bg-blue-700 text-white text-base lg:text-base text-center  text-nowrap py-2 px-2 md:px-3 rounded-md transition duration-300 hover:bg-blue-600 `}
                    >
                      Change Number
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSubscriptionId(subscription.subscriptionId);
                        setOpen(true);
                      }}
                      className="flex-1 bg-red-700 text-white text-nowrap text-base lg:text-base  py-2 px-2 md:px-3 rounded-md transition duration-300 hover:bg-red-600"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 w-auto  flex gap-2 items-center justify-center">
                  <Link
                    href={`/product/${agentId}`}
                    className="flex items-center gap-2"
                  >
                    <LockClosedIcon className="h-7 w-7" /> Locked
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold  text-red-400">
                Cancel Subscription
              </h2>
              <XMarkIcon
                onClick={() => setOpen(false)}
                className="text-black size-10 cursor-pointer"
              />
            </div>
            <form onSubmit={handleCancelSubscription} className="space-y-4">
              <label className="block text-lg font-semibold text-black">
                Please Provide Reason
              </label>
              <textarea
                name="reason"
                className="w-full input-field"
                placeholder="Cancellation reason"
                required
              />
              <div className="flex justify-center gap-2">
                <button
                  type="submit"
                  onClick={() => setMode("Immediate")}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Immediate
                </button>
                <button
                  type="submit"
                  onClick={() => setMode("End-of-term")}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  End-of-term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {step === "phone" && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="sr-only">
                Enter Your Phone Number
              </AlertDialogTitle>
              <div className="flex justify-between items-center">
                <p className="p-16-semibold text-black">
                  PLEASE ENTER YOUR NEW MOBILE NUMBER HERE
                </p>
                <AlertDialogCancel
                  onClick={() => {
                    setStep("payment");
                    router.push(`/UserDashboard`);
                  }}
                  className="border-0 p-0 hover:bg-transparent"
                >
                  <XMarkIcon className="size-6 cursor-pointer" />
                </AlertDialogCancel>
              </div>
            </AlertDialogHeader>
            <form
              onSubmit={handlePhoneSubmit(handlePhoneSubmission)}
              className="space-y-4"
            >
              <div className="w-full">
                <label
                  htmlFor="MobileNumber"
                  className="block text-lg font-semibold"
                >
                  Enter Your New Phone Number
                </label>
                <div className="flex items-center justify-start input-field mt-2 w-full">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="max-w-max border-none  active:border-none no-scrollbar   p-2"
                  >
                    {countryCodes.map((countryCode, index) => (
                      <option
                        key={index}
                        className="bg-white text-gray-700 text-lg font-xs  mb-4 w-[10vw]  flex items-center justify-center    "
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
                    className="input-field  w-full"
                  />
                </div>
                {phoneErrors.MobileNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {phoneErrors.MobileNumber.message}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="bg-green-500 text-white p-2 w-1/2 rounded-md"
                  disabled={isOtpSubmitting}
                >
                  {isOtpSubmitting ? "Sending OTP" : "Send OTP"}
                </button>
              </div>
            </form>

            <AlertDialogDescription className="p-16-regular py-3 text-green-500">
              IT WILL HELP US TO PROVIDE BETTER SERVICES
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
  );
}
