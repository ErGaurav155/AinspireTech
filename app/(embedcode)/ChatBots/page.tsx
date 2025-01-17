"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AibotCollapse from "@/components/shared/AiBot";
import { getAgentSubscriptionInfo } from "@/lib/action/subscription.action";

const ChatBots = () => {
  const searchParams = useSearchParams();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Extract search parameters from the URL
    const userId = searchParams.get("userId");
    const agentId = searchParams.get("agentId");
    if (userId && agentId) {
      const fetchSubscriptionInfo = async () => {
        const agentSubscriptions = await getAgentSubscriptionInfo(
          String(userId),
          String(agentId)
        );
        if (!agentSubscriptions.length) {
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
        setIsLoading(false);
      };

      fetchSubscriptionInfo();
    } else {
      setIsLoading(false); // No parameters found
      setIsAuthorized(false);
    }
  }, [searchParams]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Loading...
      </div>
    );
  }

  return <AibotCollapse authorised={isAuthorized} />;
};

export default ChatBots;
