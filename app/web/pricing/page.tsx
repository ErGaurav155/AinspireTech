"use client";

import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { productSubscriptionDetails } from "@/constant";
import {
  HeadsetIcon,
  AmbulanceIcon,
  BotIcon,
  GraduationCapIcon,
  ShoppingCartIcon,
  Building2Icon,
  Bot,
  Check,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Checkout } from "@/components/shared/Checkout";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/utils";

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
  chatbotType: string;
  clerkId: string;
  status: string;
  billingCycle: string;
}

const Pricing = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [login, setLogin] = useState(true);
  const router = useRouter();
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const activeProductId = searchParams.get("id");

  const [billingMode, setBillingMode] = useState<"monthly" | "yearly">(
    "monthly"
  );

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!userId) {
        setLogin(false);
        setLoading(false);
      } else {
        try {
          const response = await apiClient.getSubscriptions(userId);

          const filteredSubscriptions = response.map((sub: any) => ({
            chatbotType: sub.chatbotType,
            clerkId: sub.clerkId,
            status: sub.status,
            billingCycle: sub.billingCycle,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white font-bold text-xl relative z-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen relative z-10 max-w-7xl m-auto">
      <BreadcrumbsDefault />

      <div className="w-full  px-4 py-8 relative z-10">
        {/* Updated Header Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-blue-100/10 text-blue-400 border border-blue-400/30 rounded-full px-4 py-1 mb-4">
              <Zap className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">
                AI-Powered Automation Solutions
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
              Transform Your Business with AI
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-montserrat">
              Advanced AI solutions tailored to optimize operations, enhance
              customer experiences, and drive growth for businesses of all
              sizes.
            </p>

            {/* Enhanced Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span
                className={`text-sm font-medium ${
                  billingMode === "monthly" ? "text-white" : "text-gray-500"
                }`}
              >
                Monthly
              </span>
              <Switch
                checked={billingMode === "yearly"}
                onCheckedChange={(checked) =>
                  setBillingMode(checked ? "yearly" : "monthly")
                }
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#00F0FF] data-[state=checked]:to-[#FF2E9F]"
              />
              <span
                className={`text-sm font-medium ${
                  billingMode === "yearly" ? "text-white" : "text-gray-500"
                }`}
              >
                Yearly
              </span>
              <div className="bg-green-900/20 text-green-400 border border-green-400/30 rounded-full px-3 py-1 ml-2">
                Save 16%
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards with Enhanced UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.values(productSubscriptionDetails).map((product) => {
            const Icon = iconMapping[product.icon];
            const monthlyPrice = product.mprice;
            const yearlyPrice = product.yprice;
            const displayedPrice =
              billingMode === "monthly" ? monthlyPrice : yearlyPrice;
            const productId = product.productId;
            const monthlyOriginalPrice = product.original / 12;
            const yearlyOriginalPrice = product.original;
            const originalPrice =
              billingMode === "monthly"
                ? monthlyOriginalPrice
                : yearlyOriginalPrice;

            const isSubscribed = subscriptions.some(
              (sub) => sub.chatbotType === productId && sub.status === "active"
            );

            return (
              <div
                key={product.productId}
                className={`relative group h-full flex flex-col items-center justify-between rounded-lg backdrop-blur-sm border transition-all duration-300 p-5
                  ${
                    product.productId === activeProductId
                      ? "scale-105 z-10 border-[#2d8246]/30 hover:border-[#2d8246] bg-[#34e468]/5"
                      : "border-[#FF2E9F]/20 hover:border-[#FF2E9F]"
                  }`}
              >
                {/* Popular Badge */}
                {product.productId === "chatbot-lead-generation" && (
                  <div className="absolute -top-3 left-0 right-0 text-center">
                    <span className="bg-gradient-to-r from-[#B026FF] to-[#FF2E9F] text-black text-sm font-bold py-1 px-4 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Gradient Background Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${
                    product.productId === "chatbot-lead-generation"
                      ? "from-[#B026FF]/10"
                      : product.productId === "chatbot-education"
                      ? "from-[#00F0FF]/10"
                      : "from-[#FF2E9F]/10"
                  } to-transparent`}
                ></div>
                <div className=" flex flex-col items-center gap-3 w-full">
                  {Icon && (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#B026FF] flex items-center justify-center mb-6">
                      <Icon className="h-8 w-8 text-black" />
                    </div>
                  )}

                  <div className="w-full flex justify-center relative">
                    <h3 className="text-2xl font-bold text-white text-start">
                      {product.name}
                    </h3>
                  </div>
                </div>

                <div className=" w-full text-center">
                  <div className="flex items-center py-5 justify-center gap-3">
                    <p className="text-xl font-bold text-gray-400 line-through">
                      ${originalPrice.toFixed(0)}
                    </p>
                    <p className="text-3xl font-bold text-[#B026FF]">
                      ${displayedPrice.toFixed(0)}
                      <span className="text-lg font-medium text-gray-400">
                        /{billingMode === "monthly" ? "mo" : "yr"}
                      </span>
                    </p>
                  </div>

                  {billingMode === "yearly" && (
                    <p className="text-center text-green-400 mt-2 font-medium font-montserrat">
                      Save ${(originalPrice - displayedPrice).toFixed(0)}{" "}
                      annually
                    </p>
                  )}
                </div>

                <ul className=" w-full text-left text-gray-300 space-y-4">
                  {product.inclusions.map((inclusion, index) => (
                    <li
                      key={index}
                      className={`flex items-start gap-3 ${
                        inclusion.isIncluded ? "text-white" : "text-gray-500"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-5 h-5 mt-1 ${
                          inclusion.isIncluded
                            ? "bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black"
                            : "bg-gray-700"
                        } rounded-full flex items-center justify-center`}
                      >
                        {inclusion.isIncluded && <Check className="w-3 h-3" />}
                      </span>
                      <span className="flex-1 font-montserrat">
                        {inclusion.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {!login && (
                  <SignedOut>
                    <button
                      onClick={() => router.push("/sign-in")}
                      className=" w-full mt-3 py-3 rounded-full font-bold bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black hover:opacity-90 transition-opacity"
                    >
                      Get Started
                    </button>
                  </SignedOut>
                )}

                <SignedIn>
                  {isSubscribed ? (
                    <button
                      className=" w-full py-2 mt-3 rounded-full font-bold bg-gradient-to-r from-green-500 to-green-700 text-black cursor-not-allowed self-end"
                      disabled
                    >
                      Subscribed
                    </button>
                  ) : (
                    <Checkout
                      productId={productId}
                      billingCycle={billingMode}
                      amount={displayedPrice}
                    />
                  )}
                </SignedIn>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className=" mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Feature Comparison
              </h2>
              <p className="text-xl text-gray-300 font-montserrat">
                See how our solutions compare
              </p>
            </div>

            <div className="overflow-x-auto ">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#1a1a1a] to-[#2a0b45]">
                    <th className="text-left py-4 px-6 font-semibold text-white border-b border-[#B026FF]/30">
                      Features
                    </th>
                    {Object.values(productSubscriptionDetails).map(
                      (product) => (
                        <th
                          key={product.productId}
                          className="text-center py-4 px-6 font-semibold text-white border-b border-[#B026FF]/30"
                        >
                          {product.name}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333] font-montserrat">
                  {[
                    "24/7 Availability",
                    "Live Chat Interface",
                    "Multi-language Support",
                    "Dashboard Availability",
                    "Automated Responses",
                    "CRM Integration",
                    "Advanced Analytics",
                    "Custom Workflows",
                    "Lead qualification",
                    "Email Notifications",
                    "Priority Support",
                    "User Data Collection",
                    "Personalized learning",
                    "Interactive quizzes",
                  ].map((feature, index) => (
                    <tr key={index} className="hover:bg-[#1a1a1a]/50">
                      <td className="py-4 px-6 font-medium text-gray-300">
                        {feature}
                      </td>
                      {Object.values(productSubscriptionDetails).map(
                        (product) => {
                          const hasFeature = product.inclusions.some(
                            (inc) =>
                              inc.label.includes(feature.split(" ")[0]) &&
                              inc.isIncluded
                          );
                          return (
                            <td
                              key={product.productId}
                              className="py-4 px-6 text-center"
                            >
                              {hasFeature ? (
                                <Check className="h-5 w-5 text-[#00F0FF] mx-auto" />
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                          );
                        }
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Pricing;
