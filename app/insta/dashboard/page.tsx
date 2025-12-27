"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import defaultImg from "@/public/assets/img/default-img.jpg";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import Image from "next/image";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { useAuth } from "@clerk/nextjs";
import { getUserById } from "@/lib/action/user.actions";
import {
  cancelRazorPaySubscription,
  getInstaSubscriptionInfo,
} from "@/lib/action/subscription.action";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { formatResponseTimeSmart } from "@/lib/utils";
import { AccountSelectionDialog } from "@/components/insta/AccountSelectionDialog";
import {
  getInstaAccounts,
  deleteInstaAccount,
  refreshInstagramToken,
} from "@/lib/action/insta.action";
import { useTheme } from "next-themes";

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

interface DashboardData {
  totalAccounts: number;
  activeAccounts: number;
  totalTemplates: number;
  totalReplies: number;
  accountLimit: number;
  replyLimit: number;
  engagementRate: number;
  successRate: number;
  overallAvgResponseTime: number;
  accounts: InstagramAccount[];
  recentActivity?: any[];
}

interface ThemeStyles {
  containerBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  alertBg: string;
  buttonOutlineBorder: string;
  buttonOutlineText: string;
}

interface RecentActivity {
  id: string;
  message: string;
  timestamp: string;
}

// Constants
const ACCOUNTS_CACHE_KEY = "instagramAccounts";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const FREE_PLAN_ACCOUNT_LIMIT = 1;
const CANCELLATION_REASON_PLACEHOLDER = "User requested cancellation";

export default function Dashboard() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme || "light";

  // State
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState<string[]>([]);
  const [userAccounts, setUserAccounts] = useState<InstagramAccount[]>([]);

  // Dialog states
  const [showAccountLimitDialog, setShowAccountLimitDialog] =
    useState<boolean>(false);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] =
    useState<boolean>(false);
  const [showCancelAccountDialog, setShowCancelAccountDialog] =
    useState<boolean>(false);

  // Cancellation states
  const [selectedSubscriptionId, setSelectedSubscriptionId] =
    useState<string>("");
  const [cancellationMode, setCancellationMode] = useState<
    "Immediate" | "End-of-term"
  >("End-of-term");
  const [cancellationReason, setCancellationReason] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [isProcessingCancellation, setIsProcessingCancellation] =
    useState<boolean>(false);

  // Theme-based styles
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
      alertBg: isDark ? "bg-[#6d1717]/5" : "bg-red-50/80",
      buttonOutlineBorder: isDark ? "border-white/20" : "border-gray-300",
      buttonOutlineText: isDark ? "text-gray-300" : "text-n-5",
    };
  }, [currentTheme]);

  // Helper: Get cached data
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

  // Helper: Set cached data
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

  // Helper: Show toast notifications
  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  // Helper: Format timestamp
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

  // Helper: Handle image error
  const handleImageError = (id: string): void => {
    setHasError((prev) => [...prev, id]);
  };

  // Fetch Instagram accounts with caching
  const fetchAccounts = useCallback(async (): Promise<DashboardData | null> => {
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
        const dashboardStats = transformAccountsToDashboardData(cachedAccounts);
        setUserAccounts(cachedAccounts);
        return dashboardStats;
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
              accountReply: dbAccount.callsMade || 0,
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
        setUserAccounts(validAccounts);
      }

      return transformAccountsToDashboardData(validAccounts);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load accounts"
      );
      showToast("Failed to load accounts", "error");
      return null;
    }
  }, [userId, router]);

  // Transform accounts to dashboard data
  const transformAccountsToDashboardData = (
    accounts: InstagramAccount[]
  ): DashboardData => {
    return {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter((account) => account.isActive).length,
      totalTemplates: accounts.reduce(
        (sum, account) => sum + account.templatesCount,
        0
      ),
      totalReplies: accounts[0]?.repliesCount || 0,
      accountLimit: accounts[0]?.accountLimit || 1,
      replyLimit: accounts[0]?.replyLimit || 1,
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
      accounts,
    };
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const accountsData = await fetchAccounts();

      if (!accountsData) {
        setDashboardData(null);
        return;
      }

      // Fetch recent activity
      try {
        const response = await fetch(`/api/insta/replylogs?userId=${userId}`);
        if (response.ok) {
          const { replyLogs } = await response.json();
          accountsData.recentActivity = replyLogs || [];
        } else {
          console.warn("Failed to fetch recent activity");
          accountsData.recentActivity = [];
        }
      } catch (activityError) {
        console.error("Error fetching recent activity:", activityError);
        accountsData.recentActivity = [];
      }

      setDashboardData(accountsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
      showToast("Failed to load dashboard data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchAccounts]);

  // Fetch user subscriptions
  const fetchSubscriptions = useCallback(async () => {
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
      showToast("Failed to load subscription information", "error");
    }
  }, [userId]);

  // Initialize dashboard
  useEffect(() => {
    if (!isLoaded) return;

    const initializeDashboard = async () => {
      await Promise.all([fetchSubscriptions(), fetchDashboardData()]);
    };

    initializeDashboard();
  }, [userId, isLoaded, fetchSubscriptions, fetchDashboardData]);

  // Handle cancellation initiation
  const handleCancelInitiation = () => {
    if (subscriptions.length > 0) {
      setSelectedSubscriptionId(subscriptions[0].subscriptionId);
      setShowCancelConfirmDialog(true);
    }
  };

  // Handle confirmed cancellation
  const handleConfirmedCancellation = async () => {
    setShowCancelConfirmDialog(false);

    // Check if we need to delete accounts (free plan only allows 1 account)
    if (userAccounts.length > FREE_PLAN_ACCOUNT_LIMIT) {
      setShowCancelAccountDialog(true);
    } else {
      setShowCancelDialog(true);
    }
  };

  // Handle account deletion for cancellation
  const handleCancelAccountDeletion = async (selectedAccountIds: string[]) => {
    setIsProcessingCancellation(true);
    setShowCancelAccountDialog(false);

    try {
      // Delete selected accounts
      for (const accountId of selectedAccountIds) {
        const result = await deleteInstaAccount(accountId, userId!);
        if (!result.success) {
          showToast(`Failed to delete account: ${result.error}`, "error");
          setIsProcessingCancellation(false);
          return;
        }
      }

      showToast("Accounts deleted successfully", "success");

      // Update user accounts list
      const updatedAccounts = userAccounts.filter(
        (account) => !selectedAccountIds.includes(account.id)
      );
      setUserAccounts(updatedAccounts);

      // Update dashboard data
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          accounts: updatedAccounts,
          totalAccounts: updatedAccounts.length,
          activeAccounts: updatedAccounts.filter((account) => account.isActive)
            .length,
        });
      }

      // Clear cache
      localStorage.removeItem(ACCOUNTS_CACHE_KEY);

      // Show cancellation options
      setShowCancelDialog(true);
    } catch (error) {
      console.error("Error deleting accounts:", error);
      showToast("Failed to delete accounts", "error");
      setIsProcessingCancellation(false);
    }
  };

  // Process the actual cancellation
  const handleCancelSubscription = async () => {
    if (!selectedSubscriptionId) {
      showToast("No subscription selected", "error");
      return;
    }

    setIsCancelling(true);
    try {
      // Mock cancellation - replace with actual API call
      console.log("Cancelling subscription:", selectedSubscriptionId);

      const cancelResult = await cancelRazorPaySubscription(
        selectedSubscriptionId,
        cancellationReason || CANCELLATION_REASON_PLACEHOLDER,
        cancellationMode
      );

      if (!cancelResult.success) {
        showToast("Failed to cancel subscription", "error");
        return;
      }

      // await setSubsciptionCanceled(
      //   selectedSubscriptionId,
      //   cancellationReason || CANCELLATION_REASON_PLACEHOLDER
      // );

      showToast("Subscription cancelled successfully", "success");
      setSubscriptions([]);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      showToast("Failed to cancel subscription", "error");
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
      setCancellationReason("");
    }
  };

  // Handle refresh
  const refresh = async () => {
    setIsLoading(true);
    localStorage.removeItem(ACCOUNTS_CACHE_KEY);
    await fetchDashboardData();
  };

  // Handle add account click
  const handleAddAccountClick = () => {
    const accountLimit = dashboardData?.accountLimit || 1;
    const currentAccounts = dashboardData?.totalAccounts || 0;

    if (currentAccounts >= accountLimit) {
      setShowAccountLimitDialog(true);
    } else {
      router.push("/insta/accounts/add");
    }
  };

  // Loading state
  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center h-full w-full">
        <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Render account card
  const renderAccountCard = (account: InstagramAccount) => {
    const isTokenExpiring =
      account.expiryDate &&
      new Date(account.expiryDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);

    return (
      <div
        key={account.id}
        className={`flex flex-wrap gap-3 md:gap-0 items-center justify-between p-2 md:p-4 border ${themeStyles.cardBorder} rounded-lg hover:bg-white/5 transition-colors`}
      >
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative">
            <Image
              width={48}
              height={48}
              src={
                hasError.includes(account.id)
                  ? defaultImg.src
                  : account.profilePicture
              }
              alt={account.displayName}
              onError={() => handleImageError(account.id)}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div
              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 ${
                account.isActive ? "bg-[#00F0FF]" : "bg-gray-400"
              }`}
            />
          </div>
          <div>
            <h3
              className={`font-semibold text-sm md:text-base ${themeStyles.textPrimary}`}
            >
              @{account.username}
            </h3>
            <p className={`text-sm ${themeStyles.textSecondary}`}>
              {account.followersCount.toLocaleString()} followers
            </p>
          </div>
          <Badge
            variant={account.isActive ? "default" : "secondary"}
            className={
              account.isActive
                ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30"
                : `${
                    currentTheme === "dark"
                      ? "bg-gray-800 text-gray-400"
                      : "bg-gray-200 text-gray-600"
                  }`
            }
          >
            {account.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
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

          <Button
            variant="outline"
            size="sm"
            className={`${themeStyles.buttonOutlineBorder} ${themeStyles.buttonOutlineText} bg-[#B026FF]/70 hover:bg-[#B026FF]/15 transition-colors`}
            asChild
          >
            <Link href={`/insta/accounts/${account.id}`}>
              <Settings className="h-4 w-4" /> Manage
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  // Render recent activity
  const renderRecentActivity = () => {
    if (!dashboardData?.recentActivity?.length) {
      return <p className={themeStyles.textMuted}>No recent activity</p>;
    }

    return dashboardData.recentActivity
      .slice(0, 3)
      .map((activity: RecentActivity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between text-sm"
        >
          <span
            className={`${themeStyles.textSecondary} font-montserrat text-lg`}
          >
            {activity.message}
          </span>
          <span className={themeStyles.textMuted}>
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>
      ));
  };

  return (
    <div
      className={`min-h-screen ${themeStyles.textPrimary} ${themeStyles.containerBg}`}
    >
      <BreadcrumbsDefault />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 lg:gap-0 mb-8">
          <div>
            <h1
              className={`text-3xl lg:text-5xl font-bold mb-2 ${themeStyles.textPrimary}`}
            >
              Dashboard
            </h1>
            <p
              className={`${themeStyles.textSecondary} text-lg font-montserrat`}
            >
              Manage your Instagram auto-reply system and monitor performance
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              onClick={refresh}
              variant="outline"
              className={`${themeStyles.buttonOutlineBorder} p-2 bg-gradient-to-r from-[#0ce05d]/80 to-[#09ab5a]/80 hover:bg-white/10`}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            {subscriptions.length === 0 && (
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity"
                asChild
              >
                <Link href="/insta/pricing">
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade Subscription
                </Link>
              </Button>
            )}

            <Button
              onClick={handleAddAccountClick}
              className="btn-gradient-cyan hover:opacity-90 transition-opacity"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>
        </div>

        {/* Active Subscription */}
        {subscriptions.length > 0 && (
          <Card
            className={`bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 mb-8 ${themeStyles.cardBg}`}
          >
            <CardHeader className="text-center">
              <Badge className="max-w-min mx-auto bg-green-900/20 text-green-700 border-green-400/20">
                Active
              </Badge>
              <CardTitle
                className={`flex text-start md:items-center justify-center gap-2 ${themeStyles.textPrimary}`}
              >
                <Zap className="h-5 w-5 text-yellow-400" />
                Your Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row justify-center items-center gap-4">
              <div className="flex  flex-wrap text-start md:items-center justify-center gap-4">
                <h3 className={`text-xl font-bold ${themeStyles.textPrimary}`}>
                  {subscriptions[0].chatbotType}
                </h3>
                <p className={themeStyles.textSecondary}>
                  Next billing:{" "}
                  {new Date(subscriptions[0].expiresAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  variant="destructive"
                  onClick={handleCancelInitiation}
                  disabled={isCancelling || isProcessingCancellation}
                >
                  {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                </Button>

                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity"
                  asChild
                >
                  <Link href="/insta/pricing">
                    <Zap className="mr-2 h-4 w-4" />
                    Upgrade Subscription
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className={`card-hover group ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Active Accounts
              </CardTitle>
              <Instagram className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00F0FF]">
                {dashboardData?.activeAccounts || 0} /{" "}
                {dashboardData?.accountLimit || 1}
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                {(dashboardData?.totalAccounts || 0) -
                  (dashboardData?.activeAccounts || 0)}{" "}
                inactive
              </p>
            </CardContent>
          </Card>

          <Card
            className={`card-hover group ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Reply Templates
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-[#B026FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#B026FF]">
                {dashboardData?.totalTemplates || 0}
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                Across all accounts
              </p>
            </CardContent>
          </Card>

          <Card
            className={`card-hover group ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Total Replies
              </CardTitle>
              <Zap className="h-4 w-4 text-[#FF2E9F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF2E9F]">
                {dashboardData?.totalReplies || 0} /{" "}
                {dashboardData?.replyLimit || 500}
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                +23% from last month
              </p>
            </CardContent>
          </Card>

          <Card
            className={`card-hover group ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Engagement Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00F0FF]">
                {dashboardData?.engagementRate || 0}%
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                +5% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Management */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card
            className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${themeStyles.textPrimary}`}
              >
                <Users className="h-5 w-5 text-[#00F0FF]" />
                Instagram Accounts
              </CardTitle>
              <CardDescription
                className={`${themeStyles.textSecondary} font-montserrat text-lg`}
              >
                Manage your connected Instagram accounts and their auto-reply
                settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-2">
              {dashboardData?.accounts?.map(renderAccountCard)}

              {(!dashboardData?.accounts ||
                dashboardData.accounts.length === 0) && (
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
            className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${themeStyles.textPrimary}`}
              >
                <BarChart3 className="h-5 w-5 text-[#B026FF]" />
                Performance Overview
              </CardTitle>
              <CardDescription
                className={`${themeStyles.textSecondary} text-lg font-montserrat`}
              >
                Monitor your auto-reply performance and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-2">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-sm font-medium ${themeStyles.textSecondary}`}
                  >
                    Reply Success Rate
                  </span>
                  <span className={`text-sm ${themeStyles.textMuted}`}>
                    {dashboardData?.successRate || 0}%
                  </span>
                </div>
                <Progress
                  value={dashboardData?.successRate || 0}
                  className="h-2 bg-white/10"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-sm font-medium ${themeStyles.textSecondary}`}
                  >
                    Template Usage
                  </span>
                  <span className={`text-sm ${themeStyles.textMuted}`}>
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
                  <span
                    className={`text-sm font-medium ${themeStyles.textSecondary}`}
                  >
                    Response Time
                  </span>
                  <span className={`text-sm ${themeStyles.textMuted}`}>
                    {dashboardData?.overallAvgResponseTime
                      ? formatResponseTimeSmart(
                          dashboardData.overallAvgResponseTime
                        )
                      : "0s"}
                  </span>
                </div>
                <Progress value={85} className="h-2 bg-white/10" />
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className={`font-semibold mb-3 ${themeStyles.textPrimary}`}>
                  Recent Activity
                </h4>
                <div className="space-y-2">{renderRecentActivity()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card
          className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
        >
          <CardHeader>
            <CardTitle className={themeStyles.textPrimary}>
              Quick Actions
            </CardTitle>
            <CardDescription
              className={`${themeStyles.textSecondary} font-mono`}
            >
              Common tasks and shortcuts to manage your Instagram automation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className={`h-auto p-6 flex flex-col items-center gap-3 bg-[#00F0FF]/10 border-[#00F0FF]/20 hover:bg-[#00F0FF]/15 hover:border-[#00F0FF]/40 transition-all ${themeStyles.textPrimary}`}
                asChild
              >
                <Link href="/insta/templates">
                  <MessageSquare className="h-8 w-8 text-[#00F0FF]" />
                  <span className="font-medium">Manage Templates</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className={`h-auto p-6 flex flex-col items-center gap-3 border-[#B026FF]/20 bg-[#B026FF]/10 hover:bg-[#B026FF]/15 hover:border-[#B026FF]/40 transition-all ${themeStyles.textPrimary}`}
                asChild
              >
                <Link href="/insta/analytics">
                  <BarChart3 className="h-8 w-8 text-[#B026FF]" />
                  <span className="font-medium">View Analytics</span>
                </Link>
              </Button>

              <Button
                onClick={handleAddAccountClick}
                variant="outline"
                className={`h-auto p-6 flex flex-col items-center gap-3 border-[#FF2E9F]/20 bg-[#FF2E9F]/10 hover:bg-[#FF2E9F]/15 hover:border-[#FF2E9F]/40 transition-all ${themeStyles.textPrimary}`}
              >
                <Plus className="h-8 w-8 text-[#FF2E9F]" />
                <span className="font-medium">Add Account</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Limit Dialog */}
      <AlertDialog
        open={showAccountLimitDialog}
        onOpenChange={setShowAccountLimitDialog}
      >
        <AlertDialogContent
          className={`${themeStyles.alertBg} backdrop-blur-md`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className={themeStyles.textPrimary}>
              Account Limit Reached
            </AlertDialogTitle>
            <AlertDialogDescription className={themeStyles.textSecondary}>
              To add more accounts, you need to upgrade your subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={themeStyles.buttonOutlineBorder}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={() => router.push("/insta/pricing")}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Upgrade Now
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Subscription Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`p-3 md:p-8 rounded-xl max-w-md w-full ${
              currentTheme === "dark" ? "bg-[#0a0a0a]/90" : "bg-white/90"
            } backdrop-blur-lg border ${themeStyles.cardBorder}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF2E9F] to-[#B026FF]">
                Cancel Subscription
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCancelDialog(false)}
                disabled={isCancelling}
              >
                <X
                  className={`${themeStyles.textMuted} h-5 w-5 hover:${themeStyles.textPrimary}`}
                />
              </Button>
            </div>
            <div className="space-y-6">
              <div>
                <label
                  className={`block text-lg font-semibold ${themeStyles.textSecondary} mb-2`}
                >
                  Please Provide Reason
                </label>
                <Textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className={`w-full ${
                    currentTheme === "dark" ? "bg-gray-800/50" : "bg-gray-100"
                  } border ${themeStyles.cardBorder} rounded-lg p-3 ${
                    themeStyles.textPrimary
                  } focus:outline-none focus:ring-2 focus:ring-[#B026FF] font-montserrat`}
                  placeholder="Cancellation reason"
                  required
                  disabled={isCancelling}
                />
              </div>

              <div
                className={`text-xs ${themeStyles.textMuted} font-montserrat`}
              >
                <p className="mb-2">
                  <strong>Immediate Cancellation:</strong> Service ends
                  immediately
                </p>
                <p>
                  <strong>End-of-term Cancellation:</strong> Service continues
                  until the end of billing period
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
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

      {/* Confirm Cancellation Dialog */}
      <AlertDialog
        open={showCancelConfirmDialog}
        onOpenChange={setShowCancelConfirmDialog}
      >
        <AlertDialogContent
          className={`${themeStyles.alertBg} backdrop-blur-md`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className={themeStyles.textPrimary}>
              Confirm Cancellation
            </AlertDialogTitle>
            <AlertDialogDescription className={themeStyles.textSecondary}>
              Are you sure you want to cancel your subscription? Your plan will
              revert to the Free plan which only allows 1 Instagram account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={themeStyles.buttonOutlineBorder}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedCancellation}
              disabled={isCancelling}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Yes, Cancel Subscription"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Account Selection Dialog for Cancellation */}
      <AccountSelectionDialog
        isOpen={showCancelAccountDialog}
        onClose={() => setShowCancelAccountDialog(false)}
        onConfirm={handleCancelAccountDeletion}
        accounts={userAccounts}
        newPlan={{
          id: "Insta-Automation-Free",
          name: "Free",
          description: "",
          monthlyPrice: 0,
          yearlyPrice: 0,
          account: 1,
          limit: 500,
          features: [],
          popular: false,
        }}
        isLoading={isProcessingCancellation}
      />
    </div>
  );
}
