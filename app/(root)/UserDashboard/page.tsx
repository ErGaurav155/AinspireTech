"use client";

import { useEffect, useState } from "react";
import EmbedCode from "@/components/shared/EmbedCode";
import { getSubscriptionInfo } from "@/lib/action/subscription.action";
import { useAuth } from "@clerk/nextjs";
import { getUserById } from "@/lib/action/user.actions";
import { useRouter } from "next/navigation";
import { link } from "fs";
import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/outline";

interface Subscription {
  productId: string;
  userId: string;
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

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!userId) {
        router.push("/sign-in");
        return;
      }

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

    fetchSubscriptions();
  }, [userId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className=" wrapper2  ">
      <h1 className="text-2xl font-bold text-white text-center mb-4">
        Your Subscriptions
      </h1>
      <div className="flex flex-col w-full gap-4">
        {agentIds.map((agentId) => {
          const isSubscribed = subscriptions.some(
            (sub) =>
              sub.productId === agentId && sub.subscriptionStatus === "active"
          );

          return (
            <div
              key={agentId}
              className={` flex flex-col md:flex-row  w-full gap-4  bg-gray-800 p-1 rounded-xl  text-white `}
            >
              <Link
                href={`/product/${agentId}`}
                className={`p-4 md:w-1/3 rounded-lg ${
                  isSubscribed ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <h2 className="flex text-lg items-center  justify-center font-bold">
                  {agentId}
                </h2>
              </Link>
              {isSubscribed ? (
                <div className="mt-2 md:w-2/3">
                  <EmbedCode
                    userId={
                      subscriptions.find((sub) => sub.productId === agentId)
                        ?.userId || ""
                    }
                    agentId={agentId}
                  />
                </div>
              ) : (
                <div className="mt-2 md:w-2/3 flex gap-2 items-center justify-center">
                  <Link href={`/product/${agentId}`}>
                    <LockClosedIcon className="h-7 w-7" /> Locked
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
