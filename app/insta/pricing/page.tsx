"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Check, Zap, X, Loader2, BadgeCheck } from "lucide-react";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { getUserById } from "@/lib/action/user.actions";
import { useRouter, useSearchParams } from "next/navigation";
import { PricingPlan } from "@/types/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getInstaSubscriptionInfo,
  cancelRazorPaySubscription,
} from "@/lib/action/subscription.action";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { instagramPricingPlans } from "@/constant";
import { toast } from "sonner";
import { setSubsciptionCanceled } from "@/lib/action/subscription.action";
import { Button } from "@/components/ui/button";
import {
  getInstaAccount,
  getInstaAccounts,
  deleteInstaAccount,
} from "@/lib/action/insta.action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PaymentModal from "@/components/insta/PaymentModal";

// Confirm Subscription Change Dialog Component
interface ConfirmSubscriptionChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: PricingPlan | null;
  newPlan: PricingPlan | null;
  isLoading?: boolean;
}

function ConfirmSubscriptionChangeDialog({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  newPlan,
  isLoading = false,
}: ConfirmSubscriptionChangeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a]/90 backdrop-blur-lg border border-[#333] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            Confirm Subscription Change
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to change your subscription from{" "}
            {currentPlan?.name} to {newPlan?.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-300">
            Your current subscription will be cancelled immediately and you will
            be charged for the new plan.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-600 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-white"
          >
            {isLoading ? "Processing..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Account Selection Dialog Component
interface AccountSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedAccountIds: string[]) => void;
  accounts: any[];
  newPlan: PricingPlan | null;
  isLoading?: boolean;
}

function AccountSelectionDialog({
  isOpen,
  onClose,
  onConfirm,
  accounts,
  newPlan,
  isLoading = false,
}: AccountSelectionDialogProps) {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const getAccountLimit = (plan: PricingPlan | null) => {
    if (!plan) return 1;
    switch (plan.id) {
      case "Insta-Automation-Free":
        return 1;
      case "Insta-Automation-Starter":
        return 1;
      case "Insta-Automation-Growth":
        return 3;
      case "Insta-Automation-Professional":
        return 5;
      default:
        return 1;
    }
  };

  const accountLimit = getAccountLimit(newPlan);
  const accountsToDelete = Math.max(0, accounts.length - accountLimit);

  const handleAccountSelection = (accountId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccounts([...selectedAccounts, accountId]);
    } else {
      setSelectedAccounts(selectedAccounts.filter((id) => id !== accountId));
    }
  };

  const handleConfirm = () => {
    if (selectedAccounts.length >= accountsToDelete) {
      onConfirm(selectedAccounts);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a]/90 backdrop-blur-lg border border-[#333] rounded-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            Account Limit Exceeded
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            The {newPlan?.name} plan allows only {accountLimit} Instagram
            account(s). Please select {accountsToDelete} account(s) to delete.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-60 overflow-y-auto">
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account._id} className="flex items-center space-x-2">
                <Checkbox
                  id={account._id}
                  checked={selectedAccounts.includes(account._id)}
                  onCheckedChange={(checked) =>
                    handleAccountSelection(account._id, checked as boolean)
                  }
                  disabled={
                    selectedAccounts.length >= accountsToDelete &&
                    !selectedAccounts.includes(account._id)
                  }
                />
                <Label
                  htmlFor={account._id}
                  className="text-white cursor-pointer"
                >
                  {account.username}
                </Label>
              </div>
            ))}
          </div>
          {selectedAccounts.length < accountsToDelete && (
            <p className="text-sm text-red-400 mt-3">
              Please select {accountsToDelete - selectedAccounts.length} more
              account(s)
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-600 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || selectedAccounts.length < accountsToDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading
              ? "Processing..."
              : `Delete Selected Accounts (${selectedAccounts.length}/${accountsToDelete})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Pricing Component
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
  const [showSubCancelDialog, setShowSubCancelDialog] = useState(false);
  const [islogged, setIslogged] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isgettingAcc, setIsGettingAcc] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New states for dialogs
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [pendingBillingCycle, setPendingBillingCycle] = useState<
    "monthly" | "yearly"
  >("monthly");
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [isProcessingChange, setIsProcessingChange] = useState(false);

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

        // Fetch user's Instagram accounts
        const accountsResponse = await getInstaAccounts(userId);

        if (
          accountsResponse.success &&
          Array.isArray(accountsResponse.accounts)
        ) {
          setUserAccounts(accountsResponse.accounts);

          // Check if user has accounts or needs to connect one
          const hasAccounts = accountsResponse.accounts.length > 0;
          const needsAccountConnection =
            !hasAccounts ||
            (buyer.accountLimit &&
              accountsResponse.accounts.length < buyer.accountLimit);

          if (needsAccountConnection && activeProductId) {
            setIsGettingAcc(true);
            try {
              const response = await fetch(
                `/api/insta/callback?code=${activeProductId}&userId=${userId}`,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                }
              );
              const data = await response.json();

              if (response.ok) {
                setIsInstaAccount(true);
              } else {
                throw new Error(data.error || "Failed to connect account");
              }
            } catch (error) {
              console.error("Error connecting account:", error);
              setIsInstaAccount(false);
            } finally {
              setIsGettingAcc(false);
            }
          } else {
            setIsInstaAccount(hasAccounts);
          }
        } else {
          setIsInstaAccount(false);

          // Try to connect account if we have an active product ID
          if (activeProductId) {
            setIsGettingAcc(true);
            try {
              const response = await fetch(
                `/api/insta/callback?code=${activeProductId}&userId=${userId}`,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                }
              );
              const data = await response.json();

              if (response.ok) {
                setIsInstaAccount(true);
              } else {
                throw new Error(data.error || "Failed to connect account");
              }
            } catch (error) {
              console.error("Error connecting account:", error);
            } finally {
              setIsGettingAcc(false);
            }
          }
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

  // Get account limit for a plan
  const getAccountLimit = (plan: PricingPlan) => {
    switch (plan.id) {
      case "Insta-Automation-Free":
        return 1;
      case "Insta-Automation-Starter":
        return 1;
      case "Insta-Automation-Growth":
        return 3;
      case "Insta-Automation-Professional":
        return 5;
      default:
        return 1;
    }
  };

  // Handle subscription change
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

    // If user has a current subscription, show confirmation dialog
    if (currentSubscription) {
      setPendingPlan(plan);
      setPendingBillingCycle(cycle);
      setShowConfirmDialog(true);
    } else {
      // No current subscription, proceed directly
      setSelectedPlan(plan);
      setIsPaymentModalOpen(true);
    }
  };

  // Handle confirmed subscription change
  const handleConfirmedChange = async () => {
    if (!pendingPlan) return;

    setIsProcessingChange(true);
    setShowConfirmDialog(false);

    try {
      // First, cancel current subscription
      const cancelResult = await cancelRazorPaySubscription(
        currentSubscription.subscriptionId,
        "Changing to new plan",
        "Immediate"
      );

      if (!cancelResult.success) {
        toast.error("Failed to cancel current subscription", {
          description: cancelResult.message,
        });
        setIsProcessingChange(false);
        return;
      }

      // Update database status
      // await setSubsciptionCanceled(
      //   currentSubscription.subscriptionId,
      //   "Changed to new plan"
      // );

      // Check if we need to delete accounts
      const accountLimit = getAccountLimit(pendingPlan);
      if (userAccounts.length > accountLimit) {
        // Show account selection dialog
        setPendingPlan(pendingPlan);
        setShowAccountDialog(true);
      } else {
        // No need to delete accounts, proceed to payment
        setSelectedPlan(pendingPlan);
        setIsPaymentModalOpen(true);
      }
    } catch (error) {
      console.error("Error changing subscription:", error);
      toast.error("Failed to change subscription");
    } finally {
      setIsProcessingChange(false);
      setIsSubscribed(false);
    }
  };

  // Handle account deletion
  const handleAccountDeletion = async (selectedAccountIds: string[]) => {
    setIsProcessingChange(true);
    setShowAccountDialog(false);

    try {
      // Delete selected accounts
      for (const accountId of selectedAccountIds) {
        const result = await deleteInstaAccount(accountId, userId!);
        if (!result.success) {
          toast.error(`Failed to delete account: ${result.error}`);
          setIsProcessingChange(false);
          return;
        }
      }

      toast.success("Accounts deleted successfully");

      // Update user accounts list
      const updatedAccounts = userAccounts.filter(
        (account) => !selectedAccountIds.includes(account._id)
      );
      setUserAccounts(updatedAccounts);

      // Proceed to payment
      setSelectedPlan(pendingPlan);
      setIsPaymentModalOpen(true);
    } catch (error) {
      console.error("Error deleting accounts:", error);
      toast.error("Failed to delete accounts");
    } finally {
      setIsProcessingChange(false);
      setPendingPlan(null);
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
          <p className="text-xl  text-gray-300 mb-8 max-w-2xl mx-auto font-montserrat">
            Reply instantly to every comment. No setup fees. Cancel anytime.
          </p>

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
        <div className="max-w-6xl mx-auto ">
          <div
            className={`relative mb-10 group rounded-lg backdrop-blur-sm border transition-all duration-300 border-[#00F0FF]/20 hover:border-[#00F0FF] `}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity from-[#FF2E9F]/10 to-transparent`}
            ></div>
            <div className=" relative z-10 h-full flex flex-col md:flex-row items-center justify-between p-6">
              <div className="flex-[10%] flex flex-col  justify-between items-center md:items-start ">
                <h3 className="text-xl font-bold mb-2 text-white">Free</h3>
                <p className="text-center md:text-start text-gray-400 mb-6 font-montserrat text-lg">
                  Default plan for new users
                </p>
              </div>

              <div className="flex-[20%] flex items-center justify-center text-center mb-6 text-3xl font-bold text-[#FF2E9F]">
                $ 0
              </div>

              <ul className="flex-[30%] space-y-3 mb-8 font-montserrat text-base">
                {[
                  "500 comments/month",
                  "3 reply templates",
                  "Basic keyword triggers",
                  "Email support",
                  "Instagram API compliance",
                  "Spam detection",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check
                      className={`h-5 w-5 mt-1 mr-3 ${"text-[#FF2E9F]"}`}
                    />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <SignedOut>
                <Button
                  variant="outline"
                  onClick={() => router.push("/sign-in")}
                  className={`flex-[20%] w-full py-3 rounded-full font-medium hover:opacity-90 transition-opacity whitespace-nowrap ${"bg-gradient-to-r from-[#FF2E9F]/80 to-[#FF2E9F]"} text-black`}
                >
                  Get Started
                </Button>
              </SignedOut>
              <SignedIn>
                <Button
                  variant="outline"
                  className={`flex-[20%] w-full py-3 rounded-full font-medium hover:opacity-90 transition-opacity whitespace-nowrap ${
                    currentSubscription
                      ? "bg-gradient-to-r from-[#FF2E9F]/80 to-[#FF2E9F]"
                      : " bg-gradient-to-r from-[#0ce05d]/80 to-[#054e29] cursor-not-allowed"
                  } text-black disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {currentSubscription ? "Start Automating" : "Current Plan"}
                </Button>
              </SignedIn>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {instagramPricingPlans.map((plan) => {
              const isCurrentPlan =
                currentSubscription &&
                currentSubscription.chatbotType === plan.id &&
                currentSubscription.billingCycle === billingCycle;
              const isUpgradeOption = currentSubscription;
              const accountLimit = getAccountLimit(plan);

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
                        <BadgeCheck className=" ml-1 h-6 w-6 text-[#00F0FF]" />
                      )}
                    </div>
                    <p className="text-gray-400 mb-6 font-montserrat text-lg">
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
                      <p className="text-center text-green-400 my-2 font-medium font-montserrat text-base">
                        Two Months Free Subscription On Yearly Plan.
                      </p>
                    )}
                    <ul className="space-y-3 mb-8 ">
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
                          <span className="text-gray-300 font-montserrat text-base">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <SignedOut>
                      <Button
                        variant="outline"
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
                      </Button>
                    </SignedOut>
                    <SignedIn>
                      <Button
                        variant="outline"
                        onClick={() => handleSubscribe(plan, billingCycle)}
                        disabled={isCurrentPlan || isUpgrading || isCancelling}
                        className={`w-full py-3 mb-1 rounded-full font-medium hover:opacity-90 transition-opacity whitespace-nowrap ${
                          isCurrentPlan
                            ? "bg-gradient-to-r from-[#0ce05d]/80 to-[#054e29] cursor-not-allowed"
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
                          "Change Plan"
                        ) : (
                          "Start Automating"
                        )}
                      </Button>
                      {currentSubscription && isCurrentPlan && (
                        <Button
                          variant="outline"
                          onClick={() => setShowSubCancelDialog(true)}
                          disabled={isCancelling}
                          className="w-full py-3 rounded-full font-medium hover:opacity-90 transition-opacity whitespace-nowrap bg-gradient-to-r from-[#962626]/80 to-[#8b0808] text-black disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          Cancel Subscription
                        </Button>
                      )}
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
            <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] mb-4">
              Feature Comparison
            </h2>
            <p className="text-xl text-gray-300 font-montserrat">
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
                    pro: "5",
                  },
                  {
                    feature: "CRM integration",
                    starter: "✗",
                    growth: "✗",
                    pro: "✓",
                  },
                ].map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-[#1a1a1a]/50 font-montserrat text-base"
                  >
                    <td className="py-4 px-6 font-medium text-gray-300 ">
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

      {/* Payment Modal */}
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

      {/* Subscription Cancellation Dialog */}
      <AlertDialog
        open={showSubCancelDialog}
        onOpenChange={setShowSubCancelDialog}
      >
        <AlertDialogContent className=" bg-[#6d1717]/5 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancelled the
              Instagram automation subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Subscription Change Dialog */}
      <ConfirmSubscriptionChangeDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmedChange}
        currentPlan={
          instagramPricingPlans.find(
            (p) => p.id === currentSubscription?.productId
          ) || null
        }
        newPlan={pendingPlan}
        isLoading={isProcessingChange}
      />

      {/* Account Selection Dialog */}
      <AccountSelectionDialog
        isOpen={showAccountDialog}
        onClose={() => setShowAccountDialog(false)}
        onConfirm={handleAccountDeletion}
        accounts={userAccounts}
        newPlan={pendingPlan}
        isLoading={isProcessingChange}
      />
    </div>
  );
}
