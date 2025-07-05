"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function AnalyticsDashboard() {
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="flex items-center justify-center bg-transparent backdrop-blur-sm border-gray-900 p-0">
              <CardHeader className="p-2">
                <CardTitle className="text-sm font-medium text-gray-300 p-2">
                  Total Comments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="text-2xl font-bold text-[#00F0FF]">2,847</div>
                <p className="text-xs text-gray-400">+12.5% from last month</p>
              </CardContent>
            </Card>
            <Card className="flex items-center justify-center bg-transparent backdrop-blur-sm border-gray-900">
              <CardHeader className="p-2">
                <CardTitle className="text-sm font-medium text-gray-300 p-2">
                  Replies Sent
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="text-2xl font-bold text-[#B026FF]">2,795</div>
                <p className="text-xs text-gray-400">+11.8% from last month</p>
              </CardContent>
            </Card>
            <Card className="flex items-center justify-center bg-transparent backdrop-blur-sm border-gray-900">
              <CardHeader className="p-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Response Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="text-2xl font-bold text-[#FF2E9F]">98.2%</div>
                <p className="text-xs text-gray-400">+1.2% from last month</p>
              </CardContent>
            </Card>
            <Card className="flex  items-center justify-center bg-transparent backdrop-blur-sm border-gray-900">
              <CardHeader className="p-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Avg Response Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="text-2xl font-bold text-[#10B981]">2.3s</div>
                <p className="text-xs text-gray-400">-0.5s from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-transparent backdrop-blur-sm border-gray-900">
            <CardHeader className="p-2">
              <CardTitle className="text-white">Daily Activity</CardTitle>
              <CardDescription className="text-gray-400">
                Comments and replies over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <ResponsiveContainer width={1000} height={300}>
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
              <ResponsiveContainer width={1000} height={300}>
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
                <ResponsiveContainer className={``} width="100%" height={300}>
                  <PieChart className="">
                    <Pie
                      className=""
                      data={templateData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
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
                        `${name} ${(percent * 100).toFixed(0)}%`
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
