"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useAuth } from "@clerk/nextjs";

// Dummy analytics data fallback
// const dummyAnalyticsData = {
//   overview: {
//     totalReplies: 1247,
//     successRate: 94.2,
//     avgResponseTime: 2.3,
//     engagementIncrease: 23.5,
//   },
//   accountPerformance: [
//     {
//       id: "1",
//       username: "fashionista_jane",
//       profilePicture:
//         "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
//       replies: 456,
//       successRate: 96.1,
//       engagementRate: 4.2,
//       avgResponseTime: 1.8,
//       topTemplate: "Welcome Message",
//     },
//     {
//       id: "2",
//       username: "tech_guru_mike",
//       profilePicture:
//         "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
//       replies: 234,
//       successRate: 91.3,
//       engagementRate: 3.8,
//       avgResponseTime: 2.1,
//       topTemplate: "Product Inquiry",
//     },
//     {
//       id: "3",
//       username: "food_lover_sarah",
//       profilePicture:
//         "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
//       replies: 557,
//       successRate: 95.8,
//       engagementRate: 5.1,
//       avgResponseTime: 1.2,
//       topTemplate: "Recipe Request",
//     },
//   ],

//   recentActivity: [
//     {
//       id: "1",
//       type: "reply_sent",
//       account: "fashionista_jane",
//       template: "Welcome Message",
//       timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
//       success: true,
//     },
//     {
//       id: "2",
//       type: "reply_sent",
//       account: "food_lover_sarah",
//       template: "Recipe Request",
//       timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
//       success: true,
//     },
//     {
//       id: "3",
//       type: "reply_failed",
//       account: "tech_guru_mike",
//       template: "Product Inquiry",
//       timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
//       success: false,
//     },
//     {
//       id: "4",
//       type: "reply_sent",
//       account: "fashionista_jane",
//       template: "Compliment Response",
//       timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
//       success: true,
//     },
//   ],
// };
const ACCOUNTS_CACHE_KEY = "instagramAccounts";

export default function AnalyticsPage() {
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const [timeRange, setTimeRange] = useState("7d");
  const [analyticsData, setAnalyticsData] = useState<any>();

  const [selectedAccount, setSelectedAccount] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  // const fetchAnalyticsData = useCallback(async () => {
  //   try {
  //     const params = new URLSearchParams({
  //       timeRange,
  //       accountId: selectedAccount,
  //     });

  //     const response = await fetch(`/api/insta/analytics?${params}`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setAnalyticsData(data);
  //     } else {
  //       console.log("API not available, using dummy data");
  //       setAnalyticsData(dummyAnalyticsData);
  //     }
  //   } catch (error) {
  //     console.log("API error, using dummy data:", error);
  //     setAnalyticsData(dummyAnalyticsData);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [selectedAccount, timeRange]);

  const fetchAccounts = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      // Check cache first
      const cachedData = localStorage.getItem(ACCOUNTS_CACHE_KEY);
      const cacheDuration = 15 * 60 * 1000; // 15 minutes

      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < cacheDuration) {
          setIsLoading(false);
          const stats = {
            totalAccounts: data.length,
            activeAccounts: data.filter((account: any) => account?.isActive)
              .length,
            totalTemplates: data.reduce(
              (sum: number, account: any) =>
                sum + (account?.templatesCount || 0),
              0
            ),
            totalReplies: data.reduce(
              (sum: number, account: any) => sum + (account?.repliesCount || 0),
              0
            ),
            engagementRate: 87, // Mock data
            successRate: 94, // Mock data
            avgResponseTime: 2.3,
            accounts: data,
            recentActivity: [], // No recent activity in cache
          };
          setAnalyticsData(stats);
          return stats;
        }
      }

      // Fetch from API
      const accountsResponse = await fetch(
        `/api/insta/dashboard?userId=${userId}`
      );
      if (!accountsResponse.ok) throw new Error("Failed to fetch accounts");

      const { accounts: dbAccounts } = await accountsResponse.json();
      if (!dbAccounts?.length) {
        return null;
      }

      // Fetch Instagram data for each account
      const completeAccounts = await Promise.all(
        dbAccounts.map(async (dbAccount: any) => {
          try {
            const instaResponse = await fetch(
              `/api/insta/user-info?accessToken=${dbAccount.accessToken}&fields=username,user_id,followers_count,media_count,profile_picture_url`
            );

            if (!instaResponse.ok) throw new Error("Instagram API failed");

            const instaData = await instaResponse.json();

            return {
              id: dbAccount._id,
              accountId: dbAccount.instagramId,
              username: instaData.username || dbAccount.username,
              displayName:
                dbAccount.displayName || instaData.username || "No Name",
              profilePicture:
                dbAccount.profilePicture ||
                instaData.profile_picture_url ||
                "/public/assets/img/default-img.jpg",
              followersCount:
                instaData.followers_count || dbAccount.followersCount || 0,
              postsCount: instaData.media_count || dbAccount.postsCount || 0,
              isActive: dbAccount.isActive || false,
              templatesCount: dbAccount.templatesCount || 0,
              repliesCount: dbAccount.repliesCount || 0,
              lastActivity: dbAccount.lastActivity || new Date().toISOString(),
              engagementRate: dbAccount.engagementRate || 0,
              avgResponseTime: dbAccount.avgResponseTime || "0s",
              accessToken: dbAccount.accessToken,
            };
          } catch (instaError) {
            console.error(
              `Failed to fetch Instagram data for account ${dbAccount._id}:`,
              instaError
            );
            return null;
          }
        })
      );
      const validAccounts = completeAccounts.filter(Boolean);

      const stats = {
        totalAccounts: validAccounts.length,
        activeAccounts: validAccounts.filter((account) => account?.isActive)
          .length,
        totalTemplates: validAccounts.reduce(
          (sum, account) => sum + (account?.templatesCount || 0),
          0
        ),
        totalReplies: validAccounts.reduce(
          (sum, account) => sum + (account?.repliesCount || 0),
          0
        ),
        engagementRate: 87, // Mock data
        successRate: 94, // Mock data
        avgResponseTime: 2.3,

        accounts: validAccounts,
      };

      localStorage.setItem(
        ACCOUNTS_CACHE_KEY,
        JSON.stringify({
          data: validAccounts,
          timestamp: Date.now(),
        })
      );
      return stats;
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load accounts"
      );
    }
  }, [userId]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const accountsData = await fetchAccounts();
      const response = await fetch(`/api/insta/replylogs?userId=${userId}`);
      let recentActivity;
      if (response.ok) {
        recentActivity = await response.json();
      } else {
        console.error(
          "Using dummy data for recent activity - API not available"
        );
      }

      const updatedData = {
        ...accountsData,
        recentActivity: recentActivity?.replyLogs,
      };
      await setAnalyticsData(updatedData);
    } catch (error) {
      console.error("Using dummy data - API error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchAccounts]);
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, selectedAccount, fetchAnalyticsData]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto mb-4"></div>
          <p className="text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbsDefault />
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 md:gap-0 mb-8">
          <div>
            <div className="inline-flex items-center bg-blue-100/10 text-blue-400 border border-blue-400/30 rounded-full px-4 py-1 mb-4">
              <BarChart3 className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Performance Analytics</span>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Track performance and optimize your Instagram auto-reply system
            </p>
          </div>
          <div className="flex  flex-col md:flex-row gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-[#0a0a0a]/60 border-white/20">
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
              <SelectTrigger className="w-48 bg-[#0a0a0a]/60 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="card-hover group">
                <SelectItem value="all">All Accounts</SelectItem>
                {analyticsData.accounts.map((account: any) => (
                  <SelectItem key={account.accountId} value={account.username}>
                    {account.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Replies
              </CardTitle>

              <MessageSquare className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#B026FF]">
                {analyticsData.totalReplies.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <Target className="h-4 w-4 text-[#B026FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF2E9F]">
                {analyticsData.successRate}%
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +2.1% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Avg Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-[#FF2E9F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#10B981]">
                {analyticsData.avgResponseTime}s
              </div>
              <p className="text-xs text-gray-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                -0.5s improvement
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Engagement Boost
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00F0FF]">
                +{analyticsData.engagementRate}%
              </div>
              <p className="text-xs text-gray-400">
                Since auto-replies enabled
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Account Performance */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="card-hover group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-[#00F0FF]" />
                Account Performance
              </CardTitle>
              <CardDescription className="text-gray-400 font-mono">
                Compare performance across your Instagram accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 w-full  p-2">
              {analyticsData.accounts.map((account: any) => (
                <div
                  key={account.id}
                  className="flex flex-col w-full items-center justify-between p-4 gap-3 border rounded-lg"
                >
                  <div className="flex  items-center space-x-2 lg:space-x-4">
                    <Image
                      width={48}
                      height={48}
                      src={account.profilePicture}
                      alt={account.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-base lg:text-lg font-medium lg:font-semibold">
                        @{account.username}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {account.repliesCount} replies
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <div className="text-sm font-medium text-white">
                      {account.engagementRate}% engagement
                    </div>
                    <div className="text-xs text-gray-400">
                      {account.avgResponseTime}s avg time
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="card-hover group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-[#FF2E9F]" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-400 font-mono">
                Latest auto-reply activities across all accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-2 w-2 rounded-full ${"bg-[#00F0FF]"}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {activity.type === "reply_sent"
                            ? "Reply sent"
                            : "Reply failed"}
                          <span className="text-gray-400">
                            {" "}
                            to @{activity.account}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Template: {activity.template}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={"default"}
                        className={
                          "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30"
                        }
                      >
                        Success
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <AnalyticsDashboard />
        {/* Recent Activity */}
      </div>
    </div>
  );
}
