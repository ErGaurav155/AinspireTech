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

import RazerPay from "./RazorPay";
import { Button } from "@material-tailwind/react";
import { getRazerpayPlanInfo } from "@/lib/action/plan.action";
import { getUserById, updateUserByDbId } from "@/lib/action/user.actions";

import { toast } from "../ui/use-toast";

interface CheckoutProps {
  amount: number;
  productId: string;
  billingCycle: string;
}

const websiteFormSchema = z.object({
  websiteUrl: z.string().url("Invalid URL").min(1, "Website URL is required"),
});

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
  const [buyerId, setBuyerId] = useState(null);
  const [webActive, setWebActive] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [step, setStep] = useState<"phone" | "otp" | "weblink" | "payment">(
    "phone"
  );

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
      } else if (billingCycle === "yearly") {
        razorpayplanId.current = razorpayyearlyplanId.current;
      } else {
        router.push("/");
        return false;
      }
      setWebActive(true);
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
            className={`w-full py-3 mt-3  rounded-full font-medium hover:opacity-90 transition-opacity whitespace-nowrap ${
              productId === "chatbot-customer-support"
                ? "bg-gradient-to-r from-[#B026FF] to-[#FF2E9F]"
                : productId === "chatbot-lead-generation"
                ? "bg-gradient-to-r from-[#00F0FF]/80 to-[#00F0FF]"
                : "bg-gradient-to-r from-[#FF2E9F]/80 to-[#FF2E9F]"
            } text-black`}
          >
            Get The Plan
          </Button>
        </section>
      </form>
      {webActive && (
        <div>
          <AlertDialog defaultOpen>
            <AlertDialogContent className="bg-[#0a0a0a]/90 backdrop-blur-lg border border-[#333] rounded-xl max-w-md">
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
                className="space-y-4 p-4"
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
                    className="w-full bg-transparent py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none"
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
              <AlertDialogDescription className="p-4 text-center text-sm text-gray-400 border-t border-[#333] pt-4">
                <span className="text-[#00F0FF]">
                  IT WILL HELP US TO PROVIDE BETTER SERVICES
                </span>
              </AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {isActive &&
        razorpaymonthlyplanId.current &&
        razorpayyearlyplanId.current &&
        razorpayplanId.current &&
        buyerIdRef.current &&
        step === "payment" && (
          <RazerPay
            amount={amount}
            razorpayplanId={razorpayplanId.current ?? ""}
            buyerId={buyerIdRef.current ?? ""}
            productId={productId}
            billingCycle={billingCycle}
          />
        )}
    </>
  );
};
