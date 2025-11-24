"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

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

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapingComplete, setScrapingComplete] = useState(false);
  const [rawScrapedData, setRawScrapedData] = useState<any>(null);
  const { userId } = useAuth();
  const handleScrape = async () => {
    if (!url || !userId) {
      setError("Please enter a valid URL.");
      return;
    }

    // Client-side URL validation: must start with http:// or https:// and be a valid URL
    if (!/^https?:\/\//i.test(url.trim())) {
      setError("URL must start with http:// or https://");
      return;
    }

    try {
      new URL(url.trim());
    } catch {
      setError("Invalid URL format. Please enter a valid URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setScrapedData(null);
    setScrapingComplete(false);
    setRawScrapedData(null);

    try {
      // Step 1: Call scraping API
      const scrapeResponse = await fetch(
        `/api/scrape-anu?url=${encodeURIComponent(
          url
        )}&userId=${encodeURIComponent(userId)}`
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
        setRawScrapedData(scrapeResult.data);
        setScrapingComplete(true);

        // Step 2: Automatically call processing API
        await handleProcessData(scrapeResult.data);
      } else {
        throw new Error("Scraping failed");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProcessData = async (data: any) => {
    setProcessing(true);
    setError(null);

    try {
      const processResponse = await fetch("/api/scrape-anu/process-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!processResponse.ok) {
        const errorText = await processResponse.text();
        throw new Error(errorText || "Failed to process data.");
      }

      const processResult = await processResponse.json();

      if (processResult.success) {
        setScrapedData(processResult.data);
      } else {
        throw new Error("Data processing failed");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing data."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 text-center">
          Advanced Website Scraper
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Enter a URL to scrape multiple levels of pages (up to 10 pages, 3
          levels deep)
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleScrape}
            disabled={loading || processing}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading
              ? "Scraping..."
              : processing
              ? "Processing..."
              : "Start Scraping"}
          </button>
        </div>

        {/* Status Indicators */}
        {scrapingComplete && !scrapedData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-700">
              ✓ Scraping complete! Processing data...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {scrapedData && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Scraping Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {scrapedData.totalPages}
                  </div>
                  <div className="text-sm text-gray-600">Pages Scraped</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {scrapedData.maxLevel}
                  </div>
                  <div className="text-sm text-gray-600">Max Level</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {scrapedData.domain}
                  </div>
                  <div className="text-sm text-gray-600">Domain</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {scrapedData.fileName}
                  </div>
                  <div className="text-sm text-gray-600">File Name</div>
                </div>
              </div>

              {/* Cloudinary Link */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Cloudinary File Link
                </h3>
                <a
                  href={scrapedData.cloudinaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 break-all"
                >
                  {scrapedData.cloudinaryLink}
                </a>
              </div>
            </div>

            {/* Pages List */}
            <div className="space-y-4">
              {scrapedData.pages.map((page, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="bg-gray-100 px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {page.title || "No Title"}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        Level {page.level}
                      </span>
                    </div>
                    <p className="text-blue-600 text-sm mt-1 break-words">
                      {page.url}
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Description
                        </h4>
                        <p className="text-sm text-gray-600">
                          {page.description || "No description available"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Content Preview
                        </h4>
                        <p className="text-sm text-gray-600">
                          {page.content || "No content available"}
                        </p>
                      </div>
                    </div>

                    {/* Headings */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Headings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(page.headings).map(
                          ([level, headings]) => (
                            <div key={level} className="border rounded-lg p-3">
                              <h5 className="font-semibold text-gray-700 capitalize mb-2">
                                {level} ({headings.length})
                              </h5>
                              {headings.length > 0 ? (
                                <ul className="space-y-1 text-sm max-h-32 overflow-y-auto">
                                  {headings.map((heading, idx) => (
                                    <li
                                      key={idx}
                                      className="truncate"
                                      title={heading}
                                    >
                                      {heading}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-500 text-sm">
                                  No {level} headings
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
