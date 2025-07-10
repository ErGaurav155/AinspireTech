"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Instagram,
  Settings,
  Power,
  PowerOff,
  Users,
  BarChart3,
  Zap,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";

// Dummy data fallback
const dummyAccounts = [
  {
    id: "1",
    username: "fashionista_jane",
    displayName: "Jane Fashion",
    profilePicture:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    followersCount: 15420,
    postsCount: 892,
    isActive: true,
    templatesCount: 5,
    repliesCount: 234,
    lastActivity: new Date().toISOString(),
    engagementRate: 4.2,
    avgResponseTime: "2.3s",
  },
  {
    id: "2",
    username: "tech_guru_mike",
    displayName: "Mike Tech",
    profilePicture:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    followersCount: 8930,
    postsCount: 456,
    isActive: false,
    templatesCount: 3,
    repliesCount: 89,
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    engagementRate: 3.8,
    avgResponseTime: "1.9s",
  },
  {
    id: "3",
    username: "food_lover_sarah",
    displayName: "Sarah Foodie",
    profilePicture:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    followersCount: 23150,
    postsCount: 1203,
    isActive: true,
    templatesCount: 8,
    repliesCount: 456,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    engagementRate: 5.1,
    avgResponseTime: "1.2s",
  },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState(dummyAccounts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/insta/accounts");
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setAccounts(data);
        } else {
          console.log("No accounts found, using dummy data");
          setAccounts(dummyAccounts);
        }
      } else {
        console.log("API not available, using dummy data");
        setAccounts(dummyAccounts);
      }
    } catch (error) {
      console.log("API error, using dummy data:", error);
      setAccounts(dummyAccounts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAccount = async (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (!account) return;

    const newActiveState = !account.isActive;

    // Optimistically update UI
    setAccounts(
      accounts.map((acc) =>
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
        setAccounts(
          accounts.map((acc) =>
            acc.id === accountId ? { ...acc, isActive: !newActiveState } : acc
          )
        );
        console.error("Failed to update account status");
      }
    } catch (error) {
      // Revert on error
      setAccounts(
        accounts.map((acc) =>
          acc.id === accountId ? { ...acc, isActive: !newActiveState } : acc
        )
      );
      console.error("Error updating account:", error);
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
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
          <p className="text-gray-300">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <BreadcrumbsDefault />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap gap-3 md:gap-0 justify-between items-center mb-8">
          <div>
            <div className="inline-flex items-center bg-blue-100/10 text-blue-400 border border-blue-400/30 rounded-full px-4 py-1 mb-4">
              <Instagram className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Account Management</span>
            </div>
            <h1 className=" text-3xl md:text-4xl lg:text-5xl font-bold mb-2 gradient-text-main">
              Instagram Accounts
            </h1>
            <p className="text-gray-300 text-lg font-mono">
              Manage all your connected Instagram accounts and their auto-reply
              settings
            </p>
          </div>
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
                {accounts.length}
              </div>
              <p className="text-xs text-gray-400">
                {accounts.filter((a) => a.isActive).length} active
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
                {accounts
                  .reduce((sum, acc) => sum + acc.followersCount, 0)
                  .toLocaleString()}
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
                {accounts.reduce((sum, acc) => sum + acc.repliesCount, 0)}
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
                {accounts.length > 0
                  ? (
                      accounts.reduce(
                        (sum, acc) => sum + acc.engagementRate,
                        0
                      ) / accounts.length
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-xs text-gray-400">Engagement rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Grid */}
        <div className="grid gap-6">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className={`card-hover  transition-all duration-300 ${
                account.isActive
                  ? "border-[#00F0FF]/30 bg-gradient-to-r from-[#00F0FF]/5 to-transparent"
                  : "border-white/10"
              }`}
            >
              <CardContent className="pt-6 p-2 md:p-4">
                <div className="flex flex-col md:flex-row gap-5 md:gap-0 w-full  items-center justify-between">
                  <div className="flex  flex-col  gap-2 md:gap-0 items-center space-x-4">
                    <div className="flex items-center justify-between w-full">
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
                      <div className="flex flex-col items-center justify-between w-full">
                        <h3 className="text-lg md:text-xl font-bold text-white">
                          @{account.username}
                        </h3>
                        <p className="text-gray-400">{account.displayName}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex  items-center gap-4 mt-1">
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
                  <div className="flex flex-col lg:flex-row items-center gap-3 md:gap-0 md:space-x-4">
                    <div className=" flex items-start justify-center gap-3 w-full">
                      <div className="text-xs font-light text-white">
                        {account.templatesCount}
                        <span className="inline-block">templates</span>
                      </div>
                      <div className="text-xs font-light text-white">
                        {account.repliesCount}{" "}
                        <span className="inline-block">replies sent</span>
                      </div>
                      <div className="text-xs font-light text-white">
                        {formatLastActivity(account.lastActivity)}
                        <span className="inline-block ">:Last active </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full ">
                      <div className="flex flex-row items-center justify-between w-full ">
                        <Label
                          htmlFor={`toggle-${account.id}`}
                          className="text-sm text-gray-300"
                        >
                          Auto-replies
                        </Label>
                        <Switch
                          id={`toggle-${account.id}`}
                          checked={account.isActive}
                          onCheckedChange={() =>
                            handleToggleAccount(account.id)
                          }
                          className="data-[state=checked]:bg-[#00F0FF]"
                        />
                      </div>
                      <div className="flex items-center justify-between w-full">
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
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {accounts.length === 0 && (
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
                  <Link href="/accounts/add">
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
