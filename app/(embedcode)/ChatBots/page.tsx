"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AibotCollapse from "@/components/shared/AiBot";
import { getAgentSubscriptionInfo } from "@/lib/action/subscription.action";

const ChatBots = () => {
  const searchParams = useSearchParams();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extracting userId and agentId from the search params outside useEffect
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
          if (!agentSubscriptions.length) {
            setIsAuthorized(false);
          } else {
            setIsAuthorized(true);
          }
        } catch (error) {
          console.error("Error fetching subscription info:", error);
          setIsAuthorized(false); // Handle error case
        }
        setIsLoading(false);
      };

      fetchSubscriptionInfo();
    } else {
      setIsLoading(false); // No parameters found
      setIsAuthorized(false);
    }
  }, [userId, agentId]); // Dependency on userId and agentId

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Loading...
      </div>
    );
  }

  return <AibotCollapse userId={userId} authorised={isAuthorized} />;
};

export default ChatBots;
