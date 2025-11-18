"use client";

import { useAuth } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";

interface ScrapingResult {
  success: boolean;
  data?: {
    scrapingInfo: {
      totalPagesScraped: number;
      successfulPages: number;
      failedPages: number;
      scrapedAt: string;
      baseDomain: string;
    };
    contentStatistics: {
      totalParagraphs: number;
      totalHeadings: number;
      totalKeyPoints: number;
      totalFeatures: number;
      totalBenefits: number;
      totalContentSnippets: number;
      averageParagraphsPerPage: number;
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
        headings: {
          h1: string[];
          h2: string[];
          h3: string[];
          h4: string[];
          h5: string[];
          h6: string[];
        };
        paragraphs: string[];
        keyPoints: string[];
        features: string[];
        benefits: string[];
        mainContent: string;
      };
      contentMetrics: {
        paragraphCount: number;
        headingCount: number;
        keyPointsCount: number;
        featuresCount: number;
        benefitsCount: number;
        totalContentLength: number;
      };
    }>;
    websiteSummary: {
      mainTopics: string[];
      keyServices: string[];
      contentOverview: any;
    };
  };
  error?: string;
  message?: string;
}

export default function WebsiteContentAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapingResult | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPage, setSelectedPage] = useState(0);
  const { userId } = useAuth();

  const handleScrape = async () => {
    if (!url || !userId) {
      alert("Please enter URL and make sure you're logged in");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/scrape-anu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          userId,
          maxPages: 10,
          maxDepth: 2,
        }),
      });

      const data: ScrapingResult = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Request failed:", error);
      setResult({
        success: false,
        error: "Failed to connect to scraping service",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Website Content Analyzer
            </h1>
            <p className="text-gray-600">
              Extract and analyze all textual content from any website
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                onClick={handleScrape}
                disabled={loading || !url || !userId}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing Website Content...
                  </div>
                ) : (
                  "Analyze Website Content"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Website Content Analysis
          </h1>
          <p className="text-gray-600">
            Comprehensive content extraction from{" "}
            {result?.data?.scrapingInfo.baseDomain}
          </p>
        </div>

        {!result.success ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-800 font-medium text-lg mb-2">
              ❌ Analysis Failed
            </div>
            <p className="text-red-700">{result.error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result?.data?.scrapingInfo.totalPagesScraped}
                </div>
                <div className="text-gray-600 text-sm">Pages Analyzed</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result?.data?.contentStatistics.totalParagraphs}
                </div>
                <div className="text-gray-600 text-sm">Paragraphs Found</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {result?.data?.contentStatistics.totalHeadings}
                </div>
                <div className="text-gray-600 text-sm">Headings Extracted</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {result?.data?.contentStatistics.totalContentSnippets}
                </div>
                <div className="text-gray-600 text-sm">Content Snippets</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b">
                <nav className="flex -mb-px">
                  {[
                    { id: "overview", name: "Website Overview" },
                    { id: "pages", name: "Page Contents" },
                    { id: "topics", name: "Main Topics" },
                    { id: "services", name: "Key Services" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-6 font-medium text-sm border-b-2 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Website Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Content Statistics
                          </h4>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-gray-600">
                                Successful Pages:
                              </dt>
                              <dd className="font-medium">
                                {result?.data?.scrapingInfo.successfulPages}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Failed Pages:</dt>
                              <dd className="font-medium">
                                {result?.data?.scrapingInfo.failedPages}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">
                                Average Paragraphs/Page:
                              </dt>
                              <dd className="font-medium">
                                {
                                  result?.data?.contentStatistics
                                    .averageParagraphsPerPage
                                }
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Features Found:</dt>
                              <dd className="font-medium">
                                {result?.data?.contentStatistics.totalFeatures}
                              </dd>
                            </div>
                          </dl>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Analysis Details
                          </h4>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Domain:</dt>
                              <dd className="font-medium">
                                {result?.data?.scrapingInfo.baseDomain}
                              </dd>
                            </div>

                            <div className="flex justify-between">
                              <dt className="text-gray-600">
                                Total Content Words:
                              </dt>
                              <dd className="font-medium">
                                {result?.data?.websiteSummary.contentOverview.totalContentWords?.toLocaleString()}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pages Tab */}
                {activeTab === "pages" && (
                  <div className="space-y-6">
                    {/* Page Selector */}
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {result?.data?.pages.map((page, index) => (
                        <button
                          key={page.url}
                          onClick={() => setSelectedPage(index)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                            selectedPage === index
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {page.pageInfo.title || `Page ${index + 1}`}
                        </button>
                      ))}
                    </div>

                    {/* Page Content */}
                    {result?.data?.pages[selectedPage] && (
                      <div className="space-y-6">
                        {/* Page Header */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {result?.data?.pages[selectedPage].pageInfo.title}
                          </h3>
                          <p className="text-blue-700 mb-1">
                            {
                              result?.data?.pages[selectedPage].pageInfo
                                .description
                            }
                          </p>
                          <p className="text-blue-600 text-sm">
                            {result?.data?.pages[selectedPage].url}
                          </p>
                        </div>

                        {/* Content Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-white border rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {
                                result?.data?.pages[selectedPage].contentMetrics
                                  .paragraphCount
                              }
                            </div>
                            <div className="text-gray-600 text-sm">
                              Paragraphs
                            </div>
                          </div>
                          <div className="bg-white border rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {
                                result?.data?.pages[selectedPage].contentMetrics
                                  .headingCount
                              }
                            </div>
                            <div className="text-gray-600 text-sm">
                              Headings
                            </div>
                          </div>
                          <div className="bg-white border rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {
                                result?.data?.pages[selectedPage].contentMetrics
                                  .keyPointsCount
                              }
                            </div>
                            <div className="text-gray-600 text-sm">
                              Key Points
                            </div>
                          </div>
                        </div>

                        {/* Headings */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">
                            Headings Structure
                          </h4>
                          {Object.entries(
                            result?.data?.pages[selectedPage].content.headings
                          ).map(
                            ([level, headings]) =>
                              headings.length > 0 && (
                                <div key={level}>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {level} Headings ({headings.length})
                                  </h5>
                                  <div className="space-y-1">
                                    {headings.map((heading, idx) => (
                                      <div
                                        key={idx}
                                        className="text-gray-900 bg-gray-50 rounded px-3 py-2 text-sm"
                                      >
                                        {heading}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                          )}
                        </div>

                        {/* Paragraphs */}
                        {result?.data?.pages[selectedPage].content.paragraphs
                          .length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Main Content (
                              {
                                result?.data?.pages[selectedPage].content
                                  .paragraphs.length
                              }{" "}
                              paragraphs)
                            </h4>
                            <div className="space-y-3">
                              {result?.data?.pages[
                                selectedPage
                              ].content.paragraphs.map((paragraph, idx) => (
                                <p
                                  key={idx}
                                  className="text-gray-700 leading-relaxed"
                                >
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Points */}
                        {result?.data?.pages[selectedPage].content.keyPoints
                          .length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Key Points
                            </h4>
                            <ul className="space-y-2">
                              {result?.data?.pages[
                                selectedPage
                              ].content.keyPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-green-500 mr-2">•</span>
                                  <span className="text-gray-700">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Features */}
                        {result?.data?.pages[selectedPage].content.features
                          .length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Features
                            </h4>
                            <ul className="space-y-2">
                              {result?.data?.pages[
                                selectedPage
                              ].content.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-blue-500 mr-2">⚡</span>
                                  <span className="text-gray-700">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Topics Tab */}
                {activeTab === "topics" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Main Topics Identified
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result?.data?.websiteSummary.mainTopics.map(
                        (topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {topic}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Services Tab */}
                {activeTab === "services" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Key Services Offered
                    </h3>
                    <div className="space-y-3">
                      {result?.data?.websiteSummary.keyServices.map(
                        (service, index) => (
                          <div
                            key={index}
                            className="bg-green-50 border border-green-200 rounded-lg p-4"
                          >
                            <div className="flex items-center">
                              <span className="text-green-500 mr-3">🛠️</span>
                              <span className="text-gray-900 font-medium">
                                {service}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* New Analysis Button */}
            <div className="text-center">
              <button
                onClick={() => setResult(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Analyze Another Website
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
