"use client";

import { Footer } from "@/components/shared/Footer";

import { SignedIn, SignedOut } from "@clerk/nextjs";
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
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Checkout } from "@/components/shared/Checkout";
const iconMapping: Record<string, any> = {
  HeadsetIcon: HeadsetIcon,
  AmbulanceIcon: AmbulanceIcon,
  BotIcon: BotIcon,
  Bot: Bot,
  GraduationCapIcon: GraduationCapIcon,
  ShoppingCartIcon: ShoppingCartIcon,
  Building2Icon: Building2Icon,
};
// export const metadata: Metadata = {
//   title: "privacy-policy",
//   description: "Create Website,ai agent,chatbots in best quality",
// };
const Pricing = () => {
  const searchParams = useSearchParams();
  const activeProductId = searchParams.get("id");

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const toggleBillingCycle = (cycle: "monthly" | "yearly") => {
    setBillingCycle(cycle);
  };

  return (
    <div className="">
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
              return (
                <div
                  key={product.productId}
                  className={`p-6 relative ${
                    product.productId === activeProductId
                      ? " bg-gray-800 border border-green-600 "
                      : "bg-gray-900 "
                  } rounded-2xl shadow-lg text-center flex flex-col items-center justify-between gap-6`}
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
                  <SignedOut>
                    <Link href={"/sigh-in"} className="credits-btn">
                      Login
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Checkout
                      productId={productId}
                      billingCycle={billingCycle}
                      amount={displayedPrice}
                    />
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
