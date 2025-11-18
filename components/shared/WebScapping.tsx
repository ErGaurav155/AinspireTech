// components/shared/WebScrapping.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  getUserById,
  setScrappedFile,
  setWebsiteScrapped,
} from "@/lib/action/user.actions";
import { useRouter } from "next/navigation";
import { sendSubscriptionEmailToUser } from "@/lib/action/sendEmail.action";

export const WebScrapping = ({
  userId,
  agentId,
  subscriptionId,
}: {
  userId: string;
  agentId: string;
  subscriptionId: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState(
    "Initializing AWS scraping..."
  );

  const router = useRouter();

  const processSubscription = useCallback(async () => {
    try {
      setScrapingStatus("Validating subscription and getting website URL...");

      // Get user data with website URL (your existing logic)
      const user = await getUserById(userId);
      const mainUrl = user.websiteUrl;

      if (user.isScrapped) {
        router.push("/");
        return;
      }

      setScrapingStatus("Starting AWS-powered website scraping...");

      // Call the enhanced AWS scraping API
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: mainUrl,
          userId: userId,
          subscriptionId: subscriptionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setScrapingStatus("Storing scraped data reference in database...");

        // Store the S3 URL in your MongoDB
        await setScrappedFile(userId, data.s3Url);

        setScrapingStatus("Finalizing scraping process...");
        await setWebsiteScrapped(userId);

        setScrapingStatus("Completed! Redirecting to dashboard...");

        // Optional: Send confirmation emails (your existing logic)
        await sendSubscriptionEmailToUser({
          email: user.email,
          userDbId: user._id,
          agentId: agentId,
          subscriptionId: subscriptionId,
        });

        router.push("/web/UserDashboard");
      } else {
        console.error("AWS Scraping Error:", data.error);
        setScrapingStatus(`Scraping failed: ${data.error}. Redirecting...`);
        router.push("/web/UserDashboard");
      }
    } catch (error) {
      console.error("Error during AWS scraping process:", error);
      setScrapingStatus("Error occurred during scraping. Redirecting...");
      router.push("/web/UserDashboard");
    } finally {
      setLoading(false);
    }
  }, [userId, agentId, subscriptionId, router]);

  useEffect(() => {
    const executeProcess = async () => {
      if (!isSubmitted) {
        setLoading(true);
        await processSubscription();
        setIsSubmitted(true);
      }
    };

    executeProcess();
  }, [isSubmitted, processSubscription]);

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-green-600 mb-4">
          AWS Website Scraping in Progress
        </h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
              }`}
            ></div>
            <p className="text-gray-700">{scrapingStatus}</p>
          </div>
          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">
                <strong>AWS Services Used:</strong> Lambda (Puppeteer) → S3
                (Storage) → MongoDB (Reference)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
