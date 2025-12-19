// app/components/shared/RateLimitDashboard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

interface RateLimitStatus {
  calls: number;
  remaining: number;
  isBlocked: boolean;
  blockedUntil?: string;
  resetInMs: number;
}

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  queued: number;
  failed: number;
  byType: Record<string, number>;
  avgProcessingTime: number;
}

export default function RateLimitDashboard() {
  const { user } = useUser();
  const [accountId, setAccountId] = useState("");
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStatus = useCallback(async () => {
    if (!accountId) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ accountId });
      const response = await fetch(`/api/rate-limits/status?${params}`);
      const data = await response.json();

      if (data.success) {
        setRateLimit(data.data.rateLimit);
        setQueueStats(data.data.queue);
      } else {
        setError(data.error || "Failed to fetch status");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  const resetRateLimit = async () => {
    if (
      !accountId ||
      !confirm("Are you sure you want to reset the rate limit?")
    )
      return;

    try {
      const response = await fetch("/api/rate-limits/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Rate limit reset successfully");
        fetchStatus();
      }
    } catch (err) {
      alert("Failed to reset rate limit");
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchStatus();
      // Refresh every 30 seconds
      const interval = setInterval(fetchStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [accountId, fetchStatus]);

  if (!user) {
    return <div>Please sign in to view rate limits</div>;
  }

  return (
    <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-2xl backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Rate Limit Monitor</h2>
        <p className="text-gray-400">
          Monitor and manage Instagram API rate limits
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Instagram Account ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="Enter Instagram account ID"
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={fetchStatus}
            disabled={loading || !accountId}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-700"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {rateLimit && (
        <div className="space-y-6">
          {/* Rate Limit Status */}
          <div className="bg-gray-900/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              Rate Limit Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Calls Used</div>
                <div className="text-2xl font-bold text-white">
                  {rateLimit.calls}
                </div>
                <div className="text-sm text-gray-500">out of 180</div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Remaining</div>
                <div
                  className={`text-2xl font-bold ${
                    rateLimit.remaining < 20
                      ? "text-red-400"
                      : rateLimit.remaining < 50
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {rateLimit.remaining}
                </div>
                <div className="text-sm text-gray-500">calls available</div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Status</div>
                <div
                  className={`text-xl font-bold ${
                    rateLimit.isBlocked ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {rateLimit.isBlocked ? "BLOCKED" : "ACTIVE"}
                </div>
                {rateLimit.blockedUntil && (
                  <div className="text-sm text-red-400">
                    Until:{" "}
                    {new Date(rateLimit.blockedUntil).toLocaleTimeString()}
                  </div>
                )}
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Reset In</div>
                <div className="text-2xl font-bold text-blue-400">
                  {Math.ceil(rateLimit.resetInMs / 60000)} min
                </div>
                <button
                  onClick={resetRateLimit}
                  className="mt-2 px-3 py-1 text-sm bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                >
                  Reset Limit
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>API Usage</span>
                <span>{Math.round((rateLimit.calls / 180) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    rateLimit.calls < 120
                      ? "bg-green-500"
                      : rateLimit.calls < 170
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min((rateLimit.calls / 180) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Safe (&lt;120)</span>
                <span>Warning (&lt;170)</span>
                <span>Blocked (&gt;170)</span>
              </div>
            </div>
          </div>

          {/* Queue Statistics */}
          {queueStats && (
            <div className="bg-gray-900/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">
                Queue Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Total</div>
                  <div className="text-2xl font-bold text-white">
                    {queueStats.total}
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Queued</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {queueStats.queued}
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Processing</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {queueStats.processing}
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Failed</div>
                  <div className="text-2xl font-bold text-red-400">
                    {queueStats.failed}
                  </div>
                </div>
              </div>

              {/* Queue by Type */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-300 mb-3">
                  Actions by Type
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(queueStats.byType).map(([type, count]) => (
                    <div key={type} className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">{type}</div>
                      <div className="text-lg font-bold text-white">
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
