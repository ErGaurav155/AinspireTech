"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  Users,
  MessageSquare,
  BarChart3,
  Zap,
  FolderSync as Sync,
  X,
  RefreshCw,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import defaultImg from "@/public/assets/img/default-img.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  isCacheValid,
  InstagramAccount,
  formatResponseTimeSmart,
  refreshInstagramToken,
} from "@/lib/utils";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import TemplateForm from "@/components/insta/TemplateForm";
import TemplateCard from "@/components/insta/TemplateCard";
import Image from "next/image";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { useRouter } from "next/navigation";

import { Progress } from "@/components/ui/progress";
import { useAuth } from "@clerk/nextjs";
import { toast } from "@/components/ui/use-toast";
const ACCOUNTS_CACHE_KEY = "instagramAccounts";

export default function AccountPage({ params }: { params: { id: string } }) {
  const [templates, setTemplates] = useState<any>([]);
  const [analyticsData, setAnalyticsData] = useState<any>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [account, setAccount] = useState<any>([]);
  const [imgSrc, setImgSrc] = useState(account.profilePicture);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isStale, setIsStale] = useState(false);
  const { userId } = useAuth();
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: [""],
    triggers: [""],
    priority: 5,
    category: "",
    accountUsername: account.username || "",
  });
  const handleToggleTemplate = async (templateId: string) => {
    const template = templates.find((t: any) => t._id === templateId);
    if (!template) return;

    const newActiveState = !template.isActive;

    // Optimistically update UI
    setTemplates(
      templates.map((t: any) =>
        t._id === templateId ? { ...t, isActive: newActiveState } : t
      )
    );
    try {
      const response = await fetch(`/api/insta/templates/${templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...template,
          isActive: newActiveState,
        }),
      });

      if (!response.ok) {
        // Revert on error
        setTemplates(
          templates.map((t: any) =>
            t._id === templateId ? { ...t, isActive: !newActiveState } : t
          )
        );
        console.error("Failed to update template status");
      }
    } catch (error) {
      // Revert on error
      setTemplates(
        templates.map((t: any) =>
          t._id === templateId ? { ...t, isActive: !newActiveState } : t
        )
      );
      console.error("Error updating template:", error);
    }
  };
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/insta/templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTemplates(
          templates.filter((template: any) => template._id !== templateId)
        );
      } else {
        console.error("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      // For demo purposes, still remove from UI
      setTemplates(
        templates.filter((template: any) => template._id !== templateId)
      );
    }
  };
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // In a real app, you would call your API endpoint here
      const response = await fetch(`/api/insta/accounts/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast({
        title: "Account deleted successfully!",
        duration: 3000,
        className: "success-toast",
      });
      router.push("/insta/dashboard");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Account deletion Failed!",
        duration: 3000,
        className: "error-toast",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  const fetchTemplates = useCallback(
    async (accountId: string) => {
      try {
        // For now, we'll use a mock account ID since we don't have account selection
        const response = await fetch(
          `/api/insta/templates?userId=${userId}&accountId=${accountId}`
        );
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
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const fetchAccounts = useCallback(
    async (accountId: string) => {
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
          if (Date.now() - timestamp < cacheDuration && data) {
            const cachedAccount =
              data.find(
                (account: InstagramAccount) => account.id === accountId
              ) || null;

            setIsStale(!isCacheValid());
            await fetchTemplates(cachedAccount.accountId);

            setIsLoading(false);
            return cachedAccount;
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
                  instaData.profile_picture_url ||
                  dbAccount.profilePicture ||
                  "/public/assets/img/default-img.jpg",
                followersCount:
                  instaData.followers_count || dbAccount.followersCount || 0,
                postsCount: instaData.media_count || dbAccount.postsCount || 0,
                isActive: dbAccount.isActive || false,
                expiryDate: dbAccount.expiresAt || null,
                templatesCount: dbAccount.templatesCount || 0,
                repliesCount: dbAccount.totalReplies || 0,
                accountLimit: dbAccount.accountLimit || 1,
                lastActivity:
                  dbAccount.lastActivity || new Date().toISOString(),
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

        if (completeAccounts) {
          const infoAccount =
            completeAccounts.find(
              (account: InstagramAccount) => account.id === accountId
            ) || null;

          setIsStale(!isCacheValid());
          await fetchTemplates(infoAccount.accountId);

          localStorage.setItem(
            ACCOUNTS_CACHE_KEY,
            JSON.stringify({
              data: completeAccounts,
              timestamp: Date.now(),
            })
          );
          return infoAccount;
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load accounts"
        );
      }
    },
    [userId, router, fetchTemplates]
  );
  const fetchAccountData = useCallback(async () => {
    try {
      const accountsData = await fetchAccounts(params.id);
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
      setAccount(updatedData);
    } catch (error) {
      console.error("Using dummy data - API error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchAccounts, params.id]);
  useEffect(() => {
    if (!params.id || !userId) {
      router.push("/sign-in");
      return;
    }
    fetchAccountData();
  }, [userId, router, params.id, fetchAccountData]);

  const handleToggleAccount = async () => {
    const newActiveState = !account.isActive;

    // Optimistically update UI
    setAccount({ ...account, isActive: newActiveState });

    try {
      const response = await fetch(`/api/insta/accounts/${account.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newActiveState }),
      });

      if (!response.ok) {
        // Revert on error
        setAccount({ ...account, isActive: !newActiveState });
        console.error("Failed to update account status");
      }
    } catch (error) {
      // Revert on error
      setAccount({ ...account, isActive: !newActiveState });
      console.error("Error updating account:", error);
    }
  };
  const handleCreateTemplate = async () => {
    try {
      const response = await fetch("/api/insta/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          accountId: account.accountId,
          ...newTemplate,
          accountUsername: "@" + account.username,
          triggers: newTemplate.triggers,
        }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setTemplates([result.template, ...templates]);
        setIsCreateDialogOpen(false);

        toast({
          title: "Template created successfully",
          duration: 3000,
          className: "success-toast",
        });
        setNewTemplate({
          name: "",
          category: "",
          content: [""],
          triggers: [""],
          priority: 5,
          accountUsername: "",
        });
      } else {
        setIsCreateDialogOpen(false);

        toast({
          title: result.message || "Failed to create template",
          description: result.error || "Please try again",
          duration: 3000,
          className: "error-toast",
        });
      }
    } catch (error) {
      setIsCreateDialogOpen(false);

      toast({
        title: "Network error",
        description: "Could not connect to server",
        duration: 3000,
        className: "error-toast",
      });
    }
  };
  const handleEditClick = (template: any) => {
    setEditingTemplate(template);
    setIsCreateDialogOpen(true);
  };
  const handleUpdateTemplate = async (template: any) => {
    try {
      const templateId = template._id;
      const response = await fetch(`/api/insta/templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        // Update your templates state
        const updated = await response.json();
        setTemplates(
          templates.map((t: any) => (t._id === updated._id ? updated : t))
        );
        setIsCreateDialogOpen(false);
        setEditingTemplate(null);
        toast({
          title: "Template updated successfully",
          duration: 3000,
          className: "success-toast",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to update template",
        duration: 3000,
        className: "error-toast",
      });
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
  const handleError = () => {
    setHasError(true);
  };
  const refresh = async () => {
    await localStorage.removeItem(ACCOUNTS_CACHE_KEY);
    await fetchAccounts(params.id);
  };
  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto mb-4"></div>
          <p className="text-gray-300">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbsDefault />
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/insta/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      {/* Account Header */}
      <Card className="mb-8 overflow-hidden hover:-translate-y-1 transition-all shadow  hover:shadow-[#FF2E9F ">
        <CardContent className="pt-6  group hover:shadow-xl  duration-300  bg-gradient-to-br from-[#FF2E9F]/20 to-[#FF2E9F]/5 border-[#FF2E9F]/10 hover:border-[#FF2E9F]/20  bg-transparent backdrop-blur-sm border ">
          <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-center justify-between">
            <div className="flex-[60%] flex flex-col md:flex-row gap-5  items-center ">
              <div className="relative">
                <Image
                  width={100}
                  height={100}
                  src={hasError ? defaultImg : defaultImg}
                  alt={account.displayName || "Instagram Account"}
                  onError={handleError}
                  className="h-24 w-24 rounded-full object-cover"
                />
                <div
                  className={`absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-2 border-[#0a0a0a] ${
                    account.isActive ? "bg-[#00F0FF]" : "bg-gray-400"
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center justify-start w-full gap-1 md:gap-3">
                  <h1 className="text-2xl md:text-4xl font-bold  gradient-text-main">
                    @{account.username}
                  </h1>
                  <Badge variant={account.isActive ? "default" : "secondary"}>
                    {account.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xl text-gray-300 mb-2">
                  {account.displayName}
                </p>
                <div className="flex items-center gap-2 md:gap-6 text-gray-400">
                  <span>{account.followersCount} followers</span>
                  <span>{account.postsCount} posts</span>
                  <span>{account.engagementRate}% engagement</span>
                </div>
              </div>
            </div>
            <div className=" flex-[35%] flex flex-col items-center justify-center w-full gap-3  ">
              <div className="">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="account-toggle">Auto-replies</Label>
                  <Switch
                    id="account-toggle"
                    checked={account.isActive}
                    onCheckedChange={handleToggleAccount}
                  />

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
                </div>
              </div>
              <div className=" flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => refresh()}
                    variant="outline"
                    size="sm"
                    className="border-white/20 p-2 bg-green-900 text-gray-300 hover:bg-white/10"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Main Content */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className=" bg-[#0a0a0a]/60 border min-h-max flex flex-wrap items-center justify-start max-w-max gap-1 md:gap-3 text-white  w-full grid-cols-4  border-gray-900">
          <TabsTrigger
            className="data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]"
            value="analytics"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]"
            value="templates"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]"
            value="settings"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex flex-wrap gap-3 md:gap-0 justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Reply Templates</h2>
              <p className="text-muted-foreground">
                Create and manage automated reply templates for this account
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditingTemplate(null)}
                  className="btn-gradient-cyan hover:opacity-90 hover:shadow-cyan-500 shadow-lg transition-opacity "
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-transparent bg-gradient-to-br  border-[#B026FF]/20 hover:border-[#B026FF]/40 backdrop-blur-md border">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingTemplate ? "Edit Template" : "Create New Template"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {editingTemplate
                      ? "Update your automated reply content and triggers"
                      : "Set up an automated reply that triggers when specific keywords are detected"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar ">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">
                        Template Name
                      </Label>
                      {editingTemplate ? (
                        <div className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-gray-600">
                          {editingTemplate.name}
                        </div>
                      ) : (
                        <Input
                          id="name"
                          value={newTemplate.name}
                          onChange={(e) =>
                            setNewTemplate({
                              ...newTemplate,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g., Welcome Message"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-gray-300">
                        Category
                      </Label>
                      {editingTemplate ? (
                        <div className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-gray-600 capitalize">
                          {editingTemplate.category}
                        </div>
                      ) : (
                        <Select
                          value={newTemplate.category}
                          onValueChange={(value) =>
                            setNewTemplate({ ...newTemplate, category: value })
                          }
                        >
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Choose Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: "greeting", label: "Greeting" },
                              { value: "sales", label: "Sales" },
                              { value: "content", label: "Content" },
                              { value: "engagement", label: "Engagement" },
                              { value: "support", label: "Support" },
                            ]
                              .filter(
                                (category) =>
                                  !templates.some(
                                    (template: any) =>
                                      template.category === category.value
                                  )
                              )
                              .map((category) => (
                                <SelectItem
                                  key={category.value}
                                  value={category.value}
                                >
                                  {category.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-300">Replies (up to 3)</Label>
                      {(!editingTemplate ||
                        (editingTemplate.content &&
                          editingTemplate.content.length < 3)) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (editingTemplate) {
                              setEditingTemplate({
                                ...editingTemplate,
                                content: [
                                  ...(editingTemplate.content || []),
                                  "",
                                ],
                              });
                            } else {
                              setNewTemplate({
                                ...newTemplate,
                                content: [...(newTemplate.content || []), ""],
                              });
                            }
                          }}
                          className="text-cyan-300 border-cyan-300 hover:bg-cyan-300/10"
                        >
                          <Plus className="mr-1 h-3 w-3" /> Add Reply
                        </Button>
                      )}
                    </div>

                    {(editingTemplate
                      ? editingTemplate.content
                      : newTemplate.content
                    )?.map((content: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <Label
                            htmlFor={`content-${index}`}
                            className="text-gray-300"
                          >
                            Reply {index + 1}
                          </Label>
                          {(editingTemplate
                            ? editingTemplate.content
                            : newTemplate.content
                          )?.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updatedContent = editingTemplate
                                  ? [...editingTemplate.content]
                                  : [...newTemplate.content];
                                updatedContent.splice(index, 1);

                                if (editingTemplate) {
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    content: updatedContent,
                                  });
                                } else {
                                  setNewTemplate({
                                    ...newTemplate,
                                    content: updatedContent,
                                  });
                                }
                              }}
                              className="text-red-500 hover:bg-red-500/10 h-6 w-6"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <Textarea
                          id={`content-${index}`}
                          value={content}
                          onChange={(e) => {
                            const updatedContent = editingTemplate
                              ? [...editingTemplate.content]
                              : [...newTemplate.content];

                            updatedContent[index] = e.target.value;

                            if (editingTemplate) {
                              setEditingTemplate({
                                ...editingTemplate,
                                content: updatedContent,
                              });
                            } else {
                              setNewTemplate({
                                ...newTemplate,
                                content: updatedContent,
                              });
                            }
                          }}
                          placeholder="Write your automated reply..."
                          className="min-h-[80px] bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="triggers" className="text-gray-300">
                        set triggers (up to 3)
                      </Label>
                      {(!editingTemplate ||
                        (editingTemplate.triggers &&
                          editingTemplate.triggers.length < 3)) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (editingTemplate) {
                              setEditingTemplate({
                                ...editingTemplate,
                                triggers: [
                                  ...(editingTemplate.triggers || []),
                                  "",
                                ],
                              });
                            } else {
                              setNewTemplate({
                                ...newTemplate,
                                triggers: [...(newTemplate.triggers || []), ""],
                              });
                            }
                          }}
                          className="text-cyan-300 border-cyan-300 hover:bg-cyan-300/10"
                        >
                          <Plus className="mr-1 h-3 w-3" /> Add Reply
                        </Button>
                      )}
                    </div>

                    {(editingTemplate
                      ? editingTemplate.triggers
                      : newTemplate.triggers
                    )?.map((triggers: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <Label
                            htmlFor={`content-${index}`}
                            className="text-gray-300"
                          >
                            Reply {index + 1}
                          </Label>
                          {(editingTemplate
                            ? editingTemplate.triggers
                            : newTemplate.triggers
                          )?.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updatedContent = editingTemplate
                                  ? [...editingTemplate.triggers]
                                  : [...newTemplate.triggers];
                                updatedContent.splice(index, 1);

                                if (editingTemplate) {
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    triggers: updatedContent,
                                  });
                                } else {
                                  setNewTemplate({
                                    ...newTemplate,
                                    triggers: updatedContent,
                                  });
                                }
                              }}
                              className="text-red-500 hover:bg-red-500/10 h-6 w-6"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <Input
                          id={`content-${index}`}
                          value={triggers}
                          onChange={(e) => {
                            const updatedContent = editingTemplate
                              ? [...editingTemplate.triggers]
                              : [...newTemplate.triggers];

                            updatedContent[index] = e.target.value;

                            if (editingTemplate) {
                              setEditingTemplate({
                                ...editingTemplate,
                                triggers: updatedContent,
                              });
                            } else {
                              setNewTemplate({
                                ...newTemplate,
                                triggers: updatedContent,
                              });
                            }
                          }}
                          placeholder="Write your automated reply..."
                          className=" bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-gray-300">
                        Priority (1-10)
                      </Label>
                      <Input
                        id="priority"
                        type="number"
                        min="1"
                        max="10"
                        value={
                          editingTemplate
                            ? editingTemplate.priority || 5
                            : newTemplate.priority || 5
                        }
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (editingTemplate) {
                            setEditingTemplate({
                              ...editingTemplate,
                              priority: isNaN(value)
                                ? 5
                                : Math.min(Math.max(value, 1), 10),
                            });
                          } else {
                            setNewTemplate({
                              ...newTemplate,
                              priority: isNaN(value)
                                ? 5
                                : Math.min(Math.max(value, 1), 10),
                            });
                          }
                        }}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account" className="text-gray-300">
                        Account
                      </Label>

                      {editingTemplate ? (
                        <div className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-gray-600">
                          {editingTemplate.accountUsername}
                        </div>
                      ) : (
                        <div className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-gray-600">
                          {account.username}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingTemplate(null);
                    }}
                    className="border-white/20 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      editingTemplate
                        ? handleUpdateTemplate(editingTemplate)
                        : handleCreateTemplate()
                    }
                    className="btn-gradient-cyan"
                  >
                    {editingTemplate ? "Update Template" : "Create Template"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {templates.map((template: any) => (
              <TemplateCard
                key={template._id}
                template={template}
                onEdit={handleEditClick}
                onDelete={handleDeleteTemplate}
                onToggle={handleToggleTemplate}
              />
            ))}

            {templates.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No templates yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first reply template to start automating
                    responses
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#3a8477]/10 to-[#1f918b]/5 border-[#177474]/15 hover:bg-[#177474]/10 group bg-transparent backdrop-blur-sm border">
            <CardHeader className="p-3">
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Track the performance of your auto-replies for this account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="card-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Templates
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-[#00F0FF]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#FF2E9F]">
                      {account.templatesCount || 0}
                    </div>
                    <p className="text-xs text-gray-400">
                      Active reply templates
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Replies Sent
                    </CardTitle>
                    <Zap className="h-4 w-4 text-[#B026FF]" />
                  </CardHeader>
                  <CardContent>
                    <div className=" text-3xl font-bold text-green-600">
                      {account.repliesCount || 0}
                    </div>
                    <p className="text-xs text-gray-400">
                      Total automated replies
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Response Time
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-[#FF2E9F]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {account?.avgResponseTime
                        ? formatResponseTimeSmart(account.avgResponseTime)
                        : 0}{" "}
                    </div>
                    <p className="text-xs text-gray-400">
                      Average response time
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Engagement
                    </CardTitle>
                    <Users className="h-4 w-4 text-[#00F0FF]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {account.engagementRate || 0}%
                    </div>
                    <p className="text-xs text-gray-400">Engagement rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Account Management */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <Card className="card-hover">
                  <CardHeader className="p-3">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Settings className="h-5 w-5 text-[#00F0FF]" />
                      Account Settings
                    </CardTitle>
                    <CardDescription className="text-gray-400 font-mono">
                      Manage your Instagram account settings and automation
                      preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">
                          Auto-Reply System
                        </h4>
                        <p className="text-sm text-gray-400">
                          Automatically respond to comments using templates
                        </p>
                      </div>
                      <Switch
                        checked={account.isActive}
                        onCheckedChange={handleToggleAccount}
                        className="data-[state=checked]:bg-[#00F0FF]"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Template Usage</span>
                        <span className="text-gray-400">85%</span>
                      </div>
                      <Progress value={85} className="h-2 bg-white/10" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Success Rate</span>
                        <span className="text-gray-400">94%</span>
                      </div>
                      <Progress value={94} className="h-2 bg-white/10" />
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Last Activity</span>
                        <span className="text-gray-400">
                          {formatLastActivity(account.lastActivity) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-300">Last Sync</span>
                        <span className="text-gray-400">
                          {formatLastActivity(account.lastActivity) || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardHeader className="p-3">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BarChart3 className="h-5 w-5 text-[#B026FF]" />
                      Performance Metrics
                    </CardTitle>
                    <CardDescription className="text-gray-400 font-mono">
                      Track your accounts automation performance and engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-[#00F0FF] mb-1">
                          {account.templatesCount || 0}
                        </div>
                        <div className="text-xs text-gray-400">
                          Active Templates
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-[#B026FF] mb-1">
                          {account.repliesCount || 0}
                        </div>
                        <div className="text-xs text-gray-400">
                          Total Replies
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">
                            Comment Response Rate
                          </span>
                          <span className="text-gray-400">78%</span>
                        </div>
                        <Progress value={78} className="h-2 bg-white/10" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">
                            Engagement Growth
                          </span>
                          <span className="text-gray-400">+23%</span>
                        </div>
                        <Progress value={23} className="h-2 bg-white/10" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <h4 className="font-medium mb-3 text-white">
                        Quick Actions
                      </h4>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-[#FF2E9F]/20 hover:bg-[#FF2E9F]/30 border-white/20 text-gray-300 "
                          asChild
                        >
                          <Link href="/templates">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Manage Templates
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-[#B026FF]/10 border-white/20 text-gray-300 hover:bg-[#B026FF]/20"
                          asChild
                        >
                          <Link href="/analytics">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="card-hover">
                <CardHeader className="p-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-[#FF2E9F]" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-gray-400 font-mono">
                    Latest automated replies and system activities for this
                    account
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-4">
                    {/* {account?.recentActivity
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
                      ))} */}
                    {/* {account?.recentActivity
                      ?.slice(0, 3)
                      .map((activity: any) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                activity.success
                                  ? "bg-[#00F0FF]"
                                  : "bg-[#FF2E9F]"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {activity.message}
                              </p>
                              <p className="text-xs text-gray-400">
                                Template: {activity.templateName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="default"
                              className="bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30 text-xs"
                            >
                              Success
                            </Badge>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatLastActivity(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))} */}

                    <div className="space-y-4 max-h-96 overflow-y-auto no-scrollbar">
                      {account &&
                        account.recentActivity &&
                        account.recentActivity.map((activity: any) => (
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
                                {formatLastActivity(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#d61a1a]/10 to-[#d61a1a]/5 border-[#d61a1a]/15 hover:bg-[#d61a1a]/10 group bg-transparent backdrop-blur-sm border">
            <CardHeader className="p-3">
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Configure how auto-replies work for this Instagram account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Auto-Replies</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on/off automated replies for this account
                  </p>
                </div>
                <Switch
                  checked={account.isActive}
                  onCheckedChange={handleToggleAccount}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">
                    Limit 1 reply per comment, 10 replies per hour
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Smart Filtering</Label>
                  <p className="text-sm text-muted-foreground">
                    Skip replies to spam or inappropriate comments
                  </p>
                </div>
                <Switch defaultChecked />
              </div>{" "}
              <div className="pt-4 border-t border-dashed">
                <div className="flex flex-col space-y-4">
                  <Label className="text-destructive">Danger Zone</Label>
                  <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
                    <div className="flex items-center justify-center gap-3">
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this Instagram account
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className=" bg-[#6d1717]/5 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              Instagram account data from our database and all associated
              templates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
