"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Instagram,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Zap,
  X,
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

// Mock data for demonstration
const mockAccounts = [
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
  },
];

export default function Dashboard() {
  const [accounts, setAccounts] = useState(mockAccounts);
  const { userId } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState("");
  const [cancellationMode, setCancellationMode] = useState<
    "Immediate" | "End-of-term"
  >("End-of-term");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const totalReplies = accounts.reduce(
    (sum, account) => sum + account.repliesCount,
    0
  );
  const totalTemplates = accounts.reduce(
    (sum, account) => sum + account.templatesCount,
    0
  );
  const activeAccounts = accounts.filter((account) => account.isActive).length;

  // Fetch user subscriptions
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
  }, [userId]);

  const handleCancelSubscription = async () => {
    if (!selectedSubscriptionId) return;

    setIsCancelling(true);
    try {
      const result = await cancelRazorPaySubscription(
        selectedSubscriptionId,
        cancellationReason,
        cancellationMode
      );

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

  return (
    <div className="min-h-screen text-white">
      <BreadcrumbsDefault />

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
          <div className="flex flex-wrap gap-2">
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
                {activeAccounts}
              </div>
              <p className="text-xs text-gray-400">
                {accounts.length - activeAccounts} inactive
              </p>
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
                {totalTemplates}
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
                {totalReplies}
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
              <div className="text-2xl font-bold text-white">87%</div>
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
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-wrap gap-3 md:gap-0 items-center justify-between p-2 md:p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="relative">
                      <Image
                        src={account.profilePicture}
                        alt={account.displayName}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#0a0a0a] ${
                          account.isActive ? "bg-[#00F0FF]" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm md:text-base text-white">
                        @{account.username}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {account.followersCount.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={account.isActive ? "default" : "secondary"}
                      className={
                        account.isActive
                          ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30"
                          : ""
                      }
                    >
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                      asChild
                    >
                      <Link href={`/insta/accounts/${account.id}`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}

              {accounts.length === 0 && (
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
                  <span className="text-sm text-gray-400">94%</span>
                </div>
                <Progress value={94} className="h-2 bg-white/10" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Template Usage
                  </span>
                  <span className="text-sm text-gray-400">78%</span>
                </div>
                <Progress value={78} className="h-2 bg-white/10" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Response Time
                  </span>
                  <span className="text-sm text-gray-400">2.3s avg</span>
                </div>
                <Progress value={85} className="h-2 bg-white/10" />
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="font-semibold mb-3 text-white">
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">
                      Auto-reply sent to @user123
                    </span>
                    <span className="text-gray-500">2m ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">
                      Template Welcome triggered
                    </span>
                    <span className="text-gray-500">5m ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">New comment detected</span>
                    <span className="text-gray-500">8m ago</span>
                  </div>
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
                className="h-auto p-6 flex flex-col items-center gap-3 border-[#00F0FF]/20 hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/40 transition-all"
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
                className="h-auto p-6 flex flex-col items-center gap-3 border-[#B026FF]/20 hover:bg-[#B026FF]/10 hover:border-[#B026FF]/40 transition-all"
                asChild
              >
                <Link href="/insta/analytics">
                  <BarChart3 className="h-8 w-8 text-[#B026FF]" />
                  <span className="text-white font-medium">View Analytics</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-3 border-[#FF2E9F]/20 hover:bg-[#FF2E9F]/10 hover:border-[#FF2E9F]/40 transition-all"
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
