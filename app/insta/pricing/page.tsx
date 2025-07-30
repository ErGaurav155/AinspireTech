"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Check, Zap, X, Loader2, BadgeCheck } from "lucide-react";
import PaymentModal from "@/components/insta/PaymentModal";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { getUserById } from "@/lib/action/user.actions";
import { useRouter, useSearchParams } from "next/navigation";
import { PricingPlan } from "@/types/types";
import {
  getInstaSubscriptionInfo,
  cancelRazorPaySubscription,
} from "@/lib/action/subscription.action";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { instagramPricingPlans } from "@/constant";
import { toast } from "sonner";
import { setSubsciptionCanceled } from "@/lib/action/subscription.action";
import { Button } from "@/components/ui/button";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import { getInstaAccount } from "@/lib/action/insta.action";

export default function Pricing() {
  const { userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeProductId = searchParams.get("code");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [buyerId, setBuyerId] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isInstaAccount, setIsInstaAccount] = useState(false);

  const [islogged, setIslogged] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isgettingAcc, setIsGettingAcc] = useState(false);

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data and subscription info
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);

      if (!userId) {
        setIslogged(false);
        setIsLoading(false);
        return;
      }

      try {
        const buyer = await getUserById(userId);
        if (!buyer) {
          router.push("/sign-in");
          return;
        }

        setBuyerId(buyer._id);
        setIslogged(true);
        const account = await getInstaAccount(userId);
        if (!account?.success || account.account === "No account found") {
          setIsInstaAccount(false);
          if (activeProductId) {
            setIsGettingAcc(true);
            const response = await fetch(
              `/api/insta/callback?code=${activeProductId}&userId=${userId}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            const data = await response.json();

            if (response.ok) {
              setIsInstaAccount(true);
              // Handle successful connection
            } else {
              throw new Error(data.error || "Failed to connect account");
            }
            setIsGettingAcc(false);
          }
        } else {
          setIsInstaAccount(true);
        }

        // Fetch subscription info

        const response = await fetch(`/api/insta/subscription/list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok) {
          if (data.length > 0) {
            setIsSubscribed(true);
            setCurrentSubscription(data[0]);
          } else {
            setIsSubscribed(false);
            setCurrentSubscription(null);
          }
        } else {
          throw new Error(data.error || "Failed to fetch subscription data");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast.error("Failed to load subscription data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, router, activeProductId]);

  const handleSubscribe = async (
    plan: PricingPlan,
    cycle: "monthly" | "yearly"
  ) => {
    if (
      currentSubscription &&
      currentSubscription.productId === plan.id &&
      currentSubscription.billingCycle === cycle
    ) {
      return;
    }

    if (currentSubscription && currentSubscription.productId !== plan.id) {
      try {
        setIsUpgrading(true);
        setSelectedPlan(plan);

        // Cancel current subscription
        const cancelResult = await cancelRazorPaySubscription(
          currentSubscription.subscriptionId,
          "Upgrading to new plan",
          "Immediate"
        );

        if (!cancelResult.success) {
          toast.error("Failed to cancel current subscription", {
            description: cancelResult.message,
          });
          setIsUpgrading(false);
          return;
        }

        // Update database status
        await setSubsciptionCanceled(
          currentSubscription.subscriptionId,
          "Upgraded to new plan"
        );

        toast.success("Current subscription cancelled", {
          description: "You can now select a new plan",
        });

        // Clear current subscription
        setCurrentSubscription(null);
        setIsSubscribed(false);

        // Open payment modal for new plan
        setIsPaymentModalOpen(true);
      } catch (error) {
        console.error("Error cancelling subscription:", error);
        toast.error("Failed to cancel current subscription");
        setIsUpgrading(false);
      }
    } else {
      // Open payment modal for new plan
      setSelectedPlan(plan);
      setIsPaymentModalOpen(true);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    setIsCancelling(true);
    try {
      const cancelResult = await cancelRazorPaySubscription(
        currentSubscription.subscriptionId,
        "User requested cancellation",
        "Immediate"
      );

      if (!cancelResult.success) {
        toast.error("Failed to cancel subscription", {
          description: cancelResult.message,
        });
        return;
      }

      // Update database status
      await setSubsciptionCanceled(
        currentSubscription.subscriptionId,
        "User requested cancellation"
      );

      toast.success("Subscription cancelled successfully", {
        description: "Your plan has been cancelled",
      });

      // Clear current subscription
      setCurrentSubscription(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#00F0FF]" />
          <p className="mt-4 text-gray-400">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white ">
      <BreadcrumbsDefault />
      <section className="py-16 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center  text-blue-400 border border-blue-400/30 rounded-full px-4 py-1 mb-4">
            <Zap className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">
              Never Miss a Customer Comment
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
            Instagram Comment Automation
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-mono">
            Reply instantly to every comment. No setup fees. Cancel anytime.
          </p>

          {/* Current Subscription Info */}
          {currentSubscription && (
            <div className="mb-10 p-6 bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#00F0FF]/30 rounded-xl">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Your Current Plan
                  </h2>
                  <p className="text-gray-300">
                    {
                      instagramPricingPlans.find(
                        (p) => p.id === currentSubscription.productId
                      )?.name
                    }{" "}
                    ({currentSubscription.billingCycle})
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Status: Active</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    {isCancelling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    Cancel Subscription
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#00F0FF] to-[#00F0FF]/70"
                    onClick={() => router.push("/insta/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mb-12">
            <span
              className={`text-sm font-medium ${
                billingCycle === "monthly" ? "text-white" : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <Switch
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) =>
                setBillingCycle(checked ? "yearly" : "monthly")
              }
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#00F0FF] data-[state=checked]:to-[#FF2E9F]"
              disabled={isSubscribed}
            />
            <span
              className={`text-sm font-medium ${
                billingCycle === "yearly" ? "text-white" : "text-gray-500"
              }`}
            >
              Yearly
            </span>
            <div className="bg-green-900/20 text-xs text-green-400 border border-green-400/30 rounded-full px-3 py-1 md:ml-2">
              Save 16%
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {instagramPricingPlans.map((plan) => {
              const isCurrentPlan =
                currentSubscription &&
                currentSubscription.productId === plan.id &&
                currentSubscription.billingCycle === billingCycle;
              const isUpgradeOption =
                currentSubscription &&
                currentSubscription.productId !== plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative group rounded-lg backdrop-blur-sm border transition-all duration-300 ${
                    plan.popular
                      ? "scale-105 z-10 border-[#B026FF]/30 hover:border-[#B026FF]"
                      : plan.id === "Insta-Automation-Starter"
                      ? "border-[#00F0FF]/20 hover:border-[#00F0FF]"
                      : "border-[#FF2E9F]/20 hover:border-[#FF2E9F]"
                  } ${
                    isCurrentPlan ? "ring-2 ring-[#00F0FF] ring-opacity-80" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-0 right-0 text-center">
                      <span className="bg-gradient-to-r from-[#B026FF] to-[#FF2E9F] text-black text-sm font-bold py-1 px-4 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-0 right-0 text-center">
                      <span className="bg-gradient-to-r from-[#00F0FF] to-[#00F0FF]/70 text-black text-sm font-bold py-1 px-4 rounded-full">
                        Your Current Plan
                      </span>
                    </div>
                  )}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${
                      plan.popular
                        ? "from-[#B026FF]/10"
                        : plan.id === "Insta-Automation-Starter"
                        ? "from-[#00F0FF]/10"
                        : "from-[#FF2E9F]/10"
                    } to-transparent`}
                  ></div>
                  <div className="relative z-10 h-full flex flex-col items-center justify-between p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold mb-2 text-white">
                        {plan.name}
                      </h3>
                      {isCurrentPlan && (
                        <BadgeCheck className="h-6 w-6 text-[#00F0FF]" />
                      )}
                    </div>
                    <p className="text-gray-400 mb-6 font-mono text-lg">
                      {plan.description}
                    </p>
                    <div className="flex items-end mb-6">
                      <span
                        className={`text-3xl font-bold ${
                          plan.popular
                            ? "text-[#B026FF]"
                            : plan.id === "Insta-Automation-Starter"
                            ? "text-[#00F0FF]"
                            : "text-[#FF2E9F]"
                        }`}
                      >
                        ${" "}
                        {billingCycle === "monthly"
                          ? plan.monthlyPrice.toFixed(0)
                          : plan.yearlyPrice.toFixed(0)}
                      </span>
                      <span className="text-gray-400 ml-1">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    {billingCycle === "yearly" && (
                      <p className="text-center text-green-400 my-2 font-medium">
                        Two Months Free Subscription On Yearly Plan.
                      </p>
                    )}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check
                            className={`h-5 w-5 mt-1 mr-3 ${
                              plan.popular
                                ? "text-[#B026FF]"
                                : plan.id === "Insta-Automation-Starter"
                                ? "text-[#00F0FF]"
                                : "text-[#FF2E9F]"
                            }`}
                          />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <SignedOut>
                      <button
                        onClick={() => router.push("/sign-in")}
                        className={`w-full py-3 rounded-full font-medium hover:opacity-90 transition-opacity whitespace-nowrap ${
                          plan.popular
                            ? "bg-gradient-to-r from-[#B026FF] to-[#FF2E9F]"
                            : plan.id === "Insta-Automation-Starter"
                            ? "bg-gradient-to-r from-[#00F0FF]/80 to-[#00F0FF]"
                            : "bg-gradient-to-r from-[#FF2E9F]/80 to-[#FF2E9F]"
                        } text-black`}
                      >
                        Get Started
                      </button>
                    </SignedOut>
                    <SignedIn>
                      <button
                        onClick={() => handleSubscribe(plan, billingCycle)}
                        disabled={isCurrentPlan || isUpgrading || isCancelling}
                        className={`w-full py-3 rounded-full font-medium hover:opacity-90 transition-opacity whitespace-nowrap ${
                          isCurrentPlan
                            ? "bg-gray-700 cursor-not-allowed"
                            : plan.popular
                            ? "bg-gradient-to-r from-[#B026FF] to-[#FF2E9F]"
                            : plan.id === "Insta-Automation-Starter"
                            ? "bg-gradient-to-r from-[#00F0FF]/80 to-[#00F0FF]"
                            : "bg-gradient-to-r from-[#FF2E9F]/80 to-[#FF2E9F]"
                        } text-black disabled:opacity-70 disabled:cursor-not-allowed`}
                      >
                        {isUpgrading && selectedPlan?.id === plan.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </div>
                        ) : isCurrentPlan ? (
                          "Current Plan"
                        ) : isUpgradeOption ? (
                          "Upgrade Plan"
                        ) : (
                          "Start Automating"
                        )}
                      </button>
                    </SignedIn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Feature Comparison
            </h2>
            <p className="text-xl text-gray-300">
              Everything you get with each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[#333]">
                  <th className="text-left py-4 px-6 font-semibold text-white">
                    Features
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-[#00F0FF]">
                    Starter
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-[#B026FF]">
                    Growth
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-[#FF2E9F]">
                    Professional
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {[
                  {
                    feature: "Comments per month",
                    starter: "500",
                    growth: "2,000",
                    pro: "10,000",
                  },
                  {
                    feature: "Reply templates",
                    starter: "3",
                    growth: "10",
                    pro: "Unlimited",
                  },
                  {
                    feature: "Keyword triggers",
                    starter: "Basic",
                    growth: "Advanced",
                    pro: "Advanced+",
                  },
                  {
                    feature: "AI spam filter",
                    starter: "✓",
                    growth: "✓",
                    pro: "✓",
                  },
                  {
                    feature: "Sentiment analysis",
                    starter: "✗",
                    growth: "✗",
                    pro: "✓",
                  },
                  {
                    feature: "Custom workflows",
                    starter: "✗",
                    growth: "Basic",
                    pro: "Advanced",
                  },
                  {
                    feature: "Email support",
                    starter: "✓",
                    growth: "✓",
                    pro: "✓",
                  },
                  {
                    feature: "Priority support",
                    starter: "✗",
                    growth: "✓",
                    pro: "24/7",
                  },
                  {
                    feature: "Response analytics",
                    starter: "Basic",
                    growth: "Advanced",
                    pro: "Advanced+",
                  },
                  {
                    feature: "WhatsApp notifications",
                    starter: "✗",
                    growth: "✓",
                    pro: "✓",
                  },
                  {
                    feature: "Multi-language support",
                    starter: "✗",
                    growth: "✗",
                    pro: "✓",
                  },
                  {
                    feature: "Instagram accounts",
                    starter: "1",
                    growth: "3",
                    pro: "10",
                  },
                  {
                    feature: "CRM integration",
                    starter: "✗",
                    growth: "✗",
                    pro: "✓",
                  },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-[#1a1a1a]/50">
                    <td className="py-4 px-6 font-medium text-gray-300">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.starter === "✓" ? (
                        <Check className="h-5 w-5 text-[#00F0FF] mx-auto" />
                      ) : row.starter === "✗" ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        <span className="text-gray-300">{row.starter}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.growth === "✓" ? (
                        <Check className="h-5 w-5 text-[#B026FF] mx-auto" />
                      ) : row.growth === "✗" ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        <span className="text-gray-300">{row.growth}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.pro === "✓" ? (
                        <Check className="h-5 w-5 text-[#FF2E9F] mx-auto" />
                      ) : row.pro === "✗" ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        <span className="text-gray-300">{row.pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {islogged && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          billingCycle={billingCycle}
          buyerId={buyerId}
          isSubscribed={isSubscribed}
          isInstaAccount={isInstaAccount}
          isgettingAcc={isgettingAcc}
          onSuccess={(newSubscription) => {
            setCurrentSubscription(newSubscription);
            setIsSubscribed(true);
            setIsUpgrading(false);
          }}
        />
      )}
    </div>
  );
}
