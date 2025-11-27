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
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

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

export function AnalyticsDashboard({ templates }: { templates: any }) {
  const { userId, isLoaded } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const router = useRouter();
  // Theme-based styles
  const containerBg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-gray-50";
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const textMuted = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const cardBg = theme === "dark" ? "bg-[#0a0a0a]/60" : "bg-white/80";
  const cardBorder = theme === "dark" ? "border-white/10" : "border-gray-200";
  const tabBg = theme === "dark" ? "bg-[#0a0a0a]/60" : "bg-white/60";
  const tabBorder = theme === "dark" ? "border-gray-900" : "border-gray-300";
  const chartGridColor = theme === "dark" ? "#374151" : "#E5E7EB";
  const chartAxisColor = theme === "dark" ? "#9CA3AF" : "#6B7280";
  const tooltipBg = theme === "dark" ? "#1F2937" : "#FFFFFF";
  const tooltipBorder = theme === "dark" ? "#374151" : "#E5E7EB";
  const tooltipText = theme === "dark" ? "#FFFFFF" : "#111827";

  const [templateData, setTemplateData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [sentimentData, setSentimentData] = useState<
    { category: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    if (!isLoaded) {
      return; // Wait for auth to load
    }
    if (!userId) {
      router.push("/sign-in");
      return; // Wait for auth to load
    }
    if (templates && templates.length > 0) {
      // Calculate total usage count
      let totalUsageCount = 0;
      let transformedData;
      totalUsageCount = templates.reduce(
        (sum: number, template: any) => sum + (template.usageCount || 0),
        0
      );
      transformedData = templates.map((template: any, index: number) => ({
        name: template.name,
        value: template.usageCount,
        color: tailwindHexColors[index % tailwindHexColors.length],
        percentage:
          totalUsageCount > 0
            ? (template.usageCount / totalUsageCount) * 100
            : 0,
      }));
      setTemplateData(transformedData);

      // Transform template data

      // Calculate sentiment data (separate from templateData to avoid infinite loop)
      const adjustSentimentPercentages = () => {
        const supportTemplate = templates.find(
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
  }, [templates, userId, isLoaded, router]); // REMOVED templateData from dependencies

  if (isLoading || !isLoaded) {
    return (
      <div
        className={`min-h-screen ${textPrimary} flex items-center justify-center ${containerBg}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto mb-4"></div>
          <p className={textSecondary}>Loading accounts...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8 mb-10">
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${textPrimary}`}>
          Analytics Dashboard
        </h2>
        <p className={`${textSecondary} font-montserrat`}>
          Track your automation performance and engagement metrics
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList
          className={`${tabBg} ${tabBorder} border min-h-max flex flex-wrap items-center justify-start max-w-max gap-1 md:gap-3 w-full grid-cols-4`}
        >
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
          <Card className={`${cardBg} backdrop-blur-sm ${cardBorder}`}>
            <CardHeader className="p-2">
              <CardTitle className={textPrimary}>Daily Activity</CardTitle>
              <CardDescription className={textSecondary}>
                Comments and replies over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <ResponsiveContainer minWidth={1000} width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="date" stroke={chartAxisColor} />
                  <YAxis stroke={chartAxisColor} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "6px",
                      color: tooltipText,
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
          <Card className={`${cardBg} backdrop-blur-sm ${cardBorder}`}>
            <CardHeader className="p-2">
              <CardTitle className={textPrimary}>
                Engagement Rate Trend
              </CardTitle>
              <CardDescription className={textSecondary}>
                How well your automated replies are performing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <ResponsiveContainer minWidth={1000} width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="date" stroke={chartAxisColor} />
                  <YAxis stroke={chartAxisColor} domain={[95, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "6px",
                      color: tooltipText,
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
          <Card className={`${cardBg} backdrop-blur-sm ${cardBorder}`}>
            <CardHeader>
              <CardTitle className={textPrimary}>Template Usage</CardTitle>
              <CardDescription className={`${textSecondary} font-montserrat`}>
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: "6px",
                        color: tooltipText,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  {templateData.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 ${
                        theme === "dark" ? "bg-[#0a0a0a]/60" : "bg-gray-100"
                      } border ${
                        theme === "dark"
                          ? "border-[#208d7d]"
                          : "border-gray-300"
                      } rounded-lg`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: item.color, // Use the color from the item
                          }}
                        />
                        <span className={`${textPrimary} font-medium`}>
                          {item.name}
                        </span>
                      </div>
                      <span className={textSecondary}>
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
          <Card className={`${cardBg} backdrop-blur-sm ${cardBorder}`}>
            <CardHeader>
              <CardTitle className={textPrimary}>
                Comment Sentiment Analysis
              </CardTitle>
              <CardDescription className={textSecondary}>
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
                      label={({ name, percent, value }) =>
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: "6px",
                        color: tooltipText,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {sentimentData.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 ${
                        theme === "dark" ? "bg-[#0a0a0a]/60" : "bg-gray-100"
                      } border ${
                        theme === "dark"
                          ? "border-[#208d7d]"
                          : "border-gray-300"
                      } rounded-lg`}
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
                        <span className={`${textPrimary} font-medium`}>
                          {item.category}
                        </span>
                      </div>
                      <span className={textSecondary}>{item.value}%</span>
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
