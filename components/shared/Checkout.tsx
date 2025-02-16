"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";

import CartPay from "./CartPay";
import RazerPay from "./RazorPay";
import { Button } from "@material-tailwind/react";
import { getRazerpayPlanInfo } from "@/lib/action/plan.action";
import { getUserById } from "@/lib/action/user.actions";
import PayPalSubscriptionButton from "./CartPay";

interface CheckoutProps {
  amount: number;
  productId: string;
  billingCycle: string;
}

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

  const [isActive, setIsActive] = useState(false);
  const locationRef = useRef<string>("india"); // Store location without causing re-renders
  const razorpaymonthlyplanId = useRef<string | null>(null);
  const paypalmonthlyplanId = useRef<string | null>(null);
  const razorpayyearlyplanId = useRef<string | null>(null);
  const paypalyearlyplanId = useRef<string | null>(null);
  const razorpayplanId = useRef<string | null>(null);
  const paypalplanId = useRef<string | null>(null);

  const buyerIdRef = useRef<string | null>(null);

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
      } catch (error) {
        console.error("Error fetching user info:", error);
        return false;
      }
    }

    // Fetch location
    // try {
    //   const res = await fetch("/api/location");
    //   const locData = await res.json();
    //   locationRef.current = locData.location.country || "india"; // Default to India if not found
    // } catch (error) {
    //   console.error("Error fetching location:", error);
    //   locationRef.current = "india"; // Default to India
    // }

    return true;
  };

  const onCheckout = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission

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

      {isActive &&
        razorpaymonthlyplanId.current &&
        paypalmonthlyplanId.current &&
        razorpayyearlyplanId.current &&
        paypalyearlyplanId.current &&
        razorpayplanId.current &&
        paypalplanId.current &&
        buyerIdRef.current &&
        (locationRef.current !== "india" ? (
          <RazerPay
            amount={amount}
            razorpayplanId={razorpayplanId.current ?? ""}
            buyerId={buyerIdRef.current ?? ""}
            productId={productId}
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
                paypalplanId={paypalplanId.current ?? ""}
                buyerId={buyerIdRef.current ?? ""}
                productId={productId}
              />
            </AlertDialogContent>
          </AlertDialog>
        ))}
    </>
  );
};
