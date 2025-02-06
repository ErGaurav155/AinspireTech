"use client";

import { useEffect, useState } from "react";
import EmbedCode from "@/components/shared/EmbedCode";
import {
  cancelPayPalSubscription,
  getSubscriptionInfo,
} from "@/lib/action/subscription.action";
import { useAuth } from "@clerk/nextjs";
import { getUserById } from "@/lib/action/user.actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { Button } from "@material-tailwind/react";
import { CrossIcon } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast, useToast } from "@/components/ui/use-toast";

interface Subscription {
  productId: string;
  userId: string;
  subscriptionId: string;
  subscriptionStatus: string;
}

const agentIds = [
  "ai-agent-customer-support",
  "ai-agent-e-commerce",
  "ai-agent-lead-generation",
  "ai-agent-education",
  "chatbot-customer-support",
  "chatbot-e-commerce",
  "chatbot-lead-generation",
  "chatbot-education",
  "template-pathology",
  "template-e-commerce",
  "template-business",
  "template-saas",
];

export default function Dashboard() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  const [open, setOpen] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<
    string | null
  >("sub_PmtjWk8A9ftqn1");

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!userId) {
        router.push("/sign-in");
        return;
      }

      try {
        const user = await getUserById(userId);
        const response = await getSubscriptionInfo(user._id);

        setSubscriptions(
          response.map((sub: any) => ({
            productId: sub.productId,
            userId: sub.userId,
            subscriptionId: sub.subscriptionId,
            subscriptionStatus: sub.subscriptionStatus,
          })) || []
        );
      } catch (error: any) {
        console.error("Error fetching subscriptions:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, [userId, router]);

  const handleCancelSubscription = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedSubscriptionId) return;

    const formData = new FormData(event.currentTarget);
    const reason = formData.get("reason") as string;

    try {
      const result = await cancelPayPalSubscription(
        selectedSubscriptionId,
        reason
      );

      if (result.success) {
        toast({
          title: "Subscription cancelled successfully!",
          description: result.message,
          duration: 3000,
          className: "success-toast",
        });
        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.subscriptionId === selectedSubscriptionId
              ? { ...sub, subscriptionStatus: "cancelled" }
              : sub
          )
        );
        setOpen(false);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="wrapper2">
      <h1 className="text-2xl font-bold text-white text-center mb-4">
        Your Subscriptions
      </h1>
      <div className="flex flex-col w-full gap-4">
        {agentIds.map((agentId) => {
          const subscription = subscriptions.find(
            (sub) => sub.productId === agentId
          );
          const isSubscribed = subscription?.subscriptionStatus === "active";

          return (
            <div
              key={agentId}
              className="flex flex-col md:flex-row w-full gap-4 bg-gray-800 p-1 rounded-xl text-white"
            >
              <Link
                href={`/product/${agentId}`}
                className={`p-4 md:w-1/3 rounded-lg ${
                  isSubscribed ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <h2 className="flex text-lg items-center justify-center font-bold">
                  {agentId}
                </h2>
              </Link>
              {isSubscribed ? (
                <div className="mt-2 md:w-2/3">
                  <EmbedCode
                    userId={subscription?.userId || ""}
                    agentId={agentId}
                  />
                  <Button
                    onClick={() => {
                      // setSelectedSubscriptionId(subscription.subscriptionId);
                      setOpen(true);
                    }}
                    className="w-full rounded-md text-base text-white bg-red-900 hover:bg-red-600"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              ) : (
                <div className="mt-2 md:w-2/3 flex gap-2 items-center justify-center">
                  <Link
                    href={`/product/${agentId}`}
                    className="flex items-center gap-2"
                  >
                    <LockClosedIcon className="h-7 w-7" /> Locked
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold  text-red-400">
                Cancel Subscription
              </h2>
              <XMarkIcon
                onClick={() => setOpen(false)}
                className="text-black size-10 cursor-pointer"
              />
            </div>
            <form onSubmit={handleCancelSubscription} className="space-y-4">
              <label className="block text-lg font-semibold text-black">
                Please Provide Reason
              </label>
              <textarea
                name="reason"
                className="w-full input-field"
                placeholder="Cancellation reason"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cancel Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
