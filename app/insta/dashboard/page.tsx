"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Instagram,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Zap,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import Image from "next/image";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { useAuth } from "@clerk/nextjs";
import { getUserById } from "@/lib/action/user.actions";
import {
  cancelRazorPaySubscription,
  getSubscriptionInfo,
} from "@/lib/action/subscription.action";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import defaultImg from "@/public/assets/img/default-img.jpg";
import { formatResponseTimeSmart, refreshInstagramToken } from "@/lib/utils";
export default function Dashboard() {
  const { userId } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState("");
  const [cancellationMode, setCancellationMode] = useState<
    "Immediate" | "End-of-term"
  >("End-of-term");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [dashboardData, setDashboardData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const ACCOUNTS_CACHE_KEY = "instagramAccounts";

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
            overallAvgResponseTime: data.reduce(
              (sum: number, account: any) =>
                sum + (account?.avgResponseTime || 0),
              0
            ),
            accounts: data,
            recentActivity: [], // No recent activity in cache
          };
          if (stats) {
            setDashboardData(stats);
          }
          return stats;
        }
      }

      // Fetch from API
      const accountsResponse = await fetch(
        `/api/insta/dashboard?userId=${userId}`
      );
      if (!accountsResponse.ok) {
        throw new Error("Failed to fetch accounts");
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
              repliesCount: totalReplies || 0,
              replyLimit: replyLimit || 500,
              accountLimit: accountLimit || 1,
              totalAccounts: totalAccounts || 0,
              lastActivity: dbAccount.lastActivity || new Date().toISOString(),
              engagementRate: dbAccount.engagementRate || 0,
              avgResponseTime: dbAccount.avgResTime[0].avgResponseTime || 0,
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
        accountLimit: validAccounts[0]?.accountLimit || 1,
        replyLimit: validAccounts[0]?.replyLimit || 1,
        engagementRate: 87, // Mock data
        successRate: 94, // Mock data
        overallAvgResponseTime: validAccounts?.reduce(
          (sum: number, account: any) => sum + (account?.avgResponseTime || 0),
          0
        ),
        accounts: validAccounts,
      };
      if (validAccounts && validAccounts?.length > 0) {
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
    }
  }, [userId, router]);

  const fetchDashboardData = useCallback(async () => {
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
      setDashboardData(updatedData);
    } catch (error) {
      console.error("Using dummy data - API error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchAccounts]);

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
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!userId) return;

      try {
        const user = await getUserById(userId);
        if (user) {
          const subs = await getSubscriptionInfo(user._id);
          setSubscriptions(subs);
        }
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      }
    };

    fetchSubscriptions();
    fetchDashboardData();
  }, [userId, fetchDashboardData]);

  const handleCancelSubscription = async () => {
    if (!selectedSubscriptionId) return;

    setIsCancelling(true);
    try {
      const response = await fetch("/api/insta/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: selectedSubscriptionId,
          reason: cancellationReason,
          mode: cancellationMode,
        }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success("Subscription cancelled successfully!", {
          description: result.message,
          duration: 3000,
        });
        setSubscriptions(
          subscriptions.filter(
            (sub) => sub.subscriptionId !== selectedSubscriptionId
          )
        );
      } else {
        toast.error("Subscription cancellation failed!", {
          description: result.message,
          duration: 3000,
        });
      }
    } catch (error: any) {
      toast.error("Error cancelling subscription", {
        description: error.message || "An unknown error occurred",
        duration: 3000,
      });
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
      setCancellationReason("");
    }
  };
  const handleError = () => {
    setHasError(true);
  };
  const refresh = async () => {
    await localStorage.removeItem(ACCOUNTS_CACHE_KEY);
    await fetchDashboardData();
  };
  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen text-white">
      <BreadcrumbsDefault />{" "}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex  flex-wrap justify-between items-center gap-3 lg:gap-0 mb-8">
          <div>
            <h1 className=" text-3xl lg:text-5xl font-bold mb-2 gradient-text-main">
              Dashboard
            </h1>
            <p className="text-gray-300 text-lg font-mono">
              Manage your Instagram auto-reply system and monitor performance
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              onClick={() => refresh()}
              variant="outline"
              className="border-white/20 p-2 bg-green-900 text-gray-300 hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {subscriptions.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => {
                  setSelectedSubscriptionId(subscriptions[0].subscriptionId);
                  setShowCancelDialog(true);
                }}
              >
                Cancel Subscription
              </Button>
            )}
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity"
              asChild
            >
              <Link href="/insta/pricing">
                <Zap className="mr-2 h-4 w-4" />
                Upgrade Subscription
              </Link>
            </Button>
            <Button
              className="btn-gradient-cyan hover:opacity-90 transition-opacity"
              asChild
            >
              <Link href="/insta/accounts/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Link>
            </Button>
          </div>
        </div>
        {subscriptions.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                Your Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Premium Plan - Active
                </h3>
                <p className="text-gray-300">
                  Next billing: {new Date().toLocaleDateString()}
                </p>
              </div>
              <Badge className="bg-green-900/20 text-green-400 border-green-400/20">
                Active
              </Badge>
            </CardContent>
          </Card>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Active Accounts
              </CardTitle>
              <Instagram className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardData?.activeAccounts || 0} /{" "}
                {dashboardData?.accountLimit || 1}
              </div>
              {dashboardData?.totalAccounts ? (
                <p className="text-xs text-gray-400">
                  {dashboardData?.totalAccounts - dashboardData?.activeAccounts}{" "}
                  inactive
                </p>
              ) : (
                <p className="text-xs text-gray-400">0 inactive</p>
              )}
            </CardContent>
          </Card>

          <Card className="card-hover group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Reply Templates
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-[#B026FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardData.totalTemplates || 0}
              </div>
              <p className="text-xs text-gray-400">Across all accounts</p>
            </CardContent>
          </Card>

          <Card className="card-hover group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Replies
              </CardTitle>
              <Zap className="h-4 w-4 text-[#FF2E9F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardData?.repliesCount || 0} /{" "}
                {dashboardData?.replyLimit || 1}
              </div>
              <p className="text-xs text-gray-400">+23% from last month</p>
            </CardContent>
          </Card>

          <Card className="card-hover group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Engagement Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardData.engagementRate || 0}%
              </div>
              <p className="text-xs text-gray-400">+5% from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Management */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-[#00F0FF]" />
                Instagram Accounts
              </CardTitle>
              <CardDescription className="text-gray-400 font-mono">
                Manage your connected Instagram accounts and their auto-reply
                settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-2">
              {dashboardData?.accounts &&
                dashboardData?.accounts?.map((account: any) => (
                  <div
                    key={account?.id}
                    className="flex flex-wrap gap-3 md:gap-0 items-center justify-between p-2 md:p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-2 md:space-x-4">
                      <div className="relative">
                        <Image
                          width={48}
                          height={48}
                          src={hasError ? defaultImg : account?.profilePicture}
                          alt={account?.displayName}
                          onError={handleError}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#0a0a0a] ${
                            account?.isActive ? "bg-[#00F0FF]" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm md:text-base text-white">
                          @{account?.username || "Unknown"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {account?.followersCount || 0} followers
                        </p>
                      </div>
                      <Badge
                        variant={account?.isActive ? "default" : "secondary"}
                        className={
                          account?.isActive
                            ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30"
                            : ""
                        }
                      >
                        {account?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {new Date(account?.expiryDate) <
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

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-gray-300 hover:bg-white/10"
                        asChild
                      >
                        <Link href={`/insta/accounts/${account?.id}`}>
                          <Settings className="h-4 w-4" /> Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}

              {dashboardData?.accounts?.length === 0 && (
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

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-[#B026FF]" />
                Performance Overview
              </CardTitle>
              <CardDescription className="text-gray-400 font-mono">
                Monitor your auto-reply performance and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-2">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Reply Success Rate
                  </span>
                  <span className="text-sm text-gray-400">
                    {dashboardData.successRate || 0}%
                  </span>
                </div>
                <Progress
                  value={dashboardData.successRate || 0}
                  className="h-2 bg-white/10"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Template Usage
                  </span>
                  <span className="text-sm text-gray-400">
                    {dashboardData?.totalReplies || 0}%
                  </span>
                </div>
                <Progress
                  value={dashboardData?.totalReplies || 0}
                  className="h-2 bg-white/10"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Response Time
                  </span>
                  <span className="text-sm text-gray-400">
                    {dashboardData?.overallAvgResponseTime
                      ? formatResponseTimeSmart(
                          dashboardData.overallAvgResponseTime
                        )
                      : 0}{" "}
                  </span>
                </div>
                <Progress value={85} className="h-2 bg-white/10" />
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="font-semibold mb-3 text-white">
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  {dashboardData?.recentActivity?.length > 0 ? (
                    dashboardData?.recentActivity
                      ?.slice(0, 3)
                      .map((activity: any) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-300">
                            {activity.message}
                          </span>
                          <span className="text-gray-500">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-400">No recent activity</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400 font-mono">
              Common tasks and shortcuts to manage your Instagram automation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-3 bg-[#00F0FF]/10 border-[#00F0FF]/20 hover:bg-[#00F0FF]/15 hover:border-[#00F0FF]/40 transition-all"
                asChild
              >
                <Link href="/insta/templates">
                  <MessageSquare className="h-8 w-8 text-[#00F0FF]" />
                  <span className="text-white font-medium">
                    Manage Templates
                  </span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-3 border-[#B026FF]/20 bg-[#B026FF]/10  hover:bg-[#B026FF]/15 hover:border-[#B026FF]/40 transition-all"
                asChild
              >
                <Link href="/insta/analytics">
                  <BarChart3 className="h-8 w-8 text-[#B026FF]" />
                  <span className="text-white font-medium">View Analytics</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-3 border-[#FF2E9F]/20 bg-[#FF2E9F]/10 hover:bg-[#FF2E9F]/15 hover:border-[#FF2E9F]/40 transition-all"
                asChild
              >
                <Link href="/insta/accounts/add">
                  <Plus className="h-8 w-8 text-[#FF2E9F]" />
                  <span className="text-white font-medium">Add Account</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="p-8 rounded-xl max-w-md w-full bg-[#0a0a0a]/90 backdrop-blur-lg border border-[#333] ">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF2E9F] to-[#B026FF]">
                  Cancel Subscription
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCancelDialog(false)}
                >
                  <X className="text-gray-400 h-5 w-5 hover:text-white" />
                </Button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-200 mb-2">
                    Please Provide Reason
                  </label>
                  <Textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#B026FF]"
                    placeholder="Cancellation reason"
                    required
                  />
                </div>

                <div className="text-sm text-gray-400">
                  <p className="mb-2">
                    <strong>Immediate Cancellation:</strong> Service ends
                    immediately
                  </p>
                  <p>
                    <strong>End-of-term Cancellation:</strong> Service continues
                    until the end of billing period
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setCancellationMode("Immediate");
                      handleCancelSubscription();
                    }}
                    disabled={isCancelling}
                    className="px-6 py-2"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Immediately"}
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF]"
                    onClick={() => {
                      setCancellationMode("End-of-term");
                      handleCancelSubscription();
                    }}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Cancel at End of Term"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
