"use client";

import { Footer } from "@/components/shared/Footer";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { productSubscriptionDetails } from "@/constant";
import Link from "next/link";
import {
  HeadsetIcon,
  AmbulanceIcon,
  BotIcon,
  GraduationCapIcon,
  ShoppingCartIcon,
  Building2Icon,
  Bot,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Checkout } from "@/components/shared/Checkout";
import { getSubscriptionInfo } from "@/lib/action/subscription.action";
import { getUserById } from "@/lib/action/user.actions";
import { Button } from "@material-tailwind/react";

const iconMapping: Record<string, any> = {
  HeadsetIcon: HeadsetIcon,
  AmbulanceIcon: AmbulanceIcon,
  BotIcon: BotIcon,
  Bot: Bot,
  GraduationCapIcon: GraduationCapIcon,
  ShoppingCartIcon: ShoppingCartIcon,
  Building2Icon: Building2Icon,
};

interface Subscription {
  productId: string;
  userId: string;
  subscriptionStatus: string;
}

const Pricing = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [login, setLogin] = useState(true);
  const router = useRouter();
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const activeProductId = searchParams.get("id");

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!userId) {
        setLogin(false);
        setLoading(false);
      } else {
        try {
          const user = await getUserById(userId);
          const response = await getSubscriptionInfo(user._id);

          const filteredSubscriptions = response.map((sub: any) => ({
            productId: sub.productId,
            userId: sub.userId,
            subscriptionStatus: sub.subscriptionStatus,
          }));

          setSubscriptions(filteredSubscriptions || []);
        } catch (error: any) {
          console.error("Error fetching subscriptions:", error.message);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchSubscriptions();
  }, [userId]);

  const toggleBillingCycle = (cycle: "monthly" | "yearly") => {
    setBillingCycle(cycle);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Loading...
      </div>
    );
  }
  return (
    <div>
      <div className="wrapper2">
        <div className="py-10">
          <div className="text-center my-8 px-4">
            <h2 className="text-4xl font-bold text-white">
              Unlock the Power of AI
            </h2>
            <p className="text-lg text-white mt-4 leading-relaxed">
              Unlock the power of AI-driven customer support and intelligent
              chatbots. Whether you are a{" "}
              <span className="text-blue-600 font-semibold">startup</span>,{" "}
              <span className="text-blue-600 font-semibold">
                growing business
              </span>
              , or an{" "}
              <span className="text-green-600 font-semibold">
                established enterprise
              </span>
              , our AI agents are tailored to{" "}
              <span className="text-green-600 font-semibold">
                optimize customer experiences
              </span>
              , drive{" "}
              <span className="text-orange-600 font-semibold">sales</span>, and
              maximize{" "}
              <span className="text-orange-600 font-semibold">
                operational efficiency
              </span>
              .
            </p>
          </div>

          {/* Billing cycle toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-gray-200 p-2 rounded-lg">
              <button
                onClick={() => toggleBillingCycle("monthly")}
                className={`px-6 py-2 text-sm font-medium ${
                  billingCycle === "monthly"
                    ? "bg-blue-600 text-white rounded-lg"
                    : "text-gray-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => toggleBillingCycle("yearly")}
                className={`px-6 py-2 text-sm font-medium ${
                  billingCycle === "yearly"
                    ? "bg-blue-600 text-white rounded-lg"
                    : "text-gray-700"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Object.values(productSubscriptionDetails).map((product) => {
              const Icon = iconMapping[product.icon];
              const monthlyPrice = product.price / 12;
              const yearlyPrice = product.price;
              const displayedPrice =
                billingCycle === "monthly" ? monthlyPrice : yearlyPrice;
              const productId = product.productId;

              // Check if user has an active subscription for this product
              const isSubscribed = subscriptions.some(
                (sub) =>
                  sub.productId === productId &&
                  sub.subscriptionStatus === "active"
              );

              return (
                <div
                  key={product.productId}
                  className={`p-6 relative ${
                    product.productId === activeProductId
                      ? " bg-gray-800 border border-green-600 "
                      : "bg-gray-900 "
                  } rounded-2xl shadow-lg text-center flex flex-col items-center justify-between gap-6 transition-transform duration-300 hover:scale-105`}
                >
                  <div className="flex flex-col items-center">
                    {Icon && (
                      <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center">
                        <Icon className="h-12 w-12 text-white" />
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-orange-400 mt-4">
                      {product.name}
                    </h3>
                  </div>
                  <div>
                    <p className="text-4xl font-extrabold text-white">
                      ${displayedPrice.toFixed(2)}
                      <span className="text-lg font-medium text-white">
                        {" "}
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </p>
                    {billingCycle === "yearly" && (
                      <p className="text-sm text-white">(Billed annually)</p>
                    )}
                  </div>
                  <ul className="text-left text-white space-y-2">
                    {product.inclusions.map((inclusion, index) => (
                      <li
                        key={index}
                        className={`flex items-center gap-2 ${
                          inclusion.isIncluded
                            ? "text-white"
                            : "text-red-400 line-through"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 ${
                            inclusion.isIncluded
                              ? "bg-green-500"
                              : "bg-gray-400"
                          } rounded-full`}
                        ></span>
                        {inclusion.label}
                      </li>
                    ))}
                  </ul>

                  {!login && (
                    <SignedOut>
                      <Button
                        onClick={() => router.push("/sign-in")}
                        className="w-full rounded-md text-base text-white bg-cover bg-green-700"
                      >
                        Login
                      </Button>
                    </SignedOut>
                  )}

                  <SignedIn>
                    {isSubscribed ? (
                      <Button className="w-full rounded-md text-base text-white bg-cover bg-green-700">
                        Subscribed
                      </Button>
                    ) : (
                      <Checkout
                        productId={productId}
                        billingCycle={billingCycle}
                        amount={displayedPrice}
                      />
                    )}
                  </SignedIn>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
