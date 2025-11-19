"use client";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

interface ScrapedData {
  _id: string;
  url: string;
  title: string;
  description?: string;
  mainHeading: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  paragraphs: string[];
  mainContent: string;
  scrapedAt: string;
  userId: string;
  s3Url?: string;
  status: "success" | "failed";
}

interface ContentReport {
  scrapingInfo: {
    scrapedAt: string;
    baseDomain: string;
    totalPagesScraped: number;
    successfulPages: number;
    failedPages: number;
    maxPages: number;
    maxDepth: number;
    environment: string;
  };
  contentStatistics: {
    totalParagraphs: number;
    totalHeadings: number;
    totalContentSnippets: number;
    totalImages?: number;
  };
  pages: Array<{
    url: string;
    pageInfo: {
      title: string;
      description: string;
      mainHeading: string;
      depth: number;
    };
    content: {
      headings: { [key: string]: string[] };
      paragraphs: string[];
      mainContent: string;
      images?: Array<{ src: string; alt: string }>;
    };
    contentMetrics: {
      paragraphCount: number;
      headingCount: number;
      totalContentLength: number;
      imageCount?: number;
    };
  }>;
  websiteSummary: {
    mainTopics: string[];
    totalPages: number;
  };
  failedPages?: Array<{
    url: string;
    error: string;
    depth: number;
  }>;
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [scrapedData, setScrapedData] = useState<ContentReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScrapedData[]>([]);
  const [chromiumStatus, setChromiumStatus] = useState<
    "checking" | "ready" | "error"
  >("checking");
  const { userId, isLoaded } = useAuth();

  const handleScrape = async () => {
    if (!userId) {
      setError("Please sign in to use the scraper");
      return;
    }

    if (!url) {
      setError("Please enter a valid URL.");
      return;
    }

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

    try {
      const response = await fetch("/api/scrape-anu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          userId,
          maxPages: 3,
          maxDepth: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to scrape website: ${response.status}`
        );
      }

      if (data.success) {
        setScrapedData(data.data);
        // Reload history to include the new scrape
      } else {
        throw new Error(data.error || "Scraping failed");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      console.error("Scraping error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-xs px-2 py-1 rounded font-medium";
    if (status === "success") {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Web Scraper
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Extract comprehensive content from websites
          </p>

          {/* Chromium Status Indicator */}
          <div className="flex justify-center items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                chromiumStatus === "ready"
                  ? "bg-green-500"
                  : chromiumStatus === "error"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            ></div>
            <span className="text-sm text-gray-500">
              {chromiumStatus === "ready"
                ? "Scraper ready"
                : chromiumStatus === "error"
                ? "Scraper initializing"
                : "Checking status..."}
            </span>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
              onKeyPress={(e) => e.key === "Enter" && handleScrape()}
              disabled={loading}
            />
            <button
              onClick={handleScrape}
              disabled={loading || !userId}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Scraping...
                </>
              ) : (
                "Scrape"
              )}
            </button>
          </div>

          {!userId && (
            <div className="text-amber-600 p-3 bg-amber-50 rounded-lg text-sm">
              Please sign in to use the web scraper
            </div>
          )}

          {error && (
            <div className="text-red-500 p-3 bg-red-50 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Tips */}
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium">Tips:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Include http:// or https:// in the URL</li>
              <li>Start with popular websites for better results</li>
              <li>Scraping may take 20-30 seconds for multiple pages</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Results Section */}
          <div className="lg:col-span-2 space-y-8">
            {scrapedData && (
              <>
                {/* Scraping Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Scraping Report
                    </h2>
                    <span className="text-sm text-gray-500">
                      {formatDate(scrapedData.scrapingInfo.scrapedAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {scrapedData.scrapingInfo.totalPagesScraped}
                      </div>
                      <div className="text-gray-600">Total Pages</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {scrapedData.scrapingInfo.successfulPages}
                      </div>
                      <div className="text-gray-600">Successful</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {scrapedData.scrapingInfo.failedPages}
                      </div>
                      <div className="text-gray-600">Failed</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {scrapedData.contentStatistics.totalContentSnippets}
                      </div>
                      <div className="text-gray-600">Content Items</div>
                    </div>
                  </div>

                  {/* Main Topics */}
                  {scrapedData.websiteSummary.mainTopics.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Main Topics
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {scrapedData.websiteSummary.mainTopics.map(
                          (topic, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {topic}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Failed Pages */}
                  {scrapedData.failedPages &&
                    scrapedData.failedPages.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-red-700 mb-2">
                          Failed Pages
                        </h3>
                        <div className="space-y-2">
                          {scrapedData.failedPages.map((failedPage, index) => (
                            <div key={index} className="text-sm text-red-600">
                              <div className="font-medium">
                                {failedPage.url}
                              </div>
                              <div className="text-red-500">
                                {failedPage.error}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Pages Content */}
                {scrapedData.pages.map((page, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 flex-1">
                        {page.pageInfo.title || "Untitled Page"}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 text-sm mb-1">
                          URL
                        </h4>
                        <p className="text-blue-600 break-words text-sm">
                          {page.url}
                        </p>
                      </div>

                      {page.pageInfo.description && (
                        <div>
                          <h4 className="font-semibold text-gray-700 text-sm mb-1">
                            Description
                          </h4>
                          <p className="text-gray-900 text-sm">
                            {page.pageInfo.description}
                          </p>
                        </div>
                      )}

                      {page.pageInfo.mainHeading && (
                        <div>
                          <h4 className="font-semibold text-gray-700 text-sm mb-1">
                            Main Heading
                          </h4>
                          <p className="text-gray-900 text-sm font-medium">
                            {page.pageInfo.mainHeading}
                          </p>
                        </div>
                      )}

                      {/* Headings */}
                      <div>
                        <h4 className="font-semibold text-gray-700 text-sm mb-2">
                          Headings ({page.contentMetrics.headingCount})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(page.content.headings)
                            .filter(([_, headings]) => headings.length > 0)
                            .map(([level, headings]) => (
                              <div key={level}>
                                <h5 className="font-medium text-gray-600 capitalize text-sm mb-1">
                                  {level.toUpperCase()}
                                </h5>
                                <ul className="text-sm text-gray-900 space-y-1">
                                  {headings.slice(0, 5).map((heading, i) => (
                                    <li
                                      key={i}
                                      className="truncate"
                                      title={heading}
                                    >
                                      {heading}
                                    </li>
                                  ))}
                                  {headings.length > 5 && (
                                    <li className="text-gray-500 text-xs">
                                      +{headings.length - 5} more
                                    </li>
                                  )}
                                </ul>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Images */}
                      {page.content.images &&
                        page.content.images.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 text-sm mb-2">
                              Images ({page.content.images.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {page.content.images
                                .slice(0, 6)
                                .map((image, i) => (
                                  <div key={i} className="border rounded p-2">
                                    <Image
                                      src={image.src}
                                      alt={image.alt || `Image ${i + 1}`}
                                      className="w-full h-20 object-cover rounded"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          "/placeholder-image.png";
                                      }}
                                    />
                                    {image.alt && (
                                      <p className="text-xs text-gray-600 mt-1 truncate">
                                        {image.alt}
                                      </p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Paragraphs */}
                      {page.content.paragraphs.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 text-sm mb-2">
                            Paragraphs ({page.contentMetrics.paragraphCount})
                          </h4>
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {page.content.paragraphs
                              .slice(0, 8)
                              .map((paragraph, i) => (
                                <p
                                  key={i}
                                  className="text-gray-900 text-sm leading-relaxed"
                                >
                                  {paragraph}
                                </p>
                              ))}
                            {page.content.paragraphs.length > 8 && (
                              <p className="text-gray-500 text-sm">
                                +{page.content.paragraphs.length - 8} more
                                paragraphs
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
