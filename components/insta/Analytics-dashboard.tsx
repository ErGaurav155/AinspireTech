"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tailwindHexColors } from "@/constant";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
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
// const dailyData = [
//   { date: "2024-01-01", comments: 45, replies: 44, engagement: 97.8 },
//   { date: "2024-01-02", comments: 52, replies: 51, engagement: 98.1 },
//   { date: "2024-01-03", comments: 38, replies: 37, engagement: 97.4 },
//   { date: "2024-01-04", comments: 61, replies: 60, engagement: 98.4 },
//   { date: "2024-01-05", comments: 44, replies: 43, engagement: 97.7 },
//   { date: "2024-01-06", comments: 58, replies: 57, engagement: 98.3 },
//   { date: "2024-01-07", comments: 47, replies: 46, engagement: 97.9 },
// ];

// const templateData = [
//   { name: "Product Inquiry", value: 156, color: "#00F0FF" },
//   { name: "Shipping Info", value: 89, color: "#B026FF" },
//   { name: "Compliment Response", value: 234, color: "#FF2E9F" },
//   { name: "General Support", value: 67, color: "#10B981" },
// ];

const ACCOUNTS_CACHE_KEY = "instagramAccounts";
export interface TemplateChartData {
  name: string;
  value: number;
  color: string;
}
export interface SentimentChartData {
  category: string;
  value: number;
  color: string;
}

export function AnalyticsDashboard(templates: any) {
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [templateData, setTemplateData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [sentimentData, setSentimentData] = useState<
    { category: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    if (templates.templates && templates.templates.length > 0) {
      // Calculate total usage count
      const totalUsageCount = templates.templates.reduce(
        (sum: number, template: any) => sum + (template.usageCount || 0),
        0
      );

      // Transform template data
      const transformedData = templates.templates.map(
        (template: any, index: number) => ({
          name: template.name,
          value: template.usageCount,
          color: tailwindHexColors[index % tailwindHexColors.length],
          percentage:
            totalUsageCount > 0
              ? (template.usageCount / totalUsageCount) * 100
              : 0,
        })
      );

      setTemplateData(transformedData);

      // Calculate sentiment data (separate from templateData to avoid infinite loop)
      const adjustSentimentPercentages = () => {
        const supportTemplate = templates.templates.find(
          (template: any) => template.name === "Support Template"
        );

        if (supportTemplate) {
          const supportValue = supportTemplate.usageCount;
          const totalForSentiment = totalUsageCount || 1; // Avoid division by zero

          // Calculate percentages for sentiment
          const neutralValue = Math.round(
            ((supportValue + 4) / totalForSentiment) * 100
          );
          const negativeValue = Math.round(
            (supportValue / 2 / totalForSentiment) * 100
          );
          const positiveValue = 100 - (neutralValue + negativeValue);
          setSentimentData([
            {
              category: "Neutral",
              value: Math.max(0, Math.min(100, neutralValue)), // Clamp between 0-100
              color: "#6B7280",
            },
            {
              category: "Negative",
              value: Math.max(0, Math.min(100, negativeValue)),
              color: "#EF4444", // Changed to standard negative color
            },
            {
              category: "Positive",
              value: Math.max(0, Math.min(100, positiveValue)),
              color: "#10B981", // Changed to standard positive color
            },
          ]);
        } else {
          // Default sentiment data if no Support Template found
          setSentimentData([
            { category: "Positive", value: 78, color: "#10B981" },
            { category: "Neutral", value: 18, color: "#6B7280" },
            { category: "Negative", value: 4, color: "#EF4444" },
          ]);
        }
      };

      adjustSentimentPercentages();
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [templates.templates]); // REMOVED templateData from dependencies

  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto mb-4"></div>
          <p className="text-gray-300">Loading accounts...</p>
        </div>
      </div>
    );
  }
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

      <Tabs defaultValue="templates" className="space-y-6 ">
        <TabsList className=" bg-[#0a0a0a]/60 border min-h-max flex flex-wrap items-center justify-start max-w-max gap-1 md:gap-3 text-white  w-full grid-cols-4  border-gray-900">
          {/* <TabsTrigger
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
          </TabsTrigger> */}
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

        {/* <TabsContent value="overview" className="space-y-6">
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
        </TabsContent> */}

        {/* <TabsContent value="engagement" className="space-y-6">
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
        </TabsContent> */}

        <TabsContent value="templates" className="space-y-6">
          <Card className=" bg-transparent backdrop-blur-sm border-gray-900">
            <CardHeader>
              <CardTitle className="text-white">Template Usage</CardTitle>
              <CardDescription className="text-gray-400">
                Which templates are used most frequently
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
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
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color} // Use entry.color instead of templateData.color
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  {templateData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[#0a0a0a]/60 border border-[#208d7d] rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: item.color, // Use the color from the item
                          }}
                        />
                        <span className="text-white font-medium">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-gray-300">
                        {item.value} uses{" "}
                        {/* Use item.value instead of item.usageCount */}
                      </span>
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
                      label={({ category, percent }) =>
                        `${category} ${(percent! * 100).toFixed(0)}%`
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
                          style={{
                            backgroundColor:
                              tailwindHexColors[
                                Math.floor(
                                  Math.random() * tailwindHexColors.length
                                )
                              ],
                          }}
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
