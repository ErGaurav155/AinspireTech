"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WebScapping } from "@/components/shared/WebScapping";

const WebsiteOnboard = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const agentId = searchParams.get("agentId");
    console.log(userId, agentId);
    if (!userId || !agentId) {
      router.push("/");
      return;
    }

    setUserId(userId);
    setAgentId(agentId);
  }, [searchParams, router]);

  if (!userId || !agentId) {
    return (
      <div className="flex items-center justify-center text-black text-2xl font-bold">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <WebScapping userId={userId} agentId={agentId} />
    </div>
  );
};

export default WebsiteOnboard;

// const scappedUrls = await scrapeSitemapPages(user.websiteUrl);
// if (scappedUrls) {
//   await setWebsiteScrapped(userId);
//   router.push("/UserDashboard");
// }
