"use client";

import { Footer } from "@/components/shared/Footer";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { productSubscriptionDetails } from "@/constant";
import Bestseller from "@/public/assets/bestseller1.png";
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
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import Image from "next/image";

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
      <div className="flex items-center justify-center min-h-screen text-white font-bold text-xl relative z-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen relative z-10">
      <BreadcrumbsDefault />

      <div className="wrapper2 w-full max-w-6xl px-4 py-8 relative z-10">
        <div className="text-center my-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
            Unlock the Power of AI
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Unlock the power of AI-driven customer support and intelligent
            chatbots. Whether you are a{" "}
            <span className="text-[#00F0FF] font-medium">startup</span>,{" "}
            <span className="text-[#00F0FF] font-medium">growing business</span>
            , or an{" "}
            <span className="text-[#FF2E9F] font-medium">
              established enterprise
            </span>
            , our AI agents are tailored to{" "}
            <span className="text-[#FF2E9F] font-medium">
              optimize customer experiences
            </span>
            , drive <span className="text-[#B026FF] font-medium">sales</span>,
            and maximize{" "}
            <span className="text-[#B026FF] font-medium">
              operational efficiency
            </span>
            .
          </p>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-gray-800/50 backdrop-blur-sm border border-[#B026FF]/30 p-1 rounded-full">
            <button
              onClick={() => toggleBillingCycle("monthly")}
              className={`px-8 py-3 font-medium rounded-full ${
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black"
                  : "text-gray-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => toggleBillingCycle("yearly")}
              className={`px-8 py-3 font-medium rounded-full ${
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black"
                  : "text-gray-300"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.values(productSubscriptionDetails).map((product) => {
            const Icon = iconMapping[product.icon];
            const monthlyPrice = product.mprice;
            const yearlyPrice = product.yprice;
            const displayedPrice =
              billingCycle === "monthly" ? monthlyPrice : yearlyPrice;
            const productId = product.productId;
            const monthlyOriginalPrice = product.original / 12;
            const yearlyOriginalPrice = product.original;
            const originalPrice =
              billingCycle === "monthly"
                ? monthlyOriginalPrice
                : yearlyOriginalPrice;
            // Check if user has an active subscription for this product
            const isSubscribed = subscriptions.some(
              (sub) =>
                sub.productId === productId &&
                sub.subscriptionStatus === "active"
            );

            return (
              <div
                key={product.productId}
                className={`p-8 relative hover:bg-[#8955a7]/5 backdrop-blur-md border border-[#B026FF]/30 rounded-2xl flex flex-col items-center justify-between gap-8 transition-all duration-300 hover:border-[#00F0FF] ${
                  product.productId === activeProductId
                    ? "ring-4 ring-[#00F0FF] ring-opacity-50"
                    : ""
                }`}
              >
                <div className="flex flex-col items-center w-full">
                  {Icon && (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#B026FF] flex items-center justify-center mb-6">
                      <Icon className="h-10 w-10 text-black" />
                    </div>
                  )}

                  <div className="w-full flex justify-center relative">
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
                      {product.name}
                    </h3>

                    {(product.productId === "chatbot-lead-generation" ||
                      product.productId === "ai-agent-customer-support") && (
                      <div className="absolute -top-40 -right-2">
                        <Image
                          src={Bestseller}
                          alt="Bestseller"
                          width={100}
                          height={40}
                          priority
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-xl font-bold text-gray-400 line-through">
                      ${originalPrice.toFixed(0)}
                    </p>
                    <p className="text-4xl font-extrabold text-white">
                      ${displayedPrice.toFixed(0)}
                      <span className="text-lg font-medium text-gray-400">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    </p>
                  </div>

                  {billingCycle === "yearly" && (
                    <p className="text-center text-green-400 mt-2 font-medium">
                      Save ${(originalPrice - displayedPrice).toFixed(0)}{" "}
                      annually
                    </p>
                  )}
                </div>

                <ul className="w-full text-left text-gray-300 space-y-4">
                  {product.inclusions.map((inclusion, index) => (
                    <li
                      key={index}
                      className={`flex items-start gap-3 ${
                        inclusion.isIncluded ? "text-white" : "text-gray-500"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-5 h-5 mt-1 ${
                          inclusion.isIncluded ? "bg-green-500" : "bg-gray-700"
                        } rounded-full flex items-center justify-center`}
                      >
                        {inclusion.isIncluded && (
                          <svg
                            className="w-3 h-3 text-black"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1">{inclusion.label}</span>
                    </li>
                  ))}
                </ul>

                {!login && (
                  <SignedOut>
                    <button
                      onClick={() => router.push("/sign-in")}
                      className="w-full py-3 rounded-full font-bold bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90 transition-all duration-300"
                    >
                      Login to Subscribe
                    </button>
                  </SignedOut>
                )}

                <SignedIn>
                  {isSubscribed ? (
                    <button
                      className="w-full py-3 rounded-full font-bold bg-gradient-to-r from-green-500 to-green-700 text-black cursor-not-allowed"
                      disabled
                    >
                      Subscribed
                    </button>
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

      <Footer />
    </div>
  );
};

export default Pricing;
