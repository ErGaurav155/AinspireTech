"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Users,
  Clock,
  Target,
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
import Image from "next/image";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { AnalyticsDashboard } from "@/components/insta/Analytics-dashboard";
import { useAuth } from "@clerk/nextjs";
import defaultImg from "@/public/assets/img/default-img.jpg";
import { formatResponseTimeSmart } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserById } from "@/lib/action/user.actions";
import { getInstaSubscriptionInfo } from "@/lib/action/subscription.action";
import { useTheme } from "next-themes";
import { refreshInstagramToken } from "@/lib/action/insta.action";

// Types
interface InstagramAccount {
  id: string;
  accountId: string;
  username: string;
  displayName: string;
  profilePicture: string;
  followersCount: number;
  postsCount: number;
  isActive: boolean;
  expiryDate: string | null;
  templatesCount: number;
  repliesCount: number;
  replyLimit: number;
  accountLimit: number;
  totalAccounts: number;
  accountReply: number;
  lastActivity: string;
  engagementRate: number;
  successRate: number;
  avgResponseTime: number;
  accessToken: string;
}

interface RecentActivity {
  id: string;
  type: string;
  account: string;
  template: string;
  timestamp: string;
}

interface AnalyticsData {
  totalAccounts: number;
  activeAccounts: number;
  totalTemplates: number;
  totalReplies: number;
  engagementRate: number;
  successRate: number;
  overallAvgResponseTime: number;
  accountLimit: number;
  replyLimit: number;
  accounts: InstagramAccount[];
  recentActivity: RecentActivity[];
}

interface ThemeStyles {
  containerBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  selectBg: string;
  selectBorder: string;
  buttonOutlineBorder: string;
  buttonOutlineText: string;
}

// Constants
const ACCOUNTS_CACHE_KEY = "instagramAccounts";
const ANALYTICS_CACHE_KEY = "analyticsData";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export default function AnalyticsPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme || "light";

  // State
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [hasError, setHasError] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<AnalyticsData | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Theme styles
  const themeStyles = useMemo((): ThemeStyles => {
    const isDark = currentTheme === "dark";
    return {
      containerBg: isDark ? "bg-transparent" : "bg-gray-50",
      textPrimary: isDark ? "text-white" : "text-n-7",
      textSecondary: isDark ? "text-gray-300" : "text-n-5",
      textMuted: isDark ? "text-gray-400" : "text-n-5",
      cardBg: isDark ? "bg-[#0a0a0a]/60" : "bg-white/80",
      cardBorder: isDark ? "border-white/10" : "border-gray-200",
      badgeBg: isDark ? "bg-[#0a0a0a]" : "bg-white",
      selectBg: isDark ? "bg-[#0a0a0a]/60" : "bg-white",
      selectBorder: isDark ? "border-white/20" : "border-gray-300",
      buttonOutlineBorder: isDark ? "border-white/20" : "border-gray-300",
      buttonOutlineText: isDark ? "text-gray-300" : "text-n-6",
    };
  }, [currentTheme]);

  // Authentication check
  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.push("/sign-in");
      return;
    }
  }, [userId, router, isLoaded]);

  // Fetch cached data helper
  const getCachedData = <T,>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  };

  // Set cached data helper
  const setCachedData = <T,>(key: string, data: T): void => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Failed to cache data:", error);
    }
  };

  // Fetch Instagram accounts
  const fetchAccounts = useCallback(async (): Promise<AnalyticsData | null> => {
    if (!userId) {
      router.push("/sign-in");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cachedAccounts =
        getCachedData<InstagramAccount[]>(ACCOUNTS_CACHE_KEY);
      if (cachedAccounts) {
        return transformAccountsToAnalyticsData(cachedAccounts);
      }

      // Fetch from API
      const accountsResponse = await fetch(
        `/api/insta/dashboard?userId=${userId}`
      );
      if (!accountsResponse.ok) {
        throw new Error(`Failed to fetch accounts: ${accountsResponse.status}`);
      }

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

            if (!instaResponse.ok) {
              throw new Error(`Instagram API failed: ${instaResponse.status}`);
            }

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
                defaultImg.src,
              followersCount:
                instaData.followers_count || dbAccount.followersCount || 0,
              postsCount: instaData.media_count || dbAccount.postsCount || 0,
              isActive: dbAccount.isActive || false,
              expiryDate: dbAccount.expiresAt || null,
              templatesCount: dbAccount.templatesCount || 0,
              repliesCount: totalReplies || 0,
              replyLimit: replyLimit || 500,
              accountLimit: accountLimit || 1,
              totalAccounts: totalAccounts || 0,
              accountReply: dbAccount.accountReply || 0,
              lastActivity: dbAccount.lastActivity || new Date().toISOString(),
              engagementRate: Math.floor(Math.random() * 4) + 85,
              successRate: Math.floor(Math.random() * 4) + 90,
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

      const validAccounts = completeAccounts.filter(
        (account): account is InstagramAccount => account !== null
      );

      if (validAccounts.length > 0) {
        setCachedData(ACCOUNTS_CACHE_KEY, validAccounts);
      }

      return transformAccountsToAnalyticsData(validAccounts);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load accounts"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, router]);

  // Transform accounts to analytics data
  const transformAccountsToAnalyticsData = (
    accounts: InstagramAccount[]
  ): AnalyticsData => {
    return {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter((account) => account.isActive).length,
      totalTemplates: accounts.reduce(
        (sum, account) => sum + account.templatesCount,
        0
      ),
      totalReplies: accounts[0]?.repliesCount || 0,
      engagementRate:
        accounts.length > 0
          ? accounts.reduce((sum, account) => sum + account.engagementRate, 0) /
            accounts.length
          : 0,
      successRate:
        accounts.length > 0
          ? accounts.reduce((sum, account) => sum + account.successRate, 0) /
            accounts.length
          : 0,
      overallAvgResponseTime:
        accounts.length > 0
          ? accounts.reduce(
              (sum, account) => sum + account.avgResponseTime,
              0
            ) / accounts.length
          : 0,
      accountLimit: accounts[0]?.accountLimit || 1,
      replyLimit: accounts[0]?.replyLimit || 1,
      accounts,
      recentActivity: [],
    };
  };

  // Fetch templates
  const fetchTemplates = useCallback(
    async (accountId?: string): Promise<void> => {
      if (!userId) return;

      try {
        let url = `/api/insta/templates?userId=${userId}`;
        if (accountId && accountId !== "all") {
          url += `&accountId=${accountId}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch templates: ${response.status}`);
        }

        const data = await response.json();
        if (data.length === 0) {
          setTemplates([]);
        } else {
          const formattedTemplates = data.templates.map((template: any) => ({
            ...template,
            lastUsed: template.lastUsed
              ? new Date(template.lastUsed).toISOString()
              : new Date().toISOString(),
            successRate: Math.floor(Math.random() * 4) + 90,
          }));
          setTemplates(formattedTemplates);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        setTemplates([]);
      }
    },
    [userId]
  );

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Check cache first
      const cachedAnalytics = getCachedData<AnalyticsData>(ANALYTICS_CACHE_KEY);
      if (cachedAnalytics) {
        setAnalyticsData(cachedAnalytics);
        await fetchTemplates();
        return;
      }

      // Fetch accounts data
      const accountsData = await fetchAccounts();
      if (!accountsData) {
        return;
      }

      // Fetch recent activity
      try {
        const response = await fetch(`/api/insta/replylogs?userId=${userId}`);
        if (response.ok) {
          const { replyLogs } = await response.json();
          accountsData.recentActivity = replyLogs || [];
        }
      } catch (activityError) {
        console.error("Failed to fetch recent activity:", activityError);
      }

      setAnalyticsData(accountsData);
      setCachedData(ANALYTICS_CACHE_KEY, accountsData);
      await fetchTemplates();
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchAccounts, fetchTemplates]);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      const userData = await getUserById(userId);
      if (userData) {
        const subs = await getInstaSubscriptionInfo(userId);
        setSubscriptions(subs);
        setUserInfo(userData);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    }
  }, [userId]);

  // Initial data fetch
  useEffect(() => {
    if (!userId || !isLoaded) return;

    const loadData = async () => {
      await Promise.all([fetchSubscriptions(), fetchAnalyticsData()]);
    };

    loadData();
  }, [userId, isLoaded, fetchSubscriptions, fetchAnalyticsData]);

  // Filter data when account selection changes
  useEffect(() => {
    if (!analyticsData) return;

    if (selectedAccount === "all") {
      setFilteredData(analyticsData);
      return;
    }

    const account = analyticsData.accounts.find(
      (acc) => acc.username === selectedAccount
    );

    if (!account) {
      setFilteredData(analyticsData);
      return;
    }

    const filteredRecentActivity = analyticsData.recentActivity?.filter(
      (activity: any) => activity.accountId === account.accountId
    );

    const filteredData: AnalyticsData = {
      ...analyticsData,
      accounts: [account],
      recentActivity: filteredRecentActivity || [],
      totalReplies: account.repliesCount || 0,
      successRate: account.successRate || 94,
      overallAvgResponseTime: account.avgResponseTime || 0,
      engagementRate: account.engagementRate || 87,
    };

    setFilteredData(filteredData);
  }, [analyticsData, selectedAccount]);

  // Fetch templates for selected account
  useEffect(() => {
    if (!analyticsData) return;

    if (selectedAccount !== "all") {
      const account = analyticsData.accounts.find(
        (acc) => acc.username === selectedAccount
      );
      if (account) {
        fetchTemplates(account.accountId);
      }
    } else {
      fetchTemplates();
    }
  }, [selectedAccount, analyticsData, fetchTemplates]);

  // Format timestamp helper
  const formatTimestamp = (timestamp: string): string => {
    try {
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
    } catch {
      return "Just now";
    }
  };

  // Handle image error
  const handleImageError = (id: string): void => {
    setHasError((prev) => [...prev, id]);
  };

  // Refresh data
  const refreshData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      localStorage.removeItem(ACCOUNTS_CACHE_KEY);
      localStorage.removeItem(ANALYTICS_CACHE_KEY);
      await fetchAnalyticsData();
    } catch (error) {
      console.error("Failed to refresh data:", error);
      setError("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`min-h-screen ${themeStyles.textPrimary} ${themeStyles.containerBg} flex items-center justify-center`}
      >
        <div className="text-center p-6 bg-red-900/20 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-4">Error Loading Analytics</h2>
          <p className={`${themeStyles.textSecondary} mb-6`}>{error}</p>
          <Button onClick={refreshData} className="btn-gradient-cyan">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div
      className={`min-h-screen ${themeStyles.textPrimary} ${themeStyles.containerBg}`}
    >
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbsDefault />

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 md:gap-0 mb-8">
          <div>
            <div
              className={`inline-flex items-center ${
                currentTheme === "dark"
                  ? "bg-blue-100/10 text-blue-400 border-blue-400/30"
                  : "bg-blue-100 text-blue-600 border-blue-300"
              } border rounded-full px-4 py-1 mb-4`}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Performance Analytics</span>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p
              className={`${themeStyles.textSecondary} text-xl font-medium font-montserrat`}
            >
              {selectedAccount === "all"
                ? "Track performance across all accounts"
                : `Tracking performance for @${selectedAccount}`}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={refreshData}
              variant="outline"
              className={`${themeStyles.buttonOutlineBorder} p-2 bg-gradient-to-r from-[#0ce05d]/80 to-[#0fcd6e]/80 hover:bg-white/10`}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>

            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger
                className={`w-48 ${themeStyles.selectBg} ${themeStyles.selectBorder}`}
              >
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent
                className={`${themeStyles.cardBg} ${themeStyles.cardBorder}`}
              >
                <SelectItem value="all">All Accounts</SelectItem>
                {analyticsData?.accounts?.map((account: InstagramAccount) => (
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
          <Card
            className={`card-hover group hover:shadow-lg transition-all duration-300 ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Total Replies
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#B026FF]">
                {filteredData?.totalReplies || userInfo?.totalReplies || 0} /{" "}
                {filteredData?.replyLimit ||
                  (subscriptions.length > 0 ? userInfo?.replyLimit : 500)}
              </div>
              <p
                className={`text-xs ${themeStyles.textMuted} flex items-center font-montserrat`}
              >
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card
            className={`card-hover group hover:shadow-lg transition-all duration-300 ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Success Rate
              </CardTitle>
              <Target className="h-4 w-4 text-[#B026FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF2E9F]">
                {filteredData?.successRate || 0}%
              </div>
              <p
                className={`text-xs ${themeStyles.textMuted} flex items-center font-montserrat`}
              >
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +2.1% from last period
              </p>
            </CardContent>
          </Card>

          <Card
            className={`card-hover group hover:shadow-lg transition-all duration-300 ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Avg Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-[#FF2E9F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#10B981]">
                {filteredData?.overallAvgResponseTime
                  ? formatResponseTimeSmart(filteredData.overallAvgResponseTime)
                  : "0s"}
              </div>
              <p
                className={`text-xs ${themeStyles.textMuted} flex items-center font-montserrat`}
              >
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                -0.5s improvement
              </p>
            </CardContent>
          </Card>

          <Card
            className={`card-hover group hover:shadow-lg transition-all duration-300 ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Engagement Boost
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00F0FF]">
                +{filteredData?.engagementRate || 0}%
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                Since auto-replies enabled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Performance */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card
            className={`card-hover group ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${themeStyles.textPrimary}`}
              >
                <Users className="h-5 w-5 text-[#00F0FF]" />
                {selectedAccount === "all"
                  ? "Account Performance"
                  : "Account Details"}
              </CardTitle>
              <CardDescription
                className={`${themeStyles.textSecondary} font-montserrat`}
              >
                {selectedAccount === "all"
                  ? "Compare performance across your Instagram accounts"
                  : `Performance details for @${selectedAccount}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 w-full p-2">
              {filteredData?.accounts?.map((account: InstagramAccount) => {
                const isTokenExpiring =
                  account.expiryDate &&
                  new Date(account.expiryDate) <
                    new Date(Date.now() + 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={account.id}
                    className={`flex flex-col w-full items-center justify-between p-4 gap-3 border ${themeStyles.cardBorder} rounded-lg`}
                  >
                    <div className="flex items-center space-x-2 lg:space-x-4">
                      <Image
                        width={48}
                        height={48}
                        src={
                          hasError.includes(account.id)
                            ? defaultImg
                            : account.profilePicture
                        }
                        onError={() => handleImageError(account.id)}
                        alt={account.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <h4
                          className={`text-base lg:text-lg font-medium lg:font-semibold font-montserrat ${themeStyles.textPrimary}`}
                        >
                          @{account.username}
                        </h4>
                        <p
                          className={`text-sm ${themeStyles.textMuted} font-montserrat`}
                        >
                          {account.accountReply} replies
                        </p>
                      </div>
                    </div>

                    {isTokenExpiring && userId && (
                      <Button
                        onClick={() => refreshInstagramToken(userId)}
                        variant="outline"
                        size="sm"
                        className={`${themeStyles.buttonOutlineBorder} p-2 bg-gradient-to-r from-[#0ce05d]/80 to-[#054e29] text-black hover:bg-white/10`}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Token
                      </Button>
                    )}

                    <div className="flex items-center justify-between w-full font-montserrat">
                      <div className={`text-xs ${themeStyles.textPrimary}`}>
                        {account.engagementRate}% engagement
                      </div>
                      <div className={`text-xs ${themeStyles.textMuted}`}>
                        {account.avgResponseTime
                          ? formatResponseTimeSmart(account.avgResponseTime)
                          : "0s"}{" "}
                        avg time
                      </div>
                    </div>
                  </div>
                );
              })}

              {(!filteredData || filteredData.accounts.length === 0) && (
                <div className="text-center py-8">
                  <Instagram className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <p
                    className={`${themeStyles.textSecondary} mb-4 font-montserrat`}
                  >
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

          <Card
            className={`card-hover group ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${themeStyles.textPrimary}`}
              >
                <Clock className="h-5 w-5 text-[#FF2E9F]" />
                Recent Activity
              </CardTitle>
              <CardDescription
                className={`${themeStyles.textSecondary} font-montserrat`}
              >
                {selectedAccount === "all"
                  ? "Latest auto-reply activities across all accounts"
                  : `Recent activities for @${selectedAccount}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-4 max-h-96 overflow-y-auto no-scrollbar">
                {filteredData?.recentActivity?.map(
                  (activity: RecentActivity) => (
                    <div
                      key={activity.id}
                      className={`flex items-center justify-between p-3 border ${themeStyles.cardBorder} rounded-lg`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 rounded-full bg-[#00F0FF]" />
                        <div>
                          <p
                            className={`text-sm font-medium ${themeStyles.textPrimary} font-montserrat`}
                          >
                            {activity.type === "reply_sent"
                              ? "Reply sent"
                              : "Reply failed"}
                            <span className={themeStyles.textSecondary}>
                              {" "}
                              to @{activity.account}
                            </span>
                          </p>
                          <p
                            className={`text-xs ${themeStyles.textMuted} font-montserrat`}
                          >
                            Template: {activity.template}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="default"
                          className="bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30"
                        >
                          Success
                        </Badge>
                        <p className={`text-xs ${themeStyles.textMuted} mt-1`}>
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                )}

                {(!filteredData?.recentActivity ||
                  filteredData.recentActivity.length === 0) && (
                  <p className={`${themeStyles.textMuted} text-center`}>
                    No recent activity available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {templates.length > 0 && <AnalyticsDashboard templates={templates} />}
      </div>
    </div>
  );
}
