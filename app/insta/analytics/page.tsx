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
  RefreshCw,
  Plus,
  Instagram,
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
import defaultImg from "@/public/assets/img/default-img.jpg";
import { formatResponseTimeSmart, refreshInstagramToken } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ACCOUNTS_CACHE_KEY = "instagramAccounts";
const ANALYTICS_CACHE_KEY = "analyticsData";

export default function AnalyticsPage() {
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any>([]);

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [hasError, setHasError] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getFilteredData = useCallback(() => {
    if (!analyticsData) return null;

    if (selectedAccount === "all") {
      return analyticsData;
    }

    // Find the selected account
    const account = analyticsData.accounts.find(
      (acc: any) => acc.username === selectedAccount
    );

    if (!account) return analyticsData;

    // Filter data for the selected account
    const filteredRecentActivity = analyticsData.recentActivity?.filter(
      (activity: any) => activity.account === account.username
    );

    // Calculate averages for single account view
    return {
      ...analyticsData,
      accounts: [account],
      recentActivity: filteredRecentActivity || [],
      totalReplies: account.repliesCount || 0,
      successRate: account.successRate || 94, // Fallback if not available
      overallAvgResponseTime: account.avgResponseTime || 0,
      engagementRate: account.engagementRate || 87, // Fallback if not available
    };
  }, [analyticsData, selectedAccount]);

  const filteredData = getFilteredData();

  const fetchAccounts = useCallback(async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cachedData = localStorage.getItem(ACCOUNTS_CACHE_KEY);
      const cacheDuration = 15 * 60 * 1000; // 15 minutes

      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < cacheDuration) {
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
            accountLimit: data[0]?.accountLimit || 1,
            replyLimit: data[0]?.replyLimit || 1,
            engagementRate: 87, // Mock data
            successRate: 94, // Mock data
            overallAvgResponseTime:
              data.length > 0
                ? data.reduce(
                    (sum: number, account: any) =>
                      sum + (account?.avgResponseTime || 0),
                    0
                  ) / data.length
                : 0,
            accounts: data,
            recentActivity: [], // Will be populated separately
          };

          return stats;
        }
      }

      // Fetch from API
      const accountsResponse = await fetch(
        `/api/insta/dashboard?userId=${userId}`
      );
      if (!accountsResponse.ok) throw new Error("Failed to fetch accounts");

      const {
        accounts: dbAccounts,
        totalReplies,
        accountLimit,
        replyLimit,
        totalAccounts,
      } = await accountsResponse.json();

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
                instaData.profile_picture_url ||
                dbAccount.profilePicture ||
                "/public/assets/img/default-img.jpg",
              followersCount:
                instaData.followers_count || dbAccount.followersCount || 0,
              postsCount: instaData.media_count || dbAccount.postsCount || 0,
              isActive: dbAccount.isActive || false,
              expiryDate: dbAccount.expiresAt || null,
              templatesCount: dbAccount.templatesCount || 0,
              repliesCount: dbAccount.repliesCount || 0,
              replyLimit: replyLimit || 500,
              accountLimit: accountLimit || 1,
              totalAccounts: totalAccounts || 0,
              lastActivity: dbAccount.lastActivity || new Date().toISOString(),
              engagementRate: dbAccount.engagementRate || 0,
              avgResponseTime: dbAccount?.avgResTime?.[0]?.avgResponseTime || 0,
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
        overallAvgResponseTime:
          validAccounts.length > 0
            ? validAccounts.reduce(
                (sum: number, account: any) =>
                  sum + (account?.avgResponseTime || 0),
                0
              ) / validAccounts.length
            : 0,
        accountLimit: validAccounts[0]?.accountLimit || 1,
        replyLimit: validAccounts[0]?.replyLimit || 1,
        accounts: validAccounts,
      };

      if (validAccounts && validAccounts.length > 0) {
        localStorage.setItem(
          ACCOUNTS_CACHE_KEY,
          JSON.stringify({
            data: validAccounts,
            timestamp: Date.now(),
          })
        );
      }

      return stats;
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load accounts"
      );
      return null;
    }
  }, [userId, router]);

  const fetchTemplates = useCallback(
    async (accountId?: string) => {
      try {
        let url = `/api/insta/templates?userId=${userId}`;
        if (accountId && accountId !== "all") {
          url += `&accountId=${accountId}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.length >= 0) {
            setTemplates(
              data.map((template: any) => ({
                ...template,
                lastUsed: template.lastUsed
                  ? new Date(template.lastUsed).toISOString()
                  : new Date().toISOString(),
                successRate: template.successRate || 0,
              }))
            );
          } else {
            setTemplates([]);
          }
        } else {
          setTemplates([]);
        }
      } catch (error) {
        setTemplates([]);
      }
    },
    [userId]
  );

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const accountsData = await fetchAccounts();
      if (!accountsData) {
        setIsLoading(false);
        return;
      }

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
        recentActivity: recentActivity?.replyLogs || [],
      };

      setAnalyticsData(updatedData);
      localStorage.setItem(
        ANALYTICS_CACHE_KEY,
        JSON.stringify({
          data: updatedData,
          timestamp: Date.now(),
        })
      );

      await fetchTemplates();
    } catch (error) {
      console.error("Error fetching analytics data:", error);

      // Try to use cached data if available
      const cachedAnalytics = localStorage.getItem(ANALYTICS_CACHE_KEY);
      if (cachedAnalytics) {
        const { data, timestamp } = JSON.parse(cachedAnalytics);
        const cacheDuration = 15 * 60 * 1000; // 15 minutes

        if (Date.now() - timestamp < cacheDuration) {
          setAnalyticsData(data);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchAccounts, fetchTemplates]);

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    fetchAnalyticsData();
  }, [userId, fetchAnalyticsData, router]);

  useEffect(() => {
    // Fetch templates for selected account when it changes
    if (selectedAccount !== "all" && analyticsData) {
      const account = analyticsData.accounts.find(
        (acc: any) => acc.username === selectedAccount
      );
      if (account) {
        fetchTemplates(account.id);
      }
    } else {
      fetchTemplates();
    }
  }, [selectedAccount, analyticsData, fetchTemplates]);

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

  const handleError = () => {
    setHasError(true);
  };

  const refresh = async () => {
    setIsLoading(true);
    localStorage.removeItem(ACCOUNTS_CACHE_KEY);
    localStorage.removeItem(ANALYTICS_CACHE_KEY);
    await fetchAnalyticsData();
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

  if (error) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center p-6 bg-red-900/20 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-4">Error Loading Accounts</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button onClick={fetchAccounts} className="btn-gradient-cyan">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
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
              {selectedAccount === "all"
                ? "Track performance across all accounts"
                : `Tracking performance for @${selectedAccount}`}
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={() => refresh()}
              variant="outline"
              className="border-white/20 p-2 bg-green-900 text-gray-300 hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-48 bg-[#0a0a0a]/60 border-white/20">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="card-hover group">
                <SelectItem value="all">All Accounts</SelectItem>
                {analyticsData?.accounts?.map((account: any) => (
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
                {filteredData?.totalReplies || 0} /{" "}
                {filteredData?.replyLimit || 1}
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
                {filteredData?.successRate || 0}%
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
                {filteredData?.overallAvgResponseTime
                  ? formatResponseTimeSmart(
                      filteredData?.overallAvgResponseTime
                    )
                  : "0s"}
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
                +{filteredData?.engagementRate || 0}%
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
                {selectedAccount === "all"
                  ? "Account Performance"
                  : "Account Details"}
              </CardTitle>
              <CardDescription className="text-gray-400 font-mono">
                {selectedAccount === "all"
                  ? "Compare performance across your Instagram accounts"
                  : `Performance details for @${selectedAccount}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 w-full p-2">
              {filteredData?.accounts?.map((account: any) => (
                <div
                  key={account.id}
                  className="flex flex-col w-full items-center justify-between p-4 gap-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-2 lg:space-x-4">
                    <Image
                      width={48}
                      height={48}
                      src={hasError ? defaultImg : account.profilePicture}
                      onError={handleError}
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
                  {new Date(account.expiryDate) <
                    new Date(Date.now() + 24 * 60 * 60 * 1000) &&
                    userId && (
                      <Button
                        onClick={() => refreshInstagramToken(userId)}
                        variant="outline"
                        size="sm"
                        className="border-white/20 p-2 bg-green-900 text-gray-300 hover:bg-white/10"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Token
                      </Button>
                    )}
                  <div className="flex items-center justify-between w-full">
                    <div className="text-sm font-medium text-white">
                      {account.engagementRate}% engagement
                    </div>
                    <div className="text-xs text-gray-400">
                      {account?.avgResponseTime
                        ? formatResponseTimeSmart(account.avgResponseTime)
                        : "0s"}{" "}
                      avg time
                    </div>
                  </div>
                </div>
              ))}
              {(!filteredData ||
                !filteredData?.accounts ||
                filteredData?.accounts.length === 0) && (
                <div className="text-center py-8">
                  <Instagram className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400 mb-4 font-mono">
                    No accounts connected yet
                  </p>
                  <Button className="btn-gradient-cyan" asChild>
                    <Link href="/insta/accounts/add">
                      <Plus className="mr-2 h-4 w-4" />
                      Connect Your First Account
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-hover group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-[#FF2E9F]" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-400 font-mono">
                {selectedAccount === "all"
                  ? "Latest auto-reply activities across all accounts"
                  : `Recent activities for @${selectedAccount}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-4 max-h-96 overflow-y-auto no-scrollbar">
                {filteredData?.recentActivity?.map((activity: any) => (
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
                {(!filteredData?.recentActivity ||
                  filteredData?.recentActivity.length === 0) && (
                  <p className="text-gray-400 text-center">
                    No recent activity available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {templates && <AnalyticsDashboard templates={templates} />}
      </div>
    </div>
  );
}
