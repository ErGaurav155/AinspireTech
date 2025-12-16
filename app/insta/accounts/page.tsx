"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Instagram,
  Settings,
  Users,
  BarChart3,
  Zap,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import defaultImg from "@/public/assets/img/default-img.jpg";
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

// Constants
const ACCOUNTS_CACHE_KEY = "instagramAccounts";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const FREE_PLAN_REPLY_LIMIT = 500;
const FREE_PLAN_ACCOUNT_LIMIT = 1;

export default function AccountsPage() {
  // Hooks
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme || "light";

  // State
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState<string[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showAccountLimitDialog, setShowAccountLimitDialog] =
    useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState<string | null>(
    null
  );

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

  // Helper: Format last activity
  const formatLastActivity = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch {
      return "N/A";
    }
  };

  // Helper: Handle image error
  const handleImageError = (id: string): void => {
    setHasError((prev) => [...prev, id]);
  };

  // Fetch Instagram accounts with caching
  const fetchAccounts = useCallback(async (): Promise<void> => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cachedAccounts =
        getCachedData<InstagramAccount[]>(ACCOUNTS_CACHE_KEY);
      if (cachedAccounts) {
        setAccounts(cachedAccounts);
        return;
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
        setAccounts([]);
        return;
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
              replyLimit: replyLimit || FREE_PLAN_REPLY_LIMIT,
              accountLimit: accountLimit || FREE_PLAN_ACCOUNT_LIMIT,
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

      setAccounts(validAccounts);

      if (validAccounts.length > 0) {
        setCachedData(ACCOUNTS_CACHE_KEY, validAccounts);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load accounts"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, router]);

  // Fetch user subscriptions
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

  // Initialize component
  useEffect(() => {
    if (!isLoaded) return;

    const initializeData = async () => {
      await Promise.all([fetchSubscriptions(), fetchAccounts()]);
    };

    initializeData();
  }, [userId, isLoaded, fetchSubscriptions, fetchAccounts]);

  // Handle toggle account status
  const handleToggleAccount = async (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (!account) return;

    const newActiveState = !account.isActive;
    setIsUpdatingAccount(accountId);

    // Optimistic UI update
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, isActive: newActiveState } : acc
      )
    );

    try {
      const response = await fetch(`/api/insta/accounts/${accountId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newActiveState }),
      });

      if (!response.ok) {
        // Revert on error
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === accountId ? { ...acc, isActive: !newActiveState } : acc
          )
        );
        throw new Error("Failed to update account status");
      }

      // Update cache
      const cachedAccounts =
        getCachedData<InstagramAccount[]>(ACCOUNTS_CACHE_KEY);
      if (cachedAccounts) {
        const updatedCache = cachedAccounts.map((acc) =>
          acc.id === accountId ? { ...acc, isActive: newActiveState } : acc
        );
        setCachedData(ACCOUNTS_CACHE_KEY, updatedCache);
      }
    } catch (error) {
      console.error("Error updating account:", error);
      // Show error toast or notification here
    } finally {
      setIsUpdatingAccount(null);
    }
  };

  // Handle add account click
  const handleAddAccountClick = () => {
    const accountLimit = accounts[0]?.accountLimit || FREE_PLAN_ACCOUNT_LIMIT;

    if (accounts.length >= accountLimit) {
      setShowAccountLimitDialog(true);
    } else {
      router.push("/insta/accounts/add");
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    localStorage.removeItem(ACCOUNTS_CACHE_KEY);
    await fetchAccounts();
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const activeAccounts = accounts.filter(
      (account) => account.isActive
    ).length;
    const totalFollowers = accounts.reduce(
      (sum, acc) => sum + acc.followersCount,
      0
    );
    const totalReplies = accounts[0]?.repliesCount || 0;
    const avgEngagement =
      accounts.length > 0
        ? (
            accounts.reduce((sum, acc) => sum + acc.engagementRate, 0) /
            accounts.length
          ).toFixed(1)
        : "0";

    return {
      activeAccounts,
      totalFollowers,
      totalReplies,
      avgEngagement,
    };
  }, [accounts]);

  // Get account limits
  const accountLimit = accounts[0]?.accountLimit || FREE_PLAN_ACCOUNT_LIMIT;
  const replyLimit =
    subscriptions.length > 0 ? userInfo?.replyLimit : FREE_PLAN_REPLY_LIMIT;

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center h-full w-full">
        <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`min-h-screen ${themeStyles.textPrimary} flex items-center justify-center ${themeStyles.containerBg}`}
      >
        <Card
          className={`max-w-md ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
        >
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Accounts</h2>
            <p className={`mb-6 ${themeStyles.textSecondary}`}>{error}</p>
            <Button onClick={fetchAccounts} className="btn-gradient-cyan">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${themeStyles.textPrimary} ${themeStyles.containerBg}`}
    >
      <BreadcrumbsDefault />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap gap-3 md:gap-0 justify-between items-center mb-8">
          <div>
            <div
              className={`inline-flex items-center ${
                currentTheme === "dark"
                  ? "bg-blue-100/10 text-blue-400 border-blue-400/30"
                  : "bg-blue-100 text-blue-600 border-blue-300"
              } border rounded-full px-4 py-1 mb-4`}
            >
              <Instagram className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Account Management</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] bg-clip-text text-transparent">
              Instagram Accounts
            </h1>
            <p
              className={`${themeStyles.textSecondary} font-montserrat text-xl`}
            >
              Manage all your connected Instagram accounts and their auto-reply
              settings
            </p>
          </div>
          <div className="flex gap-3 mt-1 md:mt-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing}
              className={`${themeStyles.buttonOutlineBorder} p-2 bg-gradient-to-r from-[#0ce05d]/80 to-[#05a957]/80 hover:bg-white/10`}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              className="btn-gradient-cyan hover:opacity-90 transition-opacity"
              onClick={handleAddAccountClick}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card
            className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Total Accounts
              </CardTitle>
              <Instagram className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00F0FF]">
                {accounts.length} / {accountLimit}
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                {stats.activeAccounts} active
              </p>
            </CardContent>
          </Card>

          <Card
            className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Total Followers
              </CardTitle>
              <Users className="h-4 w-4 text-[#B026FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#B026FF]">
                {stats.totalFollowers.toLocaleString()}
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                Across all accounts
              </p>
            </CardContent>
          </Card>

          <Card
            className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Auto Replies
              </CardTitle>
              <Zap className="h-4 w-4 text-[#FF2E9F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF2E9F]">
                {stats.totalReplies} / {replyLimit}
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                Total sent
              </p>
            </CardContent>
          </Card>

          <Card
            className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Avg Engagement
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00F0FF]">
                {stats.avgEngagement}%
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                Engagement rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Grid */}
        <div className="grid gap-6">
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                theme={currentTheme}
                themeStyles={themeStyles}
                isUpdating={isUpdatingAccount === account.id}
                hasError={hasError.includes(account.id)}
                onToggleAccount={handleToggleAccount}
                onImageError={handleImageError}
                userId={userId}
              />
            ))
          ) : (
            <EmptyAccountsCard
              themeStyles={themeStyles}
              currentTheme={currentTheme}
            />
          )}
        </div>
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
              You have reached the maximum number of accounts for your current
              plan. To add more accounts, please upgrade your subscription.
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
    </div>
  );
}

// Account Card Component
interface AccountCardProps {
  account: InstagramAccount;
  theme: string;
  themeStyles: ThemeStyles;
  isUpdating: boolean;
  hasError: boolean;
  onToggleAccount: (accountId: string) => void;
  onImageError: (accountId: string) => void;
  userId: string | null;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  theme,
  themeStyles,
  isUpdating,
  hasError,
  onToggleAccount,
  onImageError,
  userId,
}) => {
  const isTokenExpiring =
    account.expiryDate &&
    new Date(account.expiryDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <Card
      className={`card-hover transition-all duration-300 ${
        themeStyles.cardBg
      } ${themeStyles.cardBorder} ${
        account.isActive
          ? "border-[#00F0FF]/30 bg-gradient-to-r from-[#00F0FF]/5 to-transparent"
          : ""
      }`}
    >
      <CardContent className="pt-6 p-2 md:p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Image
                src={hasError ? defaultImg.src : account.profilePicture}
                alt={account.displayName}
                onError={() => onImageError(account.id)}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div
                className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 ${
                  account.isActive ? "bg-[#00F0FF]" : "bg-gray-400"
                }`}
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold ${themeStyles.textPrimary}`}>
                  @{account.username}
                </h3>
                <Badge
                  variant={account.isActive ? "default" : "secondary"}
                  className={
                    account.isActive
                      ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30"
                      : `${
                          theme === "dark"
                            ? "bg-gray-800 text-gray-400"
                            : "bg-gray-200 text-gray-600"
                        }`
                  }
                >
                  {account.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className={themeStyles.textMuted}>{account.displayName}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                <span className={`text-sm ${themeStyles.textMuted}`}>
                  {account.followersCount.toLocaleString()} followers
                </span>
                <span className={`text-sm ${themeStyles.textMuted}`}>
                  {account.postsCount} posts
                </span>
                <span className={`text-sm ${themeStyles.textMuted}`}>
                  {account.engagementRate}% engagement
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <span className={`font-bold ${themeStyles.textPrimary}`}>
                  {account.templatesCount}
                </span>
                <span className={`text-xs ${themeStyles.textMuted}`}>
                  Templates
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className={`font-bold ${themeStyles.textPrimary}`}>
                  {account.accountReply}
                </span>
                <span className={`text-xs ${themeStyles.textMuted}`}>
                  Replies
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className={`font-bold ${themeStyles.textPrimary}`}>
                  {formatLastActivity(account.lastActivity)}
                </span>
                <span className={`text-xs ${themeStyles.textMuted}`}>
                  Active
                </span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-3 w-full">
              <div className="flex items-center justify-center gap-2">
                <Label className={`text-sm ${themeStyles.textSecondary} mr-2`}>
                  Auto-replies
                </Label>
                <Switch
                  checked={account.isActive}
                  onCheckedChange={() => onToggleAccount(account.id)}
                  disabled={isUpdating}
                  className="data-[state=checked]:bg-[#00F0FF]"
                />
              </div>

              <div className="flex items-center justify-center gap-2">
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
                  className={`${themeStyles.buttonOutlineBorder} ${themeStyles.buttonOutlineText} p-2 bg-[#B026FF]/10 hover:bg-[#B026FF]/15 transition-colors`}
                  asChild
                >
                  <Link href={`/insta/accounts/${account.id}`}>
                    <Settings className="h-4 w-4 mr-1" /> Manage
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Empty Accounts Card Component
interface EmptyAccountsCardProps {
  themeStyles: ThemeStyles;
  currentTheme: string;
}

const EmptyAccountsCard: React.FC<EmptyAccountsCardProps> = ({
  themeStyles,
  currentTheme,
}) => (
  <Card
    className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
  >
    <CardContent className="text-center py-12">
      <div
        className={`mx-auto w-24 h-24 ${
          currentTheme === "dark" ? "bg-white/5" : "bg-gray-100"
        } rounded-full flex items-center justify-center mb-4`}
      >
        <Instagram className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${themeStyles.textPrimary}`}>
        No accounts connected
      </h3>
      <p className={`${themeStyles.textMuted} mb-4 font-mono`}>
        Connect your first Instagram account to start automating replies
      </p>
      <Button className="btn-gradient-cyan" asChild>
        <Link href="/insta/accounts/add">
          <Plus className="mr-2 h-4 w-4" />
          Connect Account
        </Link>
      </Button>
    </CardContent>
  </Card>
);

// Helper function: Format last activity
const formatLastActivity = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  } catch {
    return "N/A";
  }
};
