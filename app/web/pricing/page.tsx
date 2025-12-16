"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { useTheme } from "next-themes";
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
  LucideIcon,
} from "lucide-react";

// Components
import { Checkout } from "@/components/shared/Checkout";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { Switch } from "@/components/ui/switch";

// Constants & Types
import { productSubscriptionDetails } from "@/constant";
import { apiClient } from "@/lib/utils";

// Types
interface Subscription {
  chatbotType: string;
  clerkId: string;
  status: string;
  billingCycle: string;
}

interface Product {
  productId: string;
  name: string;
  icon: string;
  mprice: number;
  yprice: number;
  original: number;
  inclusions: Array<{
    label: string;
    isIncluded: boolean;
  }>;
}

type BillingMode = "monthly" | "yearly";

// Icon mapping with proper typing
const iconMapping: Record<string, LucideIcon> = {
  HeadsetIcon,
  AmbulanceIcon,
  BotIcon,
  Bot,
  GraduationCapIcon,
  ShoppingCartIcon,
  Building2Icon,
};

// Constants
const ALL_FEATURES = [
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
];

const PricingContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, isLoaded } = useAuth();
  const { theme, resolvedTheme } = useTheme();

  // State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingMode, setBillingMode] = useState<BillingMode>("monthly");
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const currentTheme = resolvedTheme || theme || "light";
  const activeProductId = searchParams.get("id");

  // Theme-based styles
  const themeStyles = useMemo(() => {
    const isDark = currentTheme === "dark";
    return {
      textPrimary: isDark ? "text-white" : "text-n-7",
      textSecondary: isDark ? "text-gray-300" : "text-n-5",
      textMuted: isDark ? "text-gray-400" : "text-n-5",
      containerBg: isDark ? "bg-transparent" : "bg-gray-100",
      badgeBg: isDark
        ? "bg-blue-100/10 text-blue-400 border-blue-400/30"
        : "bg-blue-100 text-blue-600 border-blue-300",
      tableHeaderBg: isDark
        ? "bg-gradient-to-r from-[#1a1a1a] to-[#2a0b45]"
        : "bg-gradient-to-r from-gray-100 to-gray-200",
      tableBorder: isDark ? "border-[#B026FF]/30" : "border-gray-300",
      tableRowHover: isDark ? "hover:bg-[#1a1a1a]/50" : "hover:bg-gray-100/50",
      saveBadgeBg: isDark
        ? "bg-green-900/20 text-green-400 border-green-400/30"
        : "bg-green-100 text-green-600 border-green-300",
    };
  }, [currentTheme]);

  // Fetch subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!isLoaded) return;

      try {
        setIsLoading(true);
        setError(null);

        if (!userId) {
          setSubscriptions([]);
          return;
        }

        const response = await apiClient.getSubscriptions(userId);

        if (!response || !Array.isArray(response)) {
          throw new Error("Invalid response format");
        }

        const formattedSubscriptions: Subscription[] = response.map(
          (sub: any) => ({
            chatbotType: sub.chatbotType || "",
            clerkId: sub.clerkId || "",
            status: sub.status || "inactive",
            billingCycle: sub.billingCycle || "monthly",
          })
        );

        setSubscriptions(formattedSubscriptions);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setError("Failed to load subscription data. Please try again.");
        setSubscriptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userId, isLoaded]);

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent border-blue-600 rounded-full animate-spin mx-auto" />
          <p className={`mt-4 ${themeStyles.textPrimary} text-gray-600`}>
            Loading pricing information...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Helper functions
  const getProductPrice = (product: Product) => {
    const price = billingMode === "monthly" ? product.mprice : product.yprice;
    const originalPrice =
      billingMode === "monthly" ? product.original / 12 : product.original;

    return {
      displayPrice: price,
      originalPrice,
      isYearly: billingMode === "yearly",
    };
  };

  const isProductSubscribed = (productId: string) => {
    return subscriptions.some(
      (sub) => sub.chatbotType === productId && sub.status === "active"
    );
  };

  const getCardStyles = (productId: string) => {
    const isActive = productId === activeProductId;
    const isDark = currentTheme === "dark";

    if (isActive) {
      return "scale-105 z-10 border-[#2d8246]/30 hover:border-[#2d8246] bg-[#34e468]/5";
    }

    return isDark
      ? "border-[#FF2E9F]/20 hover:border-[#FF2E9F]"
      : "border-gray-300 hover:border-[#FF2E9F]";
  };

  const getGradientBg = (productId: string) => {
    const isDark = currentTheme === "dark";
    const opacity = isDark ? "10" : "5";

    if (productId === "chatbot-lead-generation") {
      return `from-[#B026FF]/${opacity}`;
    }
    if (productId === "chatbot-education") {
      return `from-[#00F0FF]/${opacity}`;
    }
    return `from-[#FF2E9F]/${opacity}`;
  };

  // Render functions
  const renderHeader = () => (
    <section className="py-16 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto text-center">
        <div
          className={`inline-flex items-center ${themeStyles.badgeBg} border rounded-full px-4 py-1 mb-4`}
        >
          <Zap className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">
            AI-Powered Automation Solutions
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
          Transform Your Business with AI
        </h1>

        <p
          className={`text-xl ${themeStyles.textSecondary} font-montserrat mb-8 max-w-2xl mx-auto`}
        >
          Advanced AI solutions tailored to optimize operations, enhance
          customer experiences, and drive growth.
        </p>

        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-medium ${
              billingMode === "monthly"
                ? themeStyles.textPrimary
                : themeStyles.textMuted
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
              billingMode === "yearly"
                ? themeStyles.textPrimary
                : themeStyles.textMuted
            }`}
          >
            Yearly
          </span>
          <div
            className={`${themeStyles.saveBadgeBg} text-xs border rounded-full px-3 py-1 ml-2`}
          >
            Save 16%
          </div>
        </div>
      </div>
    </section>
  );

  const renderPricingCard = (product: Product) => {
    const Icon = iconMapping[product.icon];
    const { displayPrice, originalPrice, isYearly } = getProductPrice(product);
    const isSubscribed = isProductSubscribed(product.productId);
    const isMostPopular = product.productId === "chatbot-lead-generation";

    return (
      <div
        key={product.productId}
        className={`relative group h-full flex flex-col items-center justify-between rounded-lg backdrop-blur-sm border transition-all duration-300 p-5 ${
          currentTheme === "dark" ? "bg-transparent" : "bg-white/80"
        } ${getCardStyles(product.productId)}`}
      >
        {/* Popular Badge */}
        {isMostPopular && (
          <div className="absolute -top-3 left-0 right-0 text-center">
            <span className="bg-gradient-to-r from-[#B026FF] to-[#FF2E9F] text-black text-sm font-bold py-1 px-4 rounded-full">
              Most Popular
            </span>
          </div>
        )}

        {/* Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${getGradientBg(
            product.productId
          )} to-transparent`}
        />

        <div className="flex flex-col items-center gap-3 w-full z-10">
          {Icon && (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#B026FF] flex items-center justify-center mb-6">
              <Icon className="h-8 w-8 text-black" />
            </div>
          )}

          <h3 className={`text-2xl font-bold ${themeStyles.textPrimary}`}>
            {product.name}
          </h3>
        </div>

        <div className="w-full text-center z-10">
          <div className="flex items-center py-5 justify-center gap-3">
            <p
              className={`text-xl font-bold ${themeStyles.textMuted} line-through`}
            >
              ${originalPrice.toFixed(0)}
            </p>
            <p className="text-3xl font-bold text-[#B026FF]">
              ${displayPrice.toFixed(0)}
              <span className={`text-lg font-medium ${themeStyles.textMuted}`}>
                /{billingMode === "monthly" ? "mo" : "yr"}
              </span>
            </p>
          </div>

          {isYearly && (
            <p className="text-center text-green-400 mt-2 font-medium">
              Save ${(originalPrice - displayPrice).toFixed(0)} annually
            </p>
          )}
        </div>

        <ul className="w-full space-y-4 z-10">
          {product.inclusions.map((inclusion, index) => (
            <li
              key={index}
              className={`flex items-start gap-3 ${
                inclusion.isIncluded
                  ? themeStyles.textPrimary
                  : themeStyles.textMuted
              }`}
            >
              <span
                className={`flex-shrink-0 w-5 h-5 mt-1 rounded-full flex items-center justify-center ${
                  inclusion.isIncluded
                    ? "bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black"
                    : currentTheme === "dark"
                    ? "bg-gray-700"
                    : "bg-gray-400"
                }`}
              >
                {inclusion.isIncluded && <Check className="w-3 h-3" />}
              </span>
              <span className="flex-1 font-montserrat">{inclusion.label}</span>
            </li>
          ))}
        </ul>

        <div className="w-full mt-3 z-10">
          {!userId ? (
            <SignedOut>
              <button
                onClick={() => router.push("/sign-in")}
                className="w-full py-3 rounded-full font-bold bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </SignedOut>
          ) : (
            <SignedIn>
              {isSubscribed ? (
                <button
                  className="w-full py-2 rounded-full font-bold bg-gradient-to-r from-green-500 to-green-700 text-black cursor-not-allowed"
                  disabled
                >
                  Subscribed
                </button>
              ) : (
                <Checkout
                  userId={userId}
                  productId={product.productId}
                  billingCycle={billingMode}
                  amount={displayPrice}
                />
              )}
            </SignedIn>
          )}
        </div>
      </div>
    );
  };

  const renderComparisonTable = () => (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${themeStyles.textPrimary} mb-4`}>
            Feature Comparison
          </h2>
          <p className={`text-xl ${themeStyles.textSecondary}`}>
            See how our solutions compare
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={themeStyles.tableHeaderBg}>
                <th
                  className={`text-left py-4 px-6 font-semibold ${themeStyles.textPrimary} border-b ${themeStyles.tableBorder}`}
                >
                  Features
                </th>
                {Object.values(productSubscriptionDetails).map((product) => (
                  <th
                    key={product.productId}
                    className={`text-center py-4 px-6 font-semibold ${themeStyles.textPrimary} border-b ${themeStyles.tableBorder}`}
                  >
                    {product.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`divide-y font-montserrat ${
                currentTheme === "dark" ? "divide-[#333]" : "divide-gray-300"
              }`}
            >
              {ALL_FEATURES.map((feature) => (
                <tr key={feature} className={themeStyles.tableRowHover}>
                  <td
                    className={`py-4 px-6 font-medium ${themeStyles.textSecondary}`}
                  >
                    {feature}
                  </td>
                  {Object.values(productSubscriptionDetails).map((product) => {
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
                          <span className={themeStyles.textMuted}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  return (
    <div
      className={`flex flex-col items-center min-h-screen relative z-10 max-w-7xl mx-auto ${themeStyles.containerBg}`}
    >
      <BreadcrumbsDefault />

      <div className="w-full px-4 py-8 relative z-10">
        {renderHeader()}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.values(productSubscriptionDetails).map(renderPricingCard)}
        </div>

        {renderComparisonTable()}
      </div>
    </div>
  );
};

// Main component with Suspense boundary
export default function Pricing() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading pricing information...</p>
          </div>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
