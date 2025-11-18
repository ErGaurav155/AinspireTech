"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WebScrapping } from "@/components/shared/WebScapping";

const WebsiteOnboard = () => {
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
      <div className="flex items-center justify-center text-black text-2xl font-bold">
        Loading...
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

export default WebsiteOnboard;
