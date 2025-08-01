"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Instagram,
  Settings,
  Users,
  BarChart3,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Cache key
const ACCOUNTS_CACHE_KEY = "instagramAccounts";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  const router = useRouter();

  // Fetch accounts with caching
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
          setAccounts(data);
          setIsLoading(false);
          return;
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
            return {
              id: dbAccount._id,
              accountId: dbAccount.instagramId,
              username: dbAccount.username,
              displayName: dbAccount.displayName || "No Name",
              profilePicture:
                dbAccount.profilePicture ||
                "/public/assets/img/default-img.jpg",
              followersCount: dbAccount.followersCount || 0,
              postsCount: dbAccount.postsCount || 0,
              isActive: dbAccount.isActive || false,
              templatesCount: dbAccount.templatesCount || 0,
              repliesCount: dbAccount.repliesCount || 0,
              lastActivity: dbAccount.lastActivity || new Date().toISOString(),
              engagementRate: dbAccount.engagementRate || 0,
              avgResponseTime: dbAccount.avgResponseTime || "0s",
              accessToken: dbAccount.accessToken,
            };
          }
        })
      );
      setAccounts(completeAccounts);
      localStorage.setItem(
        ACCOUNTS_CACHE_KEY,
        JSON.stringify({
          data: completeAccounts,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load accounts"
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }
    fetchAccounts();
  }, [userId, router, fetchAccounts]);

  const handleToggleAccount = async (accountId: string) => {
    const account = accounts.find((acc: any) => acc.id === accountId);
    if (!account) return;

    const newActiveState = !account.isActive;

    // Optimistic UI update
    setAccounts((prev: any) =>
      prev.map((acc: any) =>
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
        setAccounts((prev: any) =>
          prev.map((acc: any) =>
            acc.id === accountId ? { ...acc, isActive: !newActiveState } : acc
          )
        );
        throw new Error("Failed to update account status");
      }

      // Update cache
      const cachedData = localStorage.getItem(ACCOUNTS_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const updatedData = data.map((acc: any) =>
          acc.id === accountId ? { ...acc, isActive: newActiveState } : acc
        );
        localStorage.setItem(
          ACCOUNTS_CACHE_KEY,
          JSON.stringify({
            data: updatedData,
            timestamp,
          })
        );
      }
    } catch (error) {
      console.error("Error updating account:", error);
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

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

  const displayedAccounts = accounts.length > 0 ? accounts : null;
  const activeAccounts = displayedAccounts.filter(
    (a: any) => a.isActive
  ).length;
  const totalFollowers = displayedAccounts.reduce(
    (sum: number, acc: any) => sum + acc.followersCount,
    0
  );
  const totalReplies = displayedAccounts.reduce(
    (sum: number, acc: any) => sum + acc.repliesCount,
    0
  );
  const avgEngagement =
    displayedAccounts.length > 0
      ? (
          displayedAccounts.reduce(
            (sum: number, acc: any) => sum + acc.engagementRate,
            0
          ) / displayedAccounts.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen text-white">
      <BreadcrumbsDefault />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 md:gap-0 justify-between items-center mb-8">
          <div>
            <div className="inline-flex items-center bg-blue-100/10 text-blue-400 border border-blue-400/30 rounded-full px-4 py-1 mb-4">
              <Instagram className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Account Management</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 gradient-text-main">
              Instagram Accounts
            </h1>
            <p className="text-gray-300 text-lg font-mono">
              Manage all your connected Instagram accounts and their auto-reply
              settings
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchAccounts}
              variant="outline"
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Accounts
              </CardTitle>
              <Instagram className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {displayedAccounts.length || 0}
              </div>
              <p className="text-xs text-gray-400">
                {activeAccounts || 0} active
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Followers
              </CardTitle>
              <Users className="h-4 w-4 text-[#B026FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalFollowers.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-400">Across all accounts</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Auto Replies
              </CardTitle>
              <Zap className="h-4 w-4 text-[#FF2E9F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalReplies || 0}
              </div>
              <p className="text-xs text-gray-400">Total sent</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Avg Engagement
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {avgEngagement || 0}%
              </div>
              <p className="text-xs text-gray-400">Engagement rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Grid */}
        <div className="grid gap-6">
          {displayedAccounts &&
            displayedAccounts.map((account: any) => (
              <Card
                key={account.id}
                className={`card-hover transition-all duration-300 ${
                  account.isActive
                    ? "border-[#00F0FF]/30 bg-gradient-to-r from-[#00F0FF]/5 to-transparent"
                    : "border-white/10"
                }`}
              >
                <CardContent className="pt-6 p-2 md:p-4">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Image
                          src={account.profilePicture}
                          alt={account.displayName}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[#0a0a0a] ${
                            account.isActive ? "bg-[#00F0FF]" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          @{account.username}
                        </h3>
                        <p className="text-gray-400">{account.displayName}</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-sm text-gray-400">
                            {account.followersCount.toLocaleString()} followers
                          </span>
                          <span className="text-sm text-gray-400">
                            {account.postsCount} posts
                          </span>
                          <span className="text-sm text-gray-400">
                            {account.engagementRate}% engagement
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="font-bold">
                            {account.templatesCount}
                          </span>
                          <span className="text-xs text-gray-400">
                            Templates
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="font-bold">
                            {account.repliesCount}
                          </span>
                          <span className="text-xs text-gray-400">Replies</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="font-bold">
                            {formatLastActivity(account.lastActivity)}
                          </span>
                          <span className="text-xs text-gray-400">Active</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Label className="text-sm text-gray-300 mr-2">
                            Auto-replies
                          </Label>
                          <Switch
                            checked={account.isActive}
                            onCheckedChange={() =>
                              handleToggleAccount(account.id)
                            }
                            className="data-[state=checked]:bg-[#00F0FF]"
                          />
                        </div>
                        <Badge
                          variant={account.isActive ? "default" : "secondary"}
                          className={
                            account.isActive
                              ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30"
                              : "bg-gray-800 text-gray-400"
                          }
                        >
                          {account.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-gray-300 p-2 hover:bg-white/10"
                          asChild
                        >
                          <Link href={`/insta/accounts/${account.id}`}>
                            <Settings className="h-4 w-4 mr-1" /> Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

          {displayedAccounts?.length === 0 && (
            <Card className="card-hover">
              <CardContent className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Instagram className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  No accounts connected
                </h3>
                <p className="text-gray-400 mb-4 font-mono">
                  Connect your first Instagram account to start automating
                  replies
                </p>
                <Button className="btn-gradient-cyan" asChild>
                  <Link href="/insta/accounts/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Connect Account
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
