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

import CartPay from "./CartPay";
import RazerPay from "./RazorPay";
import { Button } from "@material-tailwind/react";
import { getRazerpayPlanInfo } from "@/lib/action/plan.action";
import { getUserById, updateUserByDbId } from "@/lib/action/user.actions";
import OTPVerification from "./OTPVerification";
import { countryCodes } from "@/constant";
import { toast } from "../ui/use-toast";

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
  const paypalmonthlyplanId = useRef<string | null>(null);
  const razorpayyearlyplanId = useRef<string | null>(null);
  const paypalyearlyplanId = useRef<string | null>(null);
  const razorpayplanId = useRef<string | null>(null);
  const paypalplanId = useRef<string | null>(null);

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
      if (
        !info.razorpaymonthlyplanId ||
        !info.paypalmonthlyplanId ||
        !info.razorpayyearlyplanId ||
        !info.paypalyearlyplanId
      ) {
        router.push("/");
        throw new Error("Plan not found");
      }

      razorpaymonthlyplanId.current = info.razorpaymonthlyplanId;
      paypalmonthlyplanId.current = info.paypalmonthlyplanId;
      razorpayyearlyplanId.current = info.razorpayyearlyplanId;
      paypalyearlyplanId.current = info.paypalyearlyplanId;
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

    try {
      const res = await fetch("/api/location");
      const locData = await res.json();

      locationRef.current = locData.location.country || "India";
    } catch (error) {
      console.error("Error fetching location:", error);
      locationRef.current = "India";
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

  const handleOTPVerified = () => {
    if (productId !== "ai-agent-customer-support") {
      setStep("weblink");
    } else {
      setStep("payment");
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
        paypalplanId.current = paypalmonthlyplanId.current;
      } else if (billingCycle === "yearly") {
        razorpayplanId.current = razorpayyearlyplanId.current;
        paypalplanId.current = paypalyearlyplanId.current;
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
            className="w-full rounded-md text-base text-white bg-cover bg-indigo-900"
          >
            Get The Plan
          </Button>
        </section>
      </form>
      {feedInfo && (
        <>
          <div>
            {step === "phone" && (
              <AlertDialog defaultOpen>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="sr-only">
                      Enter Your Phone Number
                    </AlertDialogTitle>
                    <div className="flex justify-between items-center">
                      <p className="p-16-semibold text-black">
                        PLEASE ENTER YOUR MOBILE NUMBER HERE
                      </p>
                      <AlertDialogCancel
                        onClick={() => router.push(`/`)}
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
                        Enter Your Phone Number
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
                buyerId={buyerId}
              />
            )}
            {step === "weblink" &&
              productId !== "ai-agent-customer-support" && (
                <div>
                  <AlertDialog defaultOpen>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="sr-only">
                          Enter Website URL
                        </AlertDialogTitle>
                        <div className="flex justify-between items-center">
                          <p className="p-16-semibold text-black">
                            PLEASE ENTER YOUR WEBSITE URL/LINK
                          </p>
                          <AlertDialogCancel
                            onClick={() => router.push(`/`)}
                            className="border-0 p-0 hover:bg-transparent"
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
                            className="block text-lg font-semibold"
                          >
                            Website URL
                          </label>
                          <input
                            id="websiteUrl"
                            type="url"
                            {...registerWebsite("websiteUrl")}
                            className="input-field mt-2 w-full"
                          />
                          {websiteErrors.websiteUrl && (
                            <p className="text-red-500 text-xs mt-1">
                              {websiteErrors.websiteUrl.message}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <button
                            type="submit"
                            className="bg-green-500 text-white p-2 w-1/2 rounded-md"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Saving Url" : "Save Url"}
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
      {isActive &&
        razorpaymonthlyplanId.current &&
        paypalmonthlyplanId.current &&
        razorpayyearlyplanId.current &&
        paypalyearlyplanId.current &&
        razorpayplanId.current &&
        paypalplanId.current &&
        buyerIdRef.current &&
        step === "payment" &&
        (locationRef.current === "India" ? (
          <RazerPay
            amount={amount}
            razorpayplanId={razorpayplanId.current ?? ""}
            buyerId={buyerIdRef.current ?? ""}
            productId={productId}
            billingCycle={billingCycle}
          />
        ) : (
          <AlertDialog defaultOpen>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="sr-only">
                  Enter Website URL
                </AlertDialogTitle>
                <div className="flex justify-between items-center">
                  <p className="p-16-semibold text-black">
                    Proceed To Take Monthly Subscription
                  </p>
                  <AlertDialogCancel
                    onClick={() => router.push(`/`)}
                    className="border-0 p-0 hover:bg-transparent"
                  >
                    <XMarkIcon className="size-6 cursor-pointer" />
                  </AlertDialogCancel>
                </div>
              </AlertDialogHeader>
              <CartPay
                amount={amount}
                paypalplanId={paypalplanId.current ?? ""}
                buyerId={buyerIdRef.current ?? ""}
                productId={productId}
                billingCycle={billingCycle}
              />
            </AlertDialogContent>
          </AlertDialog>
        ))}
    </>
  );
};
