"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast"; // Assuming you have a toast utility
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Script from "next/script";
import { createTransaction } from "@/lib/action/transaction.action";
import { getUserByDbId, updateUserByDbId } from "@/lib/action/user.actions";
import { scrapeSitemapPages } from "@/lib/scrapping";

// Define validation schema using Zod
const formSchema = z.object({
  websiteUrl: z.string().url("Invalid URL").min(1, "Website URL is required"),
});

type FormData = z.infer<typeof formSchema>;

interface WebUrlProps {
  amount: number;
  planId: string;
  buyerId: string;
  productId: string;
}

export const Checkout = ({
  amount,
  planId,
  buyerId,
  productId,
}: WebUrlProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Call API to save the URL to the database (replace with your actual API call)
      const response = await updateUserByDbId(buyerId, data.websiteUrl);
      if (response) {
        setIsSubmitted(true);
        await runCheckout();
        toast({
          title: "URL successfully submitted!",
          duration: 2000,
          className: "success-toast",
        });
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

  const runCheckout = async () => {
    toast({
      title: "For International Users Use Paypal",
      description: "Buy Credits > Wallet > Paypal",
      duration: 3000,
      className: "success-toast z-55",
    });

    try {
      const response = await fetch("/api/webhooks/razerpay/subscription", {
        method: "POST",
        body: JSON.stringify({ planId, buyerId, productId }),
        headers: { "Content-Type": "application/json" },
      });

      const subscriptionCreate = await response.json();

      if (!subscriptionCreate.subscription) {
        throw new Error("Purchase Order is not created");
      }

      const paymentOptions = {
        key_id: process.env.RAZORPAY_KEY_ID!,
        amount: amount * 100,
        currency: "INR",
        name: "GK Services",
        description: "Thanks For Taking Our Services",
        subscription_id: subscriptionCreate.subscription,
        notes: {
          plan: planId,
          buyerId: buyerId,
          amount: amount,
        },
        handler: async function (response: any) {
          const data = {
            orderCreationId: subscriptionCreate.subscription,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          const result = await fetch("/api/webhooks/razerpay/verify", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });

          const res = await result.json();

          if (res.isOk) {
            toast({
              title: "Payment Successful!",
              description: "Code are added to your Dashoboard",
              duration: 3000,
              className: "success-toast",
            });
            const transaction1 = {
              customerId: subscriptionCreate.subscription,
              amount: amount,
              plan: planId,
              buyerId: buyerId,
              createdAt: new Date(),
            };

            await createTransaction(transaction1);
            const user = await getUserByDbId(buyerId);
            const scappedUrls = await scrapeSitemapPages(user.websiteUrl);
            console.log(scappedUrls);
            router.push("/UserDashboard");
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
          color: "#3399cc",
        },
      };

      const paymentObject = new (window as any).Razorpay(paymentOptions);
      paymentObject.on("payment.failed", function (response: any) {
        toast({
          title: "Order failed!",
          description: response.error.description,
          duration: 3000,
          className: "error-toast",
        });
      });

      paymentObject.open();
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast({
        title: "Checkout Error",
        description: error.message,
        duration: 3000,
        className: "error-toast",
      });
    }
  };

  return (
    <>
      {!isSubmitted ? (
        <div>
          <AlertDialog defaultOpen>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="flex justify-between items-center">
                  <p className="p-16-semibold text-black">
                    PLEASE ENTER YOUR WEBSITE URL/LINK
                  </p>
                  <AlertDialogCancel className="border-0 p-0 hover:bg-transparent">
                    <XMarkIcon
                      onClick={() => router.push(`/product/${productId}`)}
                      className="size-6 cursor-pointer"
                    />
                  </AlertDialogCancel>
                </div>
              </AlertDialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    {...register("websiteUrl")}
                    className="input-field mt-2 w-full"
                  />
                  {errors.websiteUrl && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.websiteUrl.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    className="bg-green-500 text-white p-2 w-1/2 rounded-md"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Payment Processing..." : "Pay Now"}
                  </button>
                </div>
              </form>

              <AlertDialogDescription className="p-16-regular py-3 text-green-500">
                IT WILL HELP US TO PROVIDE BETTER SERVICES
              </AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
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
