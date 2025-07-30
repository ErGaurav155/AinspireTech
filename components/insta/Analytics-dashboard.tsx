"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data for charts
const dailyData = [
  { date: "2024-01-01", comments: 45, replies: 44, engagement: 97.8 },
  { date: "2024-01-02", comments: 52, replies: 51, engagement: 98.1 },
  { date: "2024-01-03", comments: 38, replies: 37, engagement: 97.4 },
  { date: "2024-01-04", comments: 61, replies: 60, engagement: 98.4 },
  { date: "2024-01-05", comments: 44, replies: 43, engagement: 97.7 },
  { date: "2024-01-06", comments: 58, replies: 57, engagement: 98.3 },
  { date: "2024-01-07", comments: 47, replies: 46, engagement: 97.9 },
];

const templateData = [
  { name: "Product Inquiry", value: 156, color: "#00F0FF" },
  { name: "Shipping Info", value: 89, color: "#B026FF" },
  { name: "Compliment Response", value: 234, color: "#FF2E9F" },
  { name: "General Support", value: 67, color: "#10B981" },
];

const sentimentData = [
  { category: "Positive", value: 78, color: "#10B981" },
  { category: "Neutral", value: 18, color: "#6B7280" },
  { category: "Negative", value: 4, color: "#EF4444" },
];
const ACCOUNTS_CACHE_KEY = "instagramAccounts";

export function AnalyticsDashboard() {
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const fetchAccounts = async () => {
  //   if (!userId) return;

  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     // Check cache first
  //     const cachedData = localStorage.getItem(ACCOUNTS_CACHE_KEY);
  //     const cacheDuration = 15 * 60 * 1000; // 15 minutes

  //     if (cachedData) {
  //       const { data, timestamp } = JSON.parse(cachedData);
  //       if (Date.now() - timestamp < cacheDuration) {
  //         setIsLoading(false);
  //         const stats = {
  //           totalAccounts: data.length,
  //           activeAccounts: data.filter((account: any) => account?.isActive)
  //             .length,
  //           totalTemplates: data.reduce(
  //             (sum: number, account: any) =>
  //               sum + (account?.templatesCount || 0),
  //             0
  //           ),
  //           totalReplies: data.reduce(
  //             (sum: number, account: any) => sum + (account?.repliesCount || 0),
  //             0
  //           ),
  //           engagementRate: 87, // Mock data
  //           successRate: 94, // Mock data
  //           avgResponseTime: 2.3,
  //           accounts: data,
  //           recentActivity: [], // No recent activity in cache
  //         };
  //         // setAnalyticsData(stats);
  //         return stats;
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch accounts:", error);
  //     setError(
  //       error instanceof Error ? error.message : "Failed to load accounts"
  //     );
  //   }
  // };
  return (
    <div className="space-y-8 mb-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Analytics Dashboard
        </h2>
        <p className="text-gray-400">
          Track your automation performance and engagement metrics
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6 ">
        <TabsList className=" bg-[#0a0a0a]/60 border min-h-max flex flex-wrap items-center justify-start max-w-max gap-1 md:gap-3 text-white  w-full grid-cols-4  border-gray-900">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="engagement"
            className="data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]"
          >
            Engagement
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="sentiment"
            className="data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]"
          >
            Sentiment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-transparent backdrop-blur-sm border-gray-900">
            <CardHeader className="p-2">
              <CardTitle className="text-white">Daily Activity</CardTitle>
              <CardDescription className="text-gray-400">
                Comments and replies over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <ResponsiveContainer minWidth={1000} width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="comments"
                    stroke="#00F0FF"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="replies"
                    stroke="#B026FF"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card className=" bg-transparent backdrop-blur-sm border-gray-900">
            <CardHeader className="p-2">
              <CardTitle className="text-white">
                Engagement Rate Trend
              </CardTitle>
              <CardDescription className="text-gray-400">
                How well your automated replies are performing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <ResponsiveContainer minWidth={1000} width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" domain={[95, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#FF2E9F"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className=" bg-transparent backdrop-blur-sm border-gray-900">
            <CardHeader>
              <CardTitle className="text-white">Template Usage</CardTitle>
              <CardDescription className="text-gray-400">
                Which templates are used most frequently
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart className="">
                    <Pie
                      className=""
                      data={templateData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent! * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {templateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {templateData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[#0a0a0a]/60 border boder-[#208d7d] rounded-lg "
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-white font-medium">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-gray-300">{item.value} uses</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <Card className=" bg-transparent backdrop-blur-sm border-gray-900">
            <CardHeader>
              <CardTitle className="text-white">
                Comment Sentiment Analysis
              </CardTitle>
              <CardDescription className="text-gray-400">
                Understanding the tone of incoming comments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent! * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {sentimentData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[#0a0a0a]/60 border boder-[#208d7d] rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-white font-medium">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-gray-300">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
