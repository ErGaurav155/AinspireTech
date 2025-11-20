"use client";

import { useState } from "react";

interface ScrapedData {
  url: string;
  title: string;
  description: string;
  keywords: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  links: Array<{
    href: string;
    text: string;
  }>;
  images: Array<{
    src: string;
    alt: string;
  }>;
  content: string;
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!url) {
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

    try {
      const response = await fetch(
        `/api/scrape-anu?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit reached. Please try again later.");
        }
        throw new Error("Failed to scrape website.");
      }

      const result = await response.json();
      if (result.success) {
        setScrapedData(result.data);
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Website Scraper
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Enter a URL below to extract website content using Puppeteer running
          in a Vercel Function.
        </p>
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black focus:outline-none"
          />
          <button
            onClick={handleScrape}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Scraping..." : "Scrape"}
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {scrapedData && (
          <div className="mt-8 border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-white">
            <h2 className="text-2xl font-semibold p-4 bg-gray-100 border-b text-black">
              Scraped Website Data
            </h2>

            <div className="p-6 space-y-6 text-left">
              {/* Basic Info */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  Basic Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <strong>URL:</strong>{" "}
                    <span className="text-blue-600 wrap-break-word">
                      {scrapedData.url}
                    </span>
                  </p>
                  <p>
                    <strong>Title:</strong> {scrapedData.title || "No title"}
                  </p>
                  {scrapedData.description && (
                    <p>
                      <strong>Description:</strong> {scrapedData.description}
                    </p>
                  )}
                  {scrapedData.keywords && (
                    <p>
                      <strong>Keywords:</strong> {scrapedData.keywords}
                    </p>
                  )}
                </div>
              </div>

              {/* Headings */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  Headings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(scrapedData.headings).map(
                    ([level, headings]) =>
                      headings.length > 0 && (
                        <div key={level} className="border rounded-lg p-3">
                          <h4 className="font-semibold text-gray-700 capitalize mb-2">
                            {level}
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {headings.map((heading, index) => (
                              <li
                                key={index}
                                className="truncate"
                                title={heading}
                              >
                                {heading}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                  )}
                </div>
              </div>

              {/* Links */}
              {scrapedData.links.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Links ({scrapedData.links.length})
                  </h3>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-3">
                    {scrapedData.links.map((link, index) => (
                      <div
                        key={index}
                        className="mb-2 pb-2 border-b last:border-b-0"
                      >
                        <div className="font-medium text-sm">{link.text}</div>
                        <div className="text-blue-600 text-xs wrap-break-word">
                          {link.href}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Preview */}
              {scrapedData.content && (
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Content Preview
                  </h3>
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {scrapedData.content}
                      {scrapedData.content.length === 2000 && "..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
