"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAgentSubscriptionInfo } from "@/lib/action/subscription.action";
import { WebScapping } from "@/components/shared/WebScapping";
import { getUserByDbId, setWebsiteScrapped } from "@/lib/action/user.actions";
import { scrapeSitemapPages } from "@/lib/scrapping";

const WebsiteOnboard = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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
          router.push("/");
          return;
        }

        const user = await getUserByDbId(userId);
        if (user.isScrapped) {
          router.push("/");

          return;
        }
        const scappedUrls = await scrapeSitemapPages(user.websiteUrl);
        if (scappedUrls) {
          await setWebsiteScrapped(userId);
          router.push("/UserDashboard");
        }
      };

      fetchSubscriptionInfo();
      setLoading(false);
    } else {
      router.push("/");
    }
  }, [searchParams, router]);
  if (loading) {
    return (
      <div className="flex items-center justify-center text-black text-2xl font-bold">
        Loading...
      </div>
    );
  }
  return <WebScapping />;
};

export default WebsiteOnboard;
