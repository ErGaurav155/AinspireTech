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

// Helper functions for safe value access
const getSafeString = (
  value: any,
  fallback: string = "Not available"
): string => {
  return value && typeof value === "string" && value.trim() !== ""
    ? value
    : fallback;
};

const getSafeArray = (value: any, fallback: any[] = []): any[] => {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
};

const getSafeNumber = (value: any, fallback: number = 0): number => {
  return typeof value === "number" && !isNaN(value) ? value : fallback;
};

const getSafeObject = (value: any, fallback: any = {}): any => {
  return value && typeof value === "object" && Object.keys(value).length > 0
    ? value
    : fallback;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "Not available";
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "Invalid date";
  }
};

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
          maxPages: 5,
          maxDepth: 2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scraping failed");
      }

      setResult(data);
    } catch (error) {
      console.error("Request failed:", error);
      setResult({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to scraping service",
      });
    } finally {
      setLoading(false);
    }
  };

  // Safe data accessors
  const scrapingInfo = result?.data?.scrapingInfo || {
    totalPagesScraped: 0,
    successfulPages: 0,
    failedPages: 0,
    scrapedAt: "",
    baseDomain: "Unknown domain",
  };

  const contentStatistics = result?.data?.contentStatistics || {
    totalParagraphs: 0,
    totalHeadings: 0,
    totalKeyPoints: 0,
    totalFeatures: 0,
    totalBenefits: 0,
    totalContentSnippets: 0,
    averageParagraphsPerPage: 0,
  };

  const pages = getSafeArray(result?.data?.pages);
  const websiteSummary = result?.data?.websiteSummary || {
    mainTopics: [],
    keyServices: [],
    contentOverview: {},
  };

  const currentPage = pages[selectedPage] || {
    url: "",
    pageInfo: {
      title: "No page selected",
      description: "",
      mainHeading: "",
      depth: 0,
    },
    content: {
      headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
      paragraphs: [],
      keyPoints: [],
      features: [],
      benefits: [],
      mainContent: "",
    },
    contentMetrics: {
      paragraphCount: 0,
      headingCount: 0,
      keyPointsCount: 0,
      featuresCount: 0,
      benefitsCount: 0,
      totalContentLength: 0,
    },
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
            {getSafeString(scrapingInfo.baseDomain, "the website")}
          </p>
        </div>

        {!result.success ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-800 font-medium text-lg mb-2">
              ❌ Analysis Failed
            </div>
            <p className="text-red-700">
              {getSafeString(result.error, "Unknown error occurred")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getSafeNumber(scrapingInfo.totalPagesScraped)}
                </div>
                <div className="text-gray-600 text-sm">Pages Analyzed</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getSafeNumber(contentStatistics.totalParagraphs)}
                </div>
                <div className="text-gray-600 text-sm">Paragraphs Found</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {getSafeNumber(contentStatistics.totalHeadings)}
                </div>
                <div className="text-gray-600 text-sm">Headings Extracted</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {getSafeNumber(contentStatistics.totalContentSnippets)}
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
                    { id: "pages", name: `Page Contents (${pages.length})` },
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
                                {getSafeNumber(scrapingInfo.successfulPages)}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Failed Pages:</dt>
                              <dd className="font-medium">
                                {getSafeNumber(scrapingInfo.failedPages)}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">
                                Average Paragraphs/Page:
                              </dt>
                              <dd className="font-medium">
                                {getSafeNumber(
                                  contentStatistics.averageParagraphsPerPage
                                )}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Features Found:</dt>
                              <dd className="font-medium">
                                {getSafeNumber(contentStatistics.totalFeatures)}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Key Points:</dt>
                              <dd className="font-medium">
                                {getSafeNumber(
                                  contentStatistics.totalKeyPoints
                                )}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">
                                Benefits Identified:
                              </dt>
                              <dd className="font-medium">
                                {getSafeNumber(contentStatistics.totalBenefits)}
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
                                {getSafeString(scrapingInfo.baseDomain)}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Analysis Date:</dt>
                              <dd className="font-medium">
                                {formatDate(scrapingInfo.scrapedAt)}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">
                                Total Content Words:
                              </dt>
                              <dd className="font-medium">
                                {websiteSummary.contentOverview?.totalContentWords?.toLocaleString() ||
                                  "Not calculated"}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">
                                Content Density:
                              </dt>
                              <dd className="font-medium capitalize">
                                {getSafeString(
                                  websiteSummary.contentOverview
                                    ?.contentDensity,
                                  "Not calculated"
                                )}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>

                    {/* Content Quality Indicators */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Content Quality Indicators
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div
                            className={`text-lg font-bold ${
                              contentStatistics.totalParagraphs > 0
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {contentStatistics.totalParagraphs > 0 ? "✓" : "○"}
                          </div>
                          <div className="text-gray-600">Has Content</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-lg font-bold ${
                              contentStatistics.totalHeadings > 0
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {contentStatistics.totalHeadings > 0 ? "✓" : "○"}
                          </div>
                          <div className="text-gray-600">Structured</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-lg font-bold ${
                              contentStatistics.totalFeatures > 0
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {contentStatistics.totalFeatures > 0 ? "✓" : "○"}
                          </div>
                          <div className="text-gray-600">Features Listed</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-lg font-bold ${
                              pages.length > 1
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {pages.length > 1 ? "✓" : "○"}
                          </div>
                          <div className="text-gray-600">Multiple Pages</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pages Tab */}
                {activeTab === "pages" && (
                  <div className="space-y-6">
                    {/* Page Selector */}
                    {pages.length > 0 ? (
                      <>
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                          {pages.map((page, index) => (
                            <button
                              key={page.url || index}
                              onClick={() => setSelectedPage(index)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                                selectedPage === index
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {getSafeString(
                                page.pageInfo?.title,
                                `Page ${index + 1}`
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Page Content */}
                        <div className="space-y-6">
                          {/* Page Header */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {getSafeString(
                                currentPage.pageInfo.title,
                                "Untitled Page"
                              )}
                            </h3>
                            <p className="text-blue-700 mb-1">
                              {getSafeString(
                                currentPage.pageInfo.description,
                                "No description available"
                              )}
                            </p>
                            <p className="text-blue-600 text-sm break-all">
                              {getSafeString(
                                currentPage.url,
                                "URL not available"
                              )}
                            </p>
                            <div className="mt-2 text-xs text-gray-600">
                              Depth: {getSafeNumber(currentPage.pageInfo.depth)}{" "}
                              • Main Heading:{" "}
                              {getSafeString(
                                currentPage.pageInfo.mainHeading,
                                "Not found"
                              )}
                            </div>
                          </div>

                          {/* Content Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-white border rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-gray-900">
                                {getSafeNumber(
                                  currentPage.contentMetrics.paragraphCount
                                )}
                              </div>
                              <div className="text-gray-600 text-sm">
                                Paragraphs
                              </div>
                            </div>
                            <div className="bg-white border rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-gray-900">
                                {getSafeNumber(
                                  currentPage.contentMetrics.headingCount
                                )}
                              </div>
                              <div className="text-gray-600 text-sm">
                                Headings
                              </div>
                            </div>
                            <div className="bg-white border rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-gray-900">
                                {getSafeNumber(
                                  currentPage.contentMetrics.keyPointsCount
                                )}
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
                            {Object.entries(currentPage.content.headings).map(
                              ([level, headings]) => {
                                const safeHeadings = getSafeArray(headings);
                                return safeHeadings.length > 0 ? (
                                  <div key={level}>
                                    <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                                      {level} Headings ({safeHeadings.length})
                                    </h5>
                                    <div className="space-y-1">
                                      {safeHeadings.map((heading, idx) => (
                                        <div
                                          key={idx}
                                          className="text-gray-900 bg-gray-50 rounded px-3 py-2 text-sm"
                                        >
                                          {getSafeString(
                                            heading,
                                            "Empty heading"
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    key={level}
                                    className="text-sm text-gray-500 italic"
                                  >
                                    No {level} headings found
                                  </div>
                                );
                              }
                            )}
                          </div>

                          {/* Paragraphs */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Main Content (
                              {
                                getSafeArray(currentPage.content.paragraphs)
                                  .length
                              }{" "}
                              paragraphs)
                            </h4>
                            {currentPage.content.paragraphs.length > 0 ? (
                              <div className="space-y-3">
                                {currentPage.content.paragraphs.map(
                                  (paragraph: any, idx: any) => (
                                    <p
                                      key={idx}
                                      className="text-gray-700 leading-relaxed"
                                    >
                                      {getSafeString(
                                        paragraph,
                                        "[Empty paragraph]"
                                      )}
                                    </p>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">
                                No paragraphs content extracted from this page.
                              </p>
                            )}
                          </div>

                          {/* Key Points */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Key Points (
                              {
                                getSafeArray(currentPage.content.keyPoints)
                                  .length
                              }
                              )
                            </h4>
                            {currentPage.content.keyPoints.length > 0 ? (
                              <ul className="space-y-2">
                                {currentPage.content.keyPoints.map(
                                  (point: any, idx: any) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-green-500 mr-2">
                                        •
                                      </span>
                                      <span className="text-gray-700">
                                        {getSafeString(point)}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-gray-500 italic">
                                No key points identified on this page.
                              </p>
                            )}
                          </div>

                          {/* Features */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Features (
                              {
                                getSafeArray(currentPage.content.features)
                                  .length
                              }
                              )
                            </h4>
                            {currentPage.content.features.length > 0 ? (
                              <ul className="space-y-2">
                                {currentPage.content.features.map(
                                  (feature: any, idx: any) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-blue-500 mr-2">
                                        ⚡
                                      </span>
                                      <span className="text-gray-700">
                                        {getSafeString(feature)}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-gray-500 italic">
                                No features listed on this page.
                              </p>
                            )}
                          </div>

                          {/* Benefits */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Benefits (
                              {
                                getSafeArray(currentPage.content.benefits)
                                  .length
                              }
                              )
                            </h4>
                            {currentPage.content.benefits.length > 0 ? (
                              <ul className="space-y-2">
                                {currentPage.content.benefits.map(
                                  (benefit: any, idx: any) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-green-500 mr-2">
                                        ✓
                                      </span>
                                      <span className="text-gray-700">
                                        {getSafeString(benefit)}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-gray-500 italic">
                                No benefits identified on this page.
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500 text-lg">
                          No pages were successfully analyzed.
                        </div>
                        <div className="text-sm text-gray-400 mt-2">
                          This could be due to website restrictions or technical
                          issues.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Topics Tab */}
                {activeTab === "topics" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Main Topics Identified (
                      {getSafeArray(websiteSummary.mainTopics).length})
                    </h3>
                    {websiteSummary.mainTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {websiteSummary.mainTopics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {getSafeString(topic)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500">
                          No main topics could be identified from the content.
                        </div>
                        <div className="text-sm text-gray-400 mt-2">
                          This usually happens when theres limited textual
                          content on the website.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Services Tab */}
                {activeTab === "services" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Key Services Offered (
                      {getSafeArray(websiteSummary.keyServices).length})
                    </h3>
                    {websiteSummary.keyServices.length > 0 ? (
                      <div className="space-y-3">
                        {websiteSummary.keyServices.map((service, index) => (
                          <div
                            key={index}
                            className="bg-green-50 border border-green-200 rounded-lg p-4"
                          >
                            <div className="flex items-center">
                              <span className="text-green-500 mr-3">🛠️</span>
                              <span className="text-gray-900 font-medium">
                                {getSafeString(service)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500">
                          No specific services could be identified.
                        </div>
                        <div className="text-sm text-gray-400 mt-2">
                          Services are automatically detected from headings and
                          key content phrases.
                        </div>
                      </div>
                    )}
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
