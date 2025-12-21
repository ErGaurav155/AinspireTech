// app/components/admin/RateLimitDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { getWindowStats } from "@/lib/services/hourlyRateLimiter";

export default function RateLimitDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getWindowStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Rate Limit Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold">Current Window</h3>
            <p className="text-3xl font-bold">{stats?.window}</p>
            <p className="text-sm text-gray-600">
              {stats?.isCurrentWindow ? "Active" : "Previous"}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold">Global Calls</h3>
            <p className="text-3xl font-bold">{stats?.global?.totalCalls}</p>
            <p className="text-sm text-gray-600">
              of {stats?.global?.appLimit} limit
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded">
            <h3 className="font-semibold">Queued Items</h3>
            <p className="text-3xl font-bold">{stats?.queue?.queuedItems}</p>
            <p className="text-sm text-gray-600">Waiting for next window</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Queue by Action Type</h3>
        <div className="space-y-2">
          {stats?.queue?.byType?.map((item: any) => (
            <div key={item._id} className="flex justify-between items-center">
              <span className="font-medium">{item._id}</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">User Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold">{stats?.users?.totalUsers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Calls</p>
            <p className="text-2xl font-bold">{stats?.users?.totalCalls}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Calls/User</p>
            <p className="text-2xl font-bold">
              {stats?.users?.averageCallsPerUser.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Accounts Processed</p>
            <p className="text-2xl font-bold">
              {stats?.global?.accountsProcessed}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
