"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WebScrapping } from "@/components/shared/WebScapping";

const WebsiteOnboardWithSearchParamsWeb = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const agentId = searchParams.get("agentId");
    const subscriptionId = searchParams.get("subscriptionId");

    if (!userId || !agentId || !subscriptionId) {
      router.push("/");
      return;
    }

    setUserId(userId);
    setAgentId(agentId);
    setSubscriptionId(subscriptionId);
  }, [searchParams, router]);

  if (!userId || !agentId || !subscriptionId) {
    return (
      <div className="min-h-screen bg-transparent  flex items-center justify-center h-full w-full">
        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <WebScrapping
        subscriptionId={subscriptionId}
        userId={userId}
        agentId={agentId}
      />
    </div>
  );
};

export default function WebsiteOnboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pricing information...</p>
          </div>
        </div>
      }
    >
      <WebsiteOnboardWithSearchParamsWeb />
    </Suspense>
  );
}
