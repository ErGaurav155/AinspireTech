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

interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  content: string;
  level: number;
}

interface ScrapedData {
  fileName: string;
  domain: string;
  userId: string;
  totalPages: number;
  maxLevel: number;
  cloudinaryLink: string;
  pages: ScrapedPage[];
}

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
  const [processing, setProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState(
    "Initializing website scraping..."
  );
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);

  const router = useRouter();

  const processSubscription = useCallback(async () => {
    try {
      setError(null);
      setScrapingStatus("Validating subscription and getting website URL...");

      // Get user data with website URL
      const user = await getUserById(userId);
      const mainUrl = user.websiteUrl;

      if (!mainUrl) {
        throw new Error("No website URL found for user");
      }

      if (user.isScrapped) {
        router.push("/web/UserDashboard");
        return;
      }

      setScrapingStatus("Starting website scraping...");
      setLoading(true);

      // Step 1: Call scraping API (using GET like in your test page)
      const scrapeResponse = await fetch(
        `/api/scrape-anu?url=${encodeURIComponent(
          mainUrl
        )}&userId=${encodeURIComponent(
          userId
        )}&subscriptionId=${subscriptionId}&agentId=${agentId}`
      );

      if (!scrapeResponse.ok) {
        if (scrapeResponse.status === 429) {
          throw new Error("Rate limit reached. Please try again later.");
        }
        const errorText = await scrapeResponse.text();
        throw new Error(errorText || "Failed to scrape website.");
      }

      const scrapeResult = await scrapeResponse.json();

      if (scrapeResult.success) {
        setScrapingStatus("Scraping complete! Processing data...");
        setLoading(false);
        setProcessing(true);

        // Step 2: Call processing API
        const processResponse = await fetch("/api/scrape-anu/process-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scrapeResult.data),
        });

        if (!processResponse.ok) {
          const errorText = await processResponse.text();
          throw new Error(errorText || "Failed to process data.");
        }

        const processResult = await processResponse.json();

        if (processResult.success) {
          setScrapedData(processResult.data);
          setScrapingStatus("Storing scraped data reference in database...");

          // Store the Cloudinary URL in your MongoDB
          await setScrappedFile(userId, processResult.data.cloudinaryLink);

          setScrapingStatus("Finalizing scraping process...");
          await setWebsiteScrapped(userId);

          setScrapingStatus("Sending confirmation email...");

          // Send confirmation email
          await sendSubscriptionEmailToUser({
            email: user.email,
            userDbId: user._id,
            agentId: agentId,
            subscriptionId: subscriptionId,
          });

          setScrapingStatus("Completed! Redirecting to dashboard...");

          // Redirect to dashboard after a brief delay to show completion
          setTimeout(() => {
            router.push("/web/UserDashboard");
          }, 2000);
        } else {
          throw new Error("Data processing failed");
        }
      } else {
        throw new Error("Scraping failed");
      }
    } catch (error) {
      console.error("Error during scraping process:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setScrapingStatus("Error occurred during scraping. Redirecting...");

      // Redirect to dashboard even on error after a delay
      setTimeout(() => {
        router.push("/web/UserDashboard");
      }, 3000);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  }, [userId, agentId, subscriptionId, router]);

  useEffect(() => {
    const executeProcess = async () => {
      if (!isSubmitted) {
        await processSubscription();
        setIsSubmitted(true);
      }
    };

    executeProcess();
  }, [isSubmitted, processSubscription]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Website Setup in Progress
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            We are scraping your website to train your AI agent. This may take a
            few minutes.
          </p>

          {/* Status Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-800">
                Current Status
              </h2>
              <div
                className={`w-3 h-3 rounded-full ${
                  loading
                    ? "bg-yellow-500 animate-pulse"
                    : processing
                    ? "bg-purple-500 animate-pulse"
                    : error
                    ? "bg-red-500"
                    : scrapedData
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
              ></div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <p className="text-blue-700 font-medium">{scrapingStatus}</p>
                  {error && (
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  )}
                </div>
              </div>

              {/* Progress indicators */}
              <div className="flex space-x-2">
                <div
                  className={`flex-1 h-2 rounded-full ${
                    scrapingStatus.includes("Initializing")
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <div
                  className={`flex-1 h-2 rounded-full ${
                    scrapingStatus.includes("Starting website scraping") ||
                    scrapingStatus.includes("Scraping complete")
                      ? "bg-blue-500"
                      : scrapingStatus.includes("Scraping")
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <div
                  className={`flex-1 h-2 rounded-full ${
                    scrapingStatus.includes("Processing")
                      ? "bg-purple-500"
                      : scrapingStatus.includes("Storing")
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <div
                  className={`flex-1 h-2 rounded-full ${
                    scrapingStatus.includes("Completed")
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                ></div>
              </div>
            </div>
          </div>

          {/* Loading/Processing Indicators */}
          {(loading || processing) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                <div>
                  <p className="text-yellow-700 font-medium">
                    {loading ? "Scraping Website..." : "Processing Data..."}
                  </p>
                  <p className="text-yellow-600 text-sm">
                    {loading
                      ? "Collecting content from your website pages..."
                      : "Organizing and preparing your data for AI training..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Summary */}
          {scrapedData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                ✓ Scraping Completed Successfully!
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xl font-bold text-green-600">
                    {scrapedData.totalPages}
                  </div>
                  <div className="text-sm text-gray-600">Pages Scraped</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xl font-bold text-green-600">
                    {scrapedData.maxLevel}
                  </div>
                  <div className="text-sm text-gray-600">Max Level</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xl font-bold text-green-600 truncate">
                    {scrapedData.domain}
                  </div>
                  <div className="text-sm text-gray-600">Domain</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-green-600 break-all">
                    File Ready
                  </div>
                  <div className="text-xs text-gray-600">Cloudinary</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && !scrapedData && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                ⚠️ Scraping Issue
              </h3>
              <p className="text-red-700">
                We encountered an issue while scraping your website. Don not
                worry - you can still use the platform, and you can retry
                scraping later from your dashboard.
              </p>
              <p className="text-red-600 text-sm mt-2">Error: {error}</p>
            </div>
          )}

          {/* Redirect Notice */}
          {(scrapedData || error) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-700">
                {scrapedData
                  ? "✓ Setup complete! Redirecting to your dashboard..."
                  : "Redirecting to dashboard..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
