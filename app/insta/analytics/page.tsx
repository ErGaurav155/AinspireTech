"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Users,
  Clock,
  Target,
  Calendar,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { AnalyticsDashboard } from "@/components/insta/Analytics-dashboard";

// Mock analytics data
const analyticsData = {
  overview: {
    totalReplies: 1247,
    successRate: 94.2,
    avgResponseTime: 2.3,
    engagementIncrease: 23.5,
  },
  accountPerformance: [
    {
      id: "1",
      username: "fashionista_jane",
      profilePicture:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      replies: 456,
      successRate: 96.1,
      engagementRate: 4.2,
      avgResponseTime: 1.8,
      topTemplate: "Welcome Message",
    },
    {
      id: "2",
      username: "tech_guru_mike",
      profilePicture:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      replies: 234,
      successRate: 91.3,
      engagementRate: 3.8,
      avgResponseTime: 2.1,
      topTemplate: "Product Inquiry",
    },
    {
      id: "3",
      username: "food_lover_sarah",
      profilePicture:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      replies: 557,
      successRate: 95.8,
      engagementRate: 5.1,
      avgResponseTime: 1.2,
      topTemplate: "Recipe Request",
    },
  ],
  templatePerformance: [
    {
      name: "Welcome Message",
      usage: 234,
      successRate: 97.2,
      avgEngagement: 4.5,
      triggers: ["hello", "hi", "new follower"],
    },
    {
      name: "Product Inquiry",
      usage: 189,
      successRate: 93.1,
      avgEngagement: 3.8,
      triggers: ["price", "cost", "buy"],
    },
    {
      name: "Recipe Request",
      usage: 156,
      successRate: 95.5,
      avgEngagement: 4.2,
      triggers: ["recipe", "ingredients", "how to make"],
    },
    {
      name: "Compliment Response",
      usage: 123,
      successRate: 98.4,
      avgEngagement: 5.1,
      triggers: ["love", "beautiful", "amazing"],
    },
  ],
  recentActivity: [
    {
      id: "1",
      type: "reply_sent",
      account: "fashionista_jane",
      template: "Welcome Message",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      success: true,
    },
    {
      id: "2",
      type: "reply_sent",
      account: "food_lover_sarah",
      template: "Recipe Request",
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      success: true,
    },
    {
      id: "3",
      type: "reply_failed",
      account: "tech_guru_mike",
      template: "Product Inquiry",
      timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      success: false,
    },
    {
      id: "4",
      type: "reply_sent",
      account: "fashionista_jane",
      template: "Compliment Response",
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      success: true,
    },
  ],
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedAccount, setSelectedAccount] = useState("all");

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbsDefault />

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 md:gap-0 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Track performance and optimize your Instagram auto-reply system
          </p>
        </div>
        <div className="flex  flex-col md:flex-row gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="card-hover group">
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="card-hover group">
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="fashionista_jane">
                @fashionista_jane
              </SelectItem>
              <SelectItem value="tech_guru_mike">@tech_guru_mike</SelectItem>
              <SelectItem value="food_lover_sarah">
                @food_lover_sarah
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-hover group hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Replies</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.totalReplies.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover group hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.successRate}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover group hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.avgResponseTime}s
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              -0.5s improvement
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover group hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engagement Boost
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{analyticsData.overview.engagementIncrease}%
            </div>
            <p className="text-xs text-muted-foreground">
              Since auto-replies enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Performance */}
      <div className=" grid lg:grid-cols-2 gap-8 mb-8">
        <Card className="card-hover group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Account Performance
            </CardTitle>
            <CardDescription>
              Compare performance across your Instagram accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 w-full  p-2">
            {analyticsData.accountPerformance.map((account) => (
              <div
                key={account.id}
                className="flex flex-col w-full items-center justify-between p-4 gap-3 border rounded-lg"
              >
                <div className="flex  items-center space-x-2 lg:space-x-4">
                  <Image
                    src={account.profilePicture}
                    alt={account.username}
                    width={48}
                    height={48}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-base lg:text-lg font-medium lg:font-semibold">
                      @{account.username}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {account.replies} replies • {account.successRate}% success
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm font-medium">
                    {account.engagementRate}% engagement
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {account.avgResponseTime}s avg time
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-hover group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Template Performance
            </CardTitle>
            <CardDescription>
              See which templates are performing best
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-2">
            {analyticsData.templatePerformance.map((template, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{template.name}</h4>
                  <Badge variant="outline">{template.usage} uses</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span>{template.successRate}%</span>
                  </div>
                  <Progress value={template.successRate} className="h-2" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.triggers.slice(0, 3).map((trigger, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {trigger}
                    </Badge>
                  ))}
                  {template.triggers.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.triggers.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <AnalyticsDashboard />
      {/* Recent Activity */}
      <Card className="card-hover group">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest auto-reply activities across all accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.success ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {activity.type === "reply_sent"
                        ? "Reply sent"
                        : "Reply failed"}
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        to @{activity.account}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Template: {activity.template}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={activity.success ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {activity.success ? "Success" : "Failed"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
