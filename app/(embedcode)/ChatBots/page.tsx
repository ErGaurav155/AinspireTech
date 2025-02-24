"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AibotCollapse from "@/components/shared/AiBot";
import { getAgentSubscriptionInfo } from "@/lib/action/subscription.action";
import McqbotCollapse from "@/components/shared/McqBot";

const ChatBots = () => {
  const searchParams = useSearchParams();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const userId = searchParams.get("userId");
  const agentId = searchParams.get("agentId");

  useEffect(() => {
    if (userId && agentId) {
      const fetchSubscriptionInfo = async () => {
        try {
          const agentSubscriptions = await getAgentSubscriptionInfo(
            String(userId),
            String(agentId)
          );
          setIsAuthorized(agentSubscriptions.length > 0);
        } catch (error) {
          setIsAuthorized(false);
        }
        setIsLoading(false);
      };

      fetchSubscriptionInfo();
    } else {
      setIsLoading(false);
      setIsAuthorized(false);
    }
  }, [userId, agentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Loading...
      </div>
    );
  }

  if (agentId === "chatbot-customer-support") {
    return <AibotCollapse userId={userId} authorised={isAuthorized} />;
  } else if (agentId === "ai-agent-education") {
    return <McqbotCollapse userId={userId} authorised={isAuthorized} />;
  } else {
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Invalid agent id.
      </div>
    );
  }
};

export default ChatBots;
