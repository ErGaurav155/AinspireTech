"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Search,
  Filter,
  ImageIcon,
  VideoIcon,
  Link as LinkIcon,
  ChevronDown,
  AlertCircle,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import defaultImg from "@/public/assets/img/default-img.jpg";

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
import Image from "next/image";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { useRouter } from "next/navigation";

import { Progress } from "@/components/ui/progress";
import { useAuth } from "@clerk/nextjs";
import { toast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";
import { getInstaSubscriptionInfo } from "@/lib/action/subscription.action";
import { refreshInstagramToken } from "@/lib/action/insta.action";

// Types
interface MediaItem {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  permalink: string;
  timestamp: string;
  caption?: string;
  likes?: number;
  comments?: number;
}

interface ContentItem {
  text: string;
  link?: string;
}

interface Template {
  _id: string;
  name: string;
  content: ContentItem[];
  openDm: string;
  reply: string[];
  triggers: string[];
  isFollow: boolean;
  priority: number;
  accountUsername: string;
  mediaId: string;
  mediaUrl: string;
  mediaType?: string;
  isActive: boolean;
  usageCount?: number;
  lastUsed?: string;
}

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
  recentActivity?: any[];
}

interface ThemeStyles {
  containerBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  badgeBg: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  textCount: string;
  buttonOutlineBorder: string;
  buttonOutlineText: string;
  alertBg: string;
  dialogBg: string;
}

interface NewTemplate {
  name: string;
  content: ContentItem[];
  openDm: string;
  reply: string[];
  triggers: string[];
  isFollow: boolean;
  priority: number;
  accountUsername: string;
  mediaId: string;
  mediaUrl: string;
}

// Constants
const ACCOUNTS_CACHE_KEY = "instagramAccounts";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const DEFAULT_TEMPLATE: NewTemplate = {
  name: "",
  content: [
    { text: "This Is the link you want,Click the button below.", link: "" },
  ],
  openDm:
    "Hey there! I'm so happy you're here, thanks so much for your interest 😊 Click below and I'll send you the link in just a sec ✨",
  reply: [
    "Thanks! Please see DMs.",
    "Sent you a message! Check it out!",
    "Nice! Check your DMs!",
  ],
  triggers: ["Price", "Link", "Product"],
  isFollow: false,
  priority: 5,
  accountUsername: "",
  mediaId: "",
  mediaUrl: "",
};

export default function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Hooks
  const { id } = use(params);
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme || "light";

  // State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadMoreCount, setLoadMoreCount] = useState<number>(0);
  const [hasMoreTemplates, setHasMoreTemplates] = useState<boolean>(false);
  const [totalTemplates, setTotalTemplates] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [canFollow, setCanFollow] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Template search and media
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAccountMedia, setSelectedAccountMedia] = useState<MediaItem[]>(
    []
  );
  const [isLoadingMedia, setIsLoadingMedia] = useState<boolean>(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isTemplateCreating, setIsTemplateCreating] = useState<boolean>(false);
  const [isUpdatingTemplate, setIsUpdatingTemplate] = useState<boolean>(false);
  const [newTemplate, setNewTemplate] = useState<NewTemplate>(DEFAULT_TEMPLATE);

  // Refs
  const loadMoreCountRef = useRef<number>(0);

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
      cardHoverBorder: isDark
        ? "hover:border-[#258b94]/40"
        : "hover:border-[#258b94]/60",
      badgeBg: isDark ? "bg-[#0a0a0a]" : "bg-white",
      inputBg: isDark ? "bg-white/5" : "bg-white",
      inputBorder: isDark ? "border-white/20" : "border-gray-300",
      inputText: isDark ? "text-white" : "text-n-5",
      textCount: isDark ? "text-white" : "text-n-5",
      buttonOutlineBorder: isDark ? "border-white/20" : "border-gray-300",
      buttonOutlineText: isDark ? "text-gray-300" : "text-n-5",
      alertBg: isDark ? "bg-[#6d1717]/5" : "bg-red-50/80",
      dialogBg: isDark ? "bg-[#0a0a0a]/95" : "bg-white/95",
    };
  }, [currentTheme]);

  // Helper: Format last activity
  const formatLastActivity = useCallback((dateString: string): string => {
    try {
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
    } catch {
      return "Just now";
    }
  }, []);

  // Helper: Format last used
  const formatLastUsed = useCallback((dateString?: string): string => {
    if (!dateString) return "Never";

    try {
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
    } catch {
      return "Recently";
    }
  }, []);

  // Helper: Format response time smart
  const formatResponseTimeSmart = (timeInSeconds: number): string => {
    if (timeInSeconds < 60) {
      return `${Math.round(timeInSeconds)}s`;
    } else if (timeInSeconds < 3600) {
      return `${Math.round(timeInSeconds / 60)}m`;
    } else {
      return `${Math.round(timeInSeconds / 3600)}h`;
    }
  };

  // Helper: Show toast notifications
  const showToast = useCallback(
    (
      title: string,
      description?: string,
      type: "success" | "error" | "info" = "success"
    ) => {
      toast({
        title,
        description,
        variant: type === "error" ? "destructive" : "default",
        duration: 3000,
      });
    },
    []
  );

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

  // Fetch account media
  const fetchAccountMedia = useCallback(
    async (accountId: string, username: string) => {
      if (!userId) return;

      setIsLoadingMedia(true);
      try {
        const response = await fetch(
          `/api/insta/media?accountId=${accountId}&userId=${userId}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch media");
        }

        const data = await response.json();
        if (data.media && data.media.length > 0) {
          setSelectedAccountMedia(data.media);
        } else {
          setSelectedAccountMedia([]);
          showToast(
            "No media found",
            `No posts or reels found for @${username}`,
            "info"
          );
        }
      } catch (error) {
        console.error("Error fetching media:", error);
        setSelectedAccountMedia([]);
        showToast(
          "Failed to fetch media",
          error instanceof Error
            ? error.message
            : "Could not load Instagram posts and reels",
          "error"
        );
      } finally {
        setIsLoadingMedia(false);
      }
    },
    [userId, showToast]
  );

  // Fetch templates
  const fetchTemplates = useCallback(
    async (accountId: string, reset = false) => {
      if (!userId || !accountId) return;

      if (reset) {
        loadMoreCountRef.current = 0;
        setLoadMoreCount(0);
      }

      try {
        const url = new URL(`/api/insta/templates`, window.location.origin);
        url.searchParams.set("userId", userId);
        url.searchParams.set("accountId", accountId);
        url.searchParams.set(
          "loadMoreCount",
          loadMoreCountRef.current.toString()
        );

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`Failed to fetch templates: ${response.status}`);
        }

        const data = await response.json();
        if (data.templates && Array.isArray(data.templates)) {
          const formattedTemplates = data.templates.map((template: any) => ({
            ...template,
            lastUsed: template.lastUsed
              ? new Date(template.lastUsed).toISOString()
              : new Date().toISOString(),
            successRate: template.successRate || 0,
          }));

          if (reset || loadMoreCountRef.current === 0) {
            setTemplates(formattedTemplates);
          } else {
            setTemplates((prev) => [...prev, ...formattedTemplates]);
          }

          setHasMoreTemplates(data.hasMore);
          setTotalTemplates(data.totalCount);
        } else {
          setTemplates([]);
          setHasMoreTemplates(false);
          setTotalTemplates(0);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        setTemplates([]);
        setHasMoreTemplates(false);
        setTotalTemplates(0);
      }
    },
    [userId]
  );

  // Load more templates
  const loadMoreTemplates = useCallback(async () => {
    if (!account?.accountId) return;

    setIsLoadingMore(true);
    try {
      const nextLoadCount = loadMoreCountRef.current + 1;
      loadMoreCountRef.current = nextLoadCount;

      await fetchTemplates(account.accountId, false);
      setLoadMoreCount(nextLoadCount);
    } catch (error) {
      console.error("Error loading more templates:", error);
      showToast("Failed to load more templates", "Please try again", "error");
    } finally {
      setIsLoadingMore(false);
    }
  }, [account?.accountId, fetchTemplates, showToast]);

  // Fetch account data
  const fetchAccounts = useCallback(
    async (accountId: string): Promise<InstagramAccount | null> => {
      if (!userId) {
        router.push("/sign-in");
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check cache first
        const cachedData =
          getCachedData<InstagramAccount[]>(ACCOUNTS_CACHE_KEY);
        if (cachedData) {
          const cachedAccount =
            cachedData.find((acc) => acc.id === accountId) || null;
          if (cachedAccount) {
            await fetchTemplates(cachedAccount.accountId, true);
            return cachedAccount;
          }
        }

        // Fetch from API
        const accountsResponse = await fetch(
          `/api/insta/dashboard?userId=${userId}`
        );
        if (!accountsResponse.ok) {
          throw new Error(
            `Failed to fetch accounts: ${accountsResponse.status}`
          );
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
                throw new Error(
                  `Instagram API failed: ${instaResponse.status}`
                );
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
                lastActivity:
                  dbAccount.lastActivity || new Date().toISOString(),
                engagementRate: Math.floor(Math.random() * 4) + 85,
                successRate: Math.floor(Math.random() * 4) + 90,
                avgResponseTime:
                  dbAccount?.avgResTime?.[0]?.avgResponseTime || 0,
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

        const foundAccount =
          validAccounts.find((acc) => acc.id === accountId) || null;

        if (foundAccount) {
          await fetchTemplates(foundAccount.accountId, true);
          setCachedData(ACCOUNTS_CACHE_KEY, validAccounts);
        }

        return foundAccount;
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load accounts"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, router, fetchTemplates]
  );

  // Fetch account data with recent activity
  const fetchAccountData = useCallback(async () => {
    try {
      const accountData = await fetchAccounts(id);
      if (!accountData) {
        setAccount(null);
        return;
      }

      // Fetch recent activity
      try {
        const response = await fetch(`/api/insta/replylogs?userId=${userId}`);
        if (response.ok) {
          const { replyLogs } = await response.json();
          accountData.recentActivity = replyLogs || [];
        }
      } catch (activityError) {
        console.error("Error fetching recent activity:", activityError);
        accountData.recentActivity = [];
      }

      setAccount(accountData);
    } catch (error) {
      console.error("Error fetching account data:", error);
      setError("Failed to load account data");
    }
  }, [id, userId, fetchAccounts]);

  // Fetch subscription info
  const fetchSubscriptionInfo = useCallback(async () => {
    if (!userId) return;

    try {
      const subs = await getInstaSubscriptionInfo(userId);
      setCanFollow(subs && subs.length > 0);
    } catch (error) {
      console.error("Failed to fetch subscription info:", error);
      setCanFollow(false);
    }
  }, [userId]);

  // Initialize component
  useEffect(() => {
    if (!isLoaded) return;
    if (!id || !userId) {
      router.push("/sign-in");
      return;
    }

    const initialize = async () => {
      await Promise.all([fetchAccountData(), fetchSubscriptionInfo()]);
    };

    initialize();
  }, [id, userId, router, isLoaded, fetchAccountData, fetchSubscriptionInfo]);

  // Handle toggle account
  const handleToggleAccount = useCallback(async () => {
    if (!account) return;

    const newActiveState = !account.isActive;
    setAccount({ ...account, isActive: newActiveState });

    try {
      const response = await fetch(`/api/insta/accounts/${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActiveState }),
      });

      if (!response.ok) {
        setAccount({ ...account, isActive: !newActiveState });
        throw new Error("Failed to update account status");
      }

      // Update cache
      const cachedData = getCachedData<InstagramAccount[]>(ACCOUNTS_CACHE_KEY);
      if (cachedData) {
        const updatedData = cachedData.map((acc) =>
          acc.id === account.id ? { ...acc, isActive: newActiveState } : acc
        );
        setCachedData(ACCOUNTS_CACHE_KEY, updatedData);
      }
    } catch (error) {
      console.error("Error updating account:", error);
      setAccount({ ...account, isActive: !newActiveState });
    }
  }, [account]);

  // Handle toggle template
  const handleToggleTemplate = useCallback(
    async (templateId: string) => {
      const template = templates.find((t) => t._id === templateId);
      if (!template) return;

      const newActiveState = !template.isActive;

      // Optimistic update
      setTemplates((prev) =>
        prev.map((t) =>
          t._id === templateId ? { ...t, isActive: newActiveState } : t
        )
      );

      try {
        const response = await fetch(`/api/insta/templates/${templateId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...template, isActive: newActiveState }),
        });

        if (!response.ok) {
          // Revert on error
          setTemplates((prev) =>
            prev.map((t) =>
              t._id === templateId ? { ...t, isActive: !newActiveState } : t
            )
          );
          throw new Error("Failed to update template status");
        }
      } catch (error) {
        console.error("Error updating template:", error);
        // Revert on error
        setTemplates((prev) =>
          prev.map((t) =>
            t._id === templateId ? { ...t, isActive: !newActiveState } : t
          )
        );
      }
    },
    [templates]
  );

  // Handle delete template
  const handleDeleteTemplate = useCallback(
    async (templateId: string) => {
      try {
        const response = await fetch(`/api/insta/templates/${templateId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setTemplates((prev) =>
            prev.filter((template) => template._id !== templateId)
          );
          showToast("Template deleted successfully");
        } else {
          throw new Error("Failed to delete template");
        }
      } catch (error) {
        console.error("Error deleting template:", error);
        showToast("Failed to delete template", "Please try again", "error");
      }
    },
    [showToast]
  );

  // Handle delete account
  const handleDeleteAccount = useCallback(async () => {
    if (!account) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/insta/accounts/${account.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      showToast("Account deleted successfully");

      // Clear cache
      localStorage.removeItem(ACCOUNTS_CACHE_KEY);

      router.push("/insta/dashboard");
    } catch (error) {
      console.error("Error deleting account:", error);
      showToast("Failed to delete account", "Please try again", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [account, router, showToast]);

  // Handle create template
  const handleCreateTemplate = useCallback(async () => {
    if (!account || !userId) return;

    setIsTemplateCreating(true);
    try {
      if (!newTemplate.mediaId) {
        showToast(
          "Media required",
          "Please select a post or reel for this template",
          "error"
        );
        return;
      }

      const response = await fetch("/api/insta/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          accountId: account.accountId,
          ...newTemplate,
          isFollow: canFollow ? newTemplate.isFollow : false,
          accountUsername: account.username,
          reply: newTemplate.reply.filter((r) => r.trim() !== ""),
          content: newTemplate.content.filter((c) => c.text.trim() !== ""),
          triggers: newTemplate.triggers.filter((t) => t.trim() !== ""),
        }),
      });

      const result = await response.json();
      if (response.ok && result.ok) {
        setTemplates((prev) => [result.template, ...prev]);
        setIsCreateDialogOpen(false);
        showToast("Template created successfully");

        // Reset form
        setNewTemplate({
          ...DEFAULT_TEMPLATE,
          accountUsername: account.username,
        });
        setSelectedMedia(null);
        setSelectedAccountMedia([]);
      } else {
        throw new Error(result.message || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      showToast(
        "Failed to create template",
        error instanceof Error ? error.message : "Please try again",
        "error"
      );
    } finally {
      setIsTemplateCreating(false);
    }
  }, [account, userId, newTemplate, canFollow, showToast]);

  // Handle update template
  const handleUpdateTemplate = useCallback(
    async (template: Template) => {
      if (!template._id) return;

      setIsUpdatingTemplate(true);
      try {
        const response = await fetch(`/api/insta/templates/${template._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...template,
            isFollow: canFollow ? template.isFollow : false,
          }),
        });

        if (response.ok) {
          const updated = await response.json();
          setTemplates((prev) =>
            prev.map((t) => (t._id === updated._id ? updated : t))
          );
          setIsCreateDialogOpen(false);
          setEditingTemplate(null);
          showToast("Template updated successfully");
        } else {
          throw new Error("Failed to update template");
        }
      } catch (error) {
        console.error("Error updating template:", error);
        showToast("Failed to update template", "Please try again", "error");
      } finally {
        setIsUpdatingTemplate(false);
      }
    },
    [canFollow, showToast]
  );

  // Handle edit click
  const handleEditClick = useCallback(
    (template: Template) => {
      setEditingTemplate(template);
      setIsCreateDialogOpen(true);

      if (account) {
        fetchAccountMedia(account.accountId, account.username);
      }
      setSelectedMedia(template.mediaId || null);
    },
    [account, fetchAccountMedia]
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    localStorage.removeItem(ACCOUNTS_CACHE_KEY);
    await fetchAccountData();
  }, [fetchAccountData]);

  // Handle image error
  const handleImageError = useCallback(() => {
    setHasError(true);
  }, []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.some((c: ContentItem) =>
          c.text.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        template.triggers.some((trigger) =>
          trigger.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesSearch;
    });
  }, [templates, searchTerm]);

  // Loading state
  if (isLoading || !isLoaded) {
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
        className={`min-h-screen ${themeStyles.containerBg} flex items-center justify-center`}
      >
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Account</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRefresh} className="btn-gradient-cyan">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/insta/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Account not found
  if (!account) {
    return (
      <div
        className={`min-h-screen ${themeStyles.containerBg} flex items-center justify-center`}
      >
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Account Not Found</h2>
            <p className="text-gray-600 mb-6">
              The Instagram account you are looking for does not exist or you do
              not have access to it.
            </p>
            <Button asChild>
              <Link href="/insta/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${themeStyles.containerBg} ${themeStyles.textPrimary}`}
    >
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbsDefault />

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={themeStyles.textPrimary}
          >
            <Link href="/insta/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Account Header */}
        <Card
          className={`mb-8 overflow-hidden hover:-translate-y-1 transition-all shadow hover:shadow-[#FF2E9F] ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
        >
          <CardContent className="pt-6 group hover:shadow-xl duration-300 bg-gradient-to-br from-[#FF2E9F]/20 to-[#FF2E9F]/5 border-[#FF2E9F]/10 hover:border-[#FF2E9F]/20 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-center justify-between">
              <div className="flex-[60%] flex flex-col md:flex-row gap-5 items-center">
                <div className="relative">
                  <Image
                    width={100}
                    height={100}
                    src={
                      hasError
                        ? defaultImg.src
                        : account.profilePicture || defaultImg.src
                    }
                    alt={account.displayName}
                    onError={handleImageError}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  <div
                    className={`absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-2 ${
                      account.isActive ? "bg-[#00F0FF]" : "bg-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-start w-full gap-1 md:gap-3">
                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#00F0FF] to-[#B026FF] bg-clip-text text-transparent">
                      @{account.username}
                    </h1>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className={`text-xl ${themeStyles.textSecondary} mb-2`}>
                    {account.displayName}
                  </p>
                  <div
                    className={`flex items-center gap-2 md:gap-6 text-n-5 ${themeStyles.textCount}`}
                  >
                    <span>
                      {account.followersCount.toLocaleString()} followers
                    </span>
                    <span>{account.postsCount} posts</span>
                    <span>{account.engagementRate}% engagement</span>
                  </div>
                </div>
              </div>
              <div className="flex-[35%] flex flex-col items-center justify-center w-full gap-3">
                <div className="">
                  <div className="flex items-center space-x-2">
                    <Label
                      htmlFor="account-toggle"
                      className={themeStyles.textSecondary}
                    >
                      Auto-replies
                    </Label>
                    <Switch
                      id="account-toggle"
                      checked={account.isActive}
                      onCheckedChange={handleToggleAccount}
                    />

                    {account.expiryDate &&
                      new Date(account.expiryDate) <
                        new Date(Date.now() + 24 * 60 * 60 * 1000) &&
                      userId && (
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
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    className={`${themeStyles.buttonOutlineBorder} p-2 bg-gradient-to-r from-[#0ce05d]/80 to-[#0baf5d]/80 hover:bg-white/10`}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Data
                  </Button>
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
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList
            className={`${themeStyles.cardBg} ${themeStyles.cardBorder} min-h-max flex flex-wrap items-center justify-start max-w-max gap-1 md:gap-3 w-full border-[0.5px]`}
          >
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
                <h2 className={`text-2xl font-bold ${themeStyles.textPrimary}`}>
                  Reply Templates
                </h2>
                <p
                  className={`${themeStyles.textSecondary} text-lg font-medium font-montserrat`}
                >
                  Create and manage automated reply templates for this account
                </p>
              </div>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="btn-gradient-cyan hover:opacity-90 hover:shadow-cyan-500 shadow-lg transition-opacity">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] bg-gradient-to-br border-[#B026FF]/20 hover:border-[#B026FF]/40 backdrop-blur-md border max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className={themeStyles.textPrimary}>
                      {editingTemplate
                        ? "Edit Template"
                        : "Create New Template"}
                    </DialogTitle>
                    <DialogDescription
                      className={`${themeStyles.textSecondary} font-montserrat text-base font-medium`}
                    >
                      {editingTemplate
                        ? "Update your automated replies and triggers"
                        : "Set up automated replies for specific Instagram posts or reels"}
                    </DialogDescription>
                  </DialogHeader>

                  <TemplateForm
                    account={account}
                    template={editingTemplate || newTemplate}
                    isEditing={!!editingTemplate}
                    onTemplateChange={
                      editingTemplate ? setEditingTemplate : setNewTemplate
                    }
                    selectedMedia={selectedMedia}
                    onMediaSelect={(mediaId, mediaUrl) => {
                      if (editingTemplate) {
                        setEditingTemplate({
                          ...editingTemplate,
                          mediaId,
                          mediaUrl,
                        });
                      } else {
                        setNewTemplate({ ...newTemplate, mediaId, mediaUrl });
                      }
                      setSelectedMedia(mediaId);
                    }}
                    accountMedia={selectedAccountMedia}
                    isLoadingMedia={isLoadingMedia}
                    onRefreshMedia={() =>
                      account &&
                      fetchAccountMedia(account.accountId, account.username)
                    }
                    canFollow={canFollow}
                  />

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingTemplate(null);
                        setSelectedAccountMedia([]);
                        setSelectedMedia(null);
                      }}
                      className={`${themeStyles.buttonOutlineBorder} ${themeStyles.buttonOutlineText}`}
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
                      disabled={isTemplateCreating || isUpdatingTemplate}
                    >
                      {isTemplateCreating || isUpdatingTemplate ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingTemplate ? "Updating..." : "Creating..."}
                        </>
                      ) : editingTemplate ? (
                        "Update Template"
                      ) : (
                        "Create Template"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates, content, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.inputText}`}
                />
              </div>
            </div>

            {/* Templates Count */}
            <div className="mb-6">
              <p className={themeStyles.textMuted}>
                Showing {filteredTemplates.length} of {totalTemplates} templates
              </p>
            </div>

            {/* Templates List */}
            <div className="grid gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  themeStyles={themeStyles}
                  currentTheme={currentTheme}
                  onToggleTemplate={handleToggleTemplate}
                  onEditTemplate={handleEditClick}
                  onDeleteTemplate={handleDeleteTemplate}
                  formatLastUsed={formatLastUsed}
                />
              ))}

              {/* Load More Button */}
              {hasMoreTemplates && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={loadMoreTemplates}
                    disabled={isLoadingMore}
                    className="btn-gradient-cyan px-8 py-3"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Load More ({totalTemplates - templates.length} more)
                      </div>
                    )}
                  </Button>
                </div>
              )}

              {/* No Templates */}
              {templates.length === 0 && (
                <Card
                  className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
                >
                  <CardContent className="text-center py-12">
                    <div
                      className={`mx-auto w-24 h-24 ${
                        currentTheme === "dark" ? "bg-white/5" : "bg-gray-100"
                      } rounded-full flex items-center justify-center mb-4`}
                    >
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3
                      className={`text-lg font-semibold mb-2 ${themeStyles.textPrimary}`}
                    >
                      No templates yet
                    </h3>
                    <p className={`${themeStyles.textMuted} mb-4`}>
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
            <AnalyticsTab
              account={account}
              themeStyles={themeStyles}
              formatLastActivity={formatLastActivity}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab
              account={account}
              themeStyles={themeStyles}
              onToggleAccount={handleToggleAccount}
              onDeleteAccount={() => setShowDeleteDialog(true)}
            />
          </TabsContent>
        </Tabs>

        {/* Delete Account Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent
            className={`${themeStyles.alertBg} backdrop-blur-md`}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className={themeStyles.textPrimary}>
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription
                className={`font-montserrat ${themeStyles.textSecondary}`}
              >
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
    </div>
  );
}

// Template Form Component
interface TemplateFormProps {
  account: InstagramAccount;
  template: Template | NewTemplate;
  isEditing: boolean;
  onTemplateChange: (template: any) => void;
  selectedMedia: string | null;
  onMediaSelect: (mediaId: string, mediaUrl: string) => void;
  accountMedia: MediaItem[];
  isLoadingMedia: boolean;
  onRefreshMedia: () => void;
  canFollow: boolean;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  account,
  template,
  isEditing,
  onTemplateChange,
  selectedMedia,
  onMediaSelect,
  accountMedia,
  isLoadingMedia,
  onRefreshMedia,
  canFollow,
}) => {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme || "light";

  const themeStyles = {
    inputBg: currentTheme === "dark" ? "bg-white/5" : "bg-white",
    inputBorder:
      currentTheme === "dark" ? "border-white/20" : "border-gray-300",
    inputText: currentTheme === "dark" ? "text-white" : "text-n-5",
    textSecondary: currentTheme === "dark" ? "text-gray-300" : "text-n-5",
    textMuted: currentTheme === "dark" ? "text-gray-400" : "text-n-5",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className={themeStyles.textSecondary}>
            Template Name
          </Label>
          {isEditing ? (
            <div
              className={`px-3 py-2 ${themeStyles.inputBg} ${themeStyles.inputBorder} rounded-md ${themeStyles.textMuted} font-montserrat`}
            >
              {(template as Template).name}
            </div>
          ) : (
            <Input
              id="name"
              value={template.name}
              onChange={(e) =>
                onTemplateChange({ ...template, name: e.target.value })
              }
              placeholder="e.g., Welcome Message"
              className={`${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.inputText}`}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="account" className={themeStyles.textSecondary}>
            Account
          </Label>
          <div
            className={`px-3 py-2 ${themeStyles.inputBg} ${themeStyles.inputBorder} rounded-md ${themeStyles.textMuted} font-montserrat`}
          >
            {account.username}
          </div>
        </div>
      </div>

      {/* Media Selection */}
      {!isEditing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className={themeStyles.textSecondary}>
              Select Post or Reel
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshMedia}
              className="text-cyan-300 border-cyan-300 hover:bg-cyan-300/10"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
          {isLoadingMedia ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]"></div>
            </div>
          ) : accountMedia.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-max overflow-y-auto no-scrollbar p-2">
              {accountMedia.map((media) => (
                <div
                  key={media.id}
                  className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${
                    selectedMedia === media.id
                      ? "border-[#00F0FF]"
                      : themeStyles.inputBorder
                  } transition-all`}
                  onClick={() => onMediaSelect(media.id, media.media_url)}
                >
                  <Image
                    src={media.media_url || defaultImg.src}
                    alt="Post"
                    height={128}
                    width={128}
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-xs truncate">
                    {media.caption
                      ? media.caption.substring(0, 30) +
                        (media.caption.length > 30 ? "..." : "")
                      : "No caption"}
                  </div>
                  <div className="absolute top-1 right-1 bg-black/70 rounded-full px-1 text-xs">
                    {media.media_type === "VIDEO" ? "Reel" : "Post"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-8 ${themeStyles.textMuted} font-montserrat`}
            >
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No posts or reels found for this account</p>
              <p className="text-sm mt-2">
                Make sure your Instagram account is connected to AinspireTech.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reply Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className={themeStyles.textSecondary}>
            Reply to their comments under the post
          </Label>
          {(!isEditing || (template.reply && template.reply.length < 3)) && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onTemplateChange({
                  ...template,
                  reply: [...template.reply, ""],
                })
              }
              className="text-cyan-300 border-cyan-300 hover:bg-cyan-300/10"
            >
              <Plus className="mr-1 h-3 w-3" /> Add Reply
            </Button>
          )}
        </div>

        {template.reply?.map((reply: string, index: number) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between">
              <Label
                htmlFor={`reply-${index}`}
                className={themeStyles.textSecondary}
              >
                Reply {index + 1}
              </Label>
              {template.reply.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const updatedReply = [...template.reply];
                    updatedReply.splice(index, 1);
                    onTemplateChange({ ...template, reply: updatedReply });
                  }}
                  className="text-red-500 bg-red-100 hover:bg-red-500/10 h-6 w-6"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            <Input
              id={`reply-${index}`}
              value={reply}
              onChange={(e) => {
                const updatedReply = [...template.reply];
                updatedReply[index] = e.target.value;
                onTemplateChange({ ...template, reply: updatedReply });
              }}
              placeholder="Eg. Sent you a message! Check it out!"
              className={`${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.inputText} font-montserrat`}
            />
          </div>
        ))}
      </div>

      {/* DM Reply Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className={themeStyles.textSecondary}>
            Get reply in Direct DM
          </Label>
          {(!isEditing ||
            (template.content && template.content.length < 3)) && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onTemplateChange({
                  ...template,
                  content: [...template.content, { text: "", link: "" }],
                })
              }
              className="text-cyan-300 border-cyan-300 hover:bg-cyan-300/10"
            >
              <Plus className="mr-1 h-3 w-3" /> Add Reply
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="openDm" className={themeStyles.textSecondary}>
            An opening DM
          </Label>
          <Textarea
            id="openDm"
            value={template.openDm}
            onChange={(e) =>
              onTemplateChange({ ...template, openDm: e.target.value })
            }
            placeholder="Hey there! I'm so happy you're here, thanks so much for your interest 😊 Click below and I'll send you the link in just a sec ✨"
            className={`${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.inputText} font-montserrat`}
          />
        </div>

        {template.content.map((contentItem: ContentItem, index: number) => (
          <div
            key={index}
            className={`space-y-2 p-3 border ${themeStyles.inputBorder} rounded-lg`}
          >
            <div className="flex justify-between">
              <Label
                htmlFor={`content-${index}`}
                className={themeStyles.textSecondary}
              >
                Sent DM {index + 1}
              </Label>
              {template.content.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const updatedContent = [...template.content];
                    updatedContent.splice(index, 1);
                    onTemplateChange({ ...template, content: updatedContent });
                  }}
                  className="text-red-500 bg-red-100 hover:bg-red-500/10 h-6 w-6"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            <Textarea
              id={`content-text-${index}`}
              value={contentItem.text}
              onChange={(e) => {
                const updatedContent = [...template.content];
                updatedContent[index] = {
                  ...updatedContent[index],
                  text: e.target.value,
                };
                onTemplateChange({ ...template, content: updatedContent });
              }}
              placeholder="This Is the link you want,Click the button below."
              className={`min-h-[80px] ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.inputText} font-montserrat`}
            />

            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-gray-400" />
              <Input
                id={`content-link-${index}`}
                value={contentItem.link || ""}
                onChange={(e) => {
                  const updatedContent = [...template.content];
                  updatedContent[index] = {
                    ...updatedContent[index],
                    link: e.target.value,
                  };
                  onTemplateChange({ ...template, content: updatedContent });
                }}
                placeholder="Eg. www.productLink.com"
                className={`${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.inputText} font-montserrat`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Follow Switch */}
      <div
        className={`flex items-center justify-between gap-8 p-3 border rounded-md ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.inputText} font-montserrat`}
      >
        <p>A DM asking to follow you before they get the link</p>
        <div className="flex items-center justify-center gap-2">
          <div className="bg-blue-700 px-1 rounded-sm">Paid</div>
          <Switch
            disabled={!canFollow}
            checked={template.isFollow}
            onCheckedChange={(checked) =>
              onTemplateChange({ ...template, isFollow: checked })
            }
            className="self-start data-[state=checked]:bg-[#00F0FF]"
          />
        </div>
      </div>

      {/* Triggers Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="triggers" className={themeStyles.textSecondary}>
            Set triggers (up to 3)
          </Label>
          {(!isEditing ||
            (template.triggers && template.triggers.length < 3)) && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onTemplateChange({
                  ...template,
                  triggers: [...template.triggers, ""],
                })
              }
              className="text-cyan-300 border-cyan-300 hover:bg-cyan-300/10"
            >
              <Plus className="mr-1 h-3 w-3" /> Add Trigger
            </Button>
          )}
        </div>

        <div className="flex items-center justify-start gap-5 w-full">
          {template.triggers?.map((trigger: string, index: number) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <Label
                  htmlFor={`trigger-${index}`}
                  className={themeStyles.textSecondary}
                >
                  Trigger {index + 1}
                </Label>
                {template.triggers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const updatedTriggers = [...template.triggers];
                      updatedTriggers.splice(index, 1);
                      onTemplateChange({
                        ...template,
                        triggers: updatedTriggers,
                      });
                    }}
                    className="text-red-500 bg-red-100 hover:bg-red-500/10 h-6 w-6"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <Input
                id={`trigger-${index}`}
                value={trigger}
                onChange={(e) => {
                  const updatedTriggers = [...template.triggers];
                  updatedTriggers[index] = e.target.value;
                  onTemplateChange({ ...template, triggers: updatedTriggers });
                }}
                placeholder="Enter trigger keyword Like Link,Product,etc."
                className={`${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.inputText} font-montserrat`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priority" className={themeStyles.textSecondary}>
          Priority (1-10)
        </Label>
        <Input
          id="priority"
          type="number"
          min="1"
          max="10"
          value={template.priority}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            onTemplateChange({
              ...template,
              priority: isNaN(value) ? 5 : Math.min(Math.max(value, 1), 10),
            });
          }}
          className={`${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.inputText} font-montserrat`}
        />
      </div>
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: Template;
  themeStyles: any;
  currentTheme: string;
  onToggleTemplate: (templateId: string) => void;
  onEditTemplate: (template: Template) => void;
  onDeleteTemplate: (templateId: string) => void;
  formatLastUsed: (dateString?: string) => string;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  themeStyles,
  currentTheme,
  onToggleTemplate,
  onEditTemplate,
  onDeleteTemplate,
  formatLastUsed,
}) => {
  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br ${
        template.isActive
          ? "from-[#B026FF]/20 to-[#B026FF]/5 border-[#B026FF]/20 hover:border-[#B026FF]/40"
          : "from-[#00F0FF]/10 to-[#00F0FF]/5 border-[#00F0FF]/20 hover:border-[#00F0FF]/40"
      } ${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
    >
      <CardHeader className="p-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle
                className={`text-base font-normal ${themeStyles.textPrimary}`}
              >
                {template.name}
              </CardTitle>
              {template.mediaType && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30">
                  {template.mediaType === "VIDEO" ? "Reel" : "Post"}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`text-xs ${themeStyles.inputBorder} ${themeStyles.textMuted}`}
              >
                Priority {template.priority}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Switch
              checked={template.isActive}
              onCheckedChange={() => onToggleTemplate(template._id)}
              className="data-[state=checked]:bg-[#00F0FF]"
            />
            <Button
              variant="ghost"
              size="sm"
              className={`${themeStyles.textMuted} hover:${themeStyles.textPrimary}`}
              onClick={() => onEditTemplate(template)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#FF2E9F] hover:text-[#FF2E9F]/80"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                className={`${themeStyles.dialogBg} ${themeStyles.inputBorder}`}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className={themeStyles.textPrimary}>
                    Delete Template
                  </AlertDialogTitle>
                  <AlertDialogDescription className={themeStyles.textSecondary}>
                    Are you sure you want to delete {template.name}? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className={`${themeStyles.inputBorder} ${themeStyles.textMuted}`}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeleteTemplate(template._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-start p-2 w-full">
        <div className="flex flex-col md:flex-row-reverse items-start justify-between gap-3 w-full">
          {template.mediaUrl && (
            <div className="w-full flex-1">
              <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
                Linked Media:
              </p>
              <div
                className={`relative w-40 h-40 rounded-md overflow-hidden border ${themeStyles.inputBorder} mb-2`}
              >
                <Image
                  src={template.mediaUrl || defaultImg.src}
                  alt="Linked media"
                  height={160}
                  width={160}
                  className="w-full h-full object-cover"
                />
                {template.mediaType === "VIDEO" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <VideoIcon className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex-1">
            <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
              Reply to their comments:
            </p>
            <div className="flex flex-wrap items-center justify-start w-full gap-2">
              {template.reply.map((reply: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`${themeStyles.inputBg} p-3 rounded-md ${themeStyles.textMuted} text-wrap text-base font-light font-montserrat`}
                >
                  {reply}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div className="w-full">
              <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
                An opening DM
              </p>
              <div className="flex flex-col gap-2">
                <Badge
                  variant="outline"
                  className={`flex flex-col items-start justify-center ${themeStyles.textMuted} ${themeStyles.inputBg} p-3 rounded-md mb-1`}
                >
                  <p className="text-base font-light font-montserrat">
                    {template.openDm}
                  </p>
                </Badge>
              </div>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div className="w-full">
              <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
                Reply send in DM:
              </p>
              <div className="flex flex-col gap-2">
                {template.content.map(
                  (contentItem: ContentItem, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`flex flex-col items-start justify-center ${themeStyles.textMuted} ${themeStyles.inputBg} p-3 rounded-md mb-1`}
                    >
                      <p className="text-base font-light font-montserrat">
                        {contentItem.text}
                      </p>
                      {contentItem.link && (
                        <div className="flex items-center gap-1 text-xs text-blue-400">
                          <LinkIcon className="h-3 w-3" />
                          <a
                            href={contentItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate"
                          >
                            {contentItem.link.length > 30
                              ? contentItem.link.slice(0, 30) + "..."
                              : contentItem.link}
                          </a>
                        </div>
                      )}
                    </Badge>
                  )
                )}
              </div>
            </div>
            <div className="pb-2 w-full">
              <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
                Trigger Keywords:
              </p>
              <div className="flex flex-wrap gap-1">
                {template.triggers.map((trigger: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`text-base font-light font-montserrat ${themeStyles.inputBorder} ${themeStyles.textMuted}`}
                  >
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="pb-2 w-full">
              <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
                Content For:
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant="outline"
                  className={`text-base font-light font-montserrat ${themeStyles.inputBorder} ${themeStyles.textMuted}`}
                >
                  {template.isFollow ? "Followers Only" : "Everyone"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10 w-full">
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              {template.usageCount || 0} uses
            </div>
            <div>Last used: {formatLastUsed(template.lastUsed)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Analytics Tab Component
// Analytics Tab Component
interface AnalyticsTabProps {
  account: InstagramAccount;
  themeStyles: any;
  formatLastActivity: (dateString: string) => string;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  account,
  themeStyles,
  formatLastActivity,
}) => {
  const formatResponseTimeSmart = (timeInSeconds: number): string => {
    if (timeInSeconds < 60) {
      return `${Math.round(timeInSeconds)}s`;
    } else if (timeInSeconds < 3600) {
      return `${Math.round(timeInSeconds / 60)}m`;
    } else {
      return `${Math.round(timeInSeconds / 3600)}h`;
    }
  };

  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#3a8477]/10 to-[#1f918b]/5 border-[#177474]/15 hover:bg-[#177474]/10 ${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
    >
      <CardHeader className="p-3">
        <CardTitle className={themeStyles.textPrimary}>
          Performance Analytics
        </CardTitle>
        <CardDescription
          className={`font-montserrat text-base ${themeStyles.textSecondary}`}
        >
          Track the performance of your auto-replies for this account
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${themeStyles.textSecondary}`}
              >
                Templates
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#FF2E9F]">
                {account.templatesCount || 0}
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                Active reply templates
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
                Replies Sent
              </CardTitle>
              <Zap className="h-4 w-4 text-[#B026FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {account.accountReply || 0}
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                Total automated replies
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
                Response Time
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#FF2E9F]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {account.avgResponseTime
                  ? formatResponseTimeSmart(account.avgResponseTime)
                  : "0s"}
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                Average response time
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
                Engagement
              </CardTitle>
              <Users className="h-4 w-4 text-[#00F0FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {account.engagementRate || 0}%
              </div>
              <p className={`text-xs ${themeStyles.textMuted} font-montserrat`}>
                Engagement rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Management */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card
            className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="p-3">
              <CardTitle
                className={`flex items-center gap-2 ${themeStyles.textPrimary}`}
              >
                <Settings className="h-5 w-5 text-[#00F0FF]" />
                Account Settings
              </CardTitle>
              <CardDescription
                className={`${themeStyles.textSecondary} font-montserrat text-base`}
              >
                Manage your Instagram account settings and automation
                preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${themeStyles.textPrimary}`}>
                    Auto-Reply System
                  </h4>
                  <p
                    className={`text-base ${themeStyles.textSecondary} font-montserrat`}
                  >
                    Automatically respond to comments using templates
                  </p>
                </div>
                <Switch
                  checked={account.isActive}
                  className="data-[state=checked]:bg-[#00F0FF]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={themeStyles.textSecondary}>
                    Template Usage
                  </span>
                  <span className={themeStyles.textMuted}>
                    {account.repliesCount || 0}%
                  </span>
                </div>
                <Progress
                  value={account.repliesCount || 0}
                  className="h-2 bg-white/10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={themeStyles.textSecondary}>
                    Response Time
                  </span>
                  <span className={themeStyles.textMuted}>
                    {account.avgResponseTime
                      ? formatResponseTimeSmart(account.avgResponseTime)
                      : "0s"}
                  </span>
                </div>
                <Progress value={85} className="h-2 bg-white/10" />
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <span className={themeStyles.textSecondary}>
                    Last Activity
                  </span>
                  <span className={themeStyles.textMuted}>
                    {formatLastActivity(account.lastActivity) || "Just now"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className={themeStyles.textSecondary}>Last Sync</span>
                  <span className={themeStyles.textMuted}>
                    {formatLastActivity(account.lastActivity) || "Just now"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
          >
            <CardHeader className="p-3">
              <CardTitle
                className={`flex items-center gap-2 ${themeStyles.textPrimary}`}
              >
                <BarChart3 className="h-5 w-5 text-[#B026FF]" />
                Performance Metrics
              </CardTitle>
              <CardDescription
                className={`${themeStyles.textSecondary} font-montserrat text-base`}
              >
                Track your accounts automation performance and engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-3">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`text-center p-4 ${themeStyles.inputBg} rounded-lg`}
                >
                  <div className="text-2xl font-bold text-[#00F0FF] mb-1">
                    {account.templatesCount || 0}
                  </div>
                  <div className={`text-xs ${themeStyles.textMuted}`}>
                    Active Templates
                  </div>
                </div>
                <div
                  className={`text-center p-4 ${themeStyles.inputBg} rounded-lg`}
                >
                  <div className="text-2xl font-bold text-[#B026FF] mb-1">
                    {account.repliesCount || 0}
                  </div>
                  <div className={`text-xs ${themeStyles.textMuted}`}>
                    Total Replies
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={themeStyles.textSecondary}>
                      Comment Response Rate
                    </span>
                    <span className={themeStyles.textMuted}>78%</span>
                  </div>
                  <Progress value={78} className="h-2 bg-white/10" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={themeStyles.textSecondary}>
                      Engagement Growth
                    </span>
                    <span className={themeStyles.textMuted}>+23%</span>
                  </div>
                  <Progress value={23} className="h-2 bg-white/10" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className={`font-medium mb-3 ${themeStyles.textPrimary}`}>
                  Quick Actions
                </h4>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full sm:w-1/2 bg-[#FF2E9F]/40 hover:bg-[#FF2E9F]/50 ${themeStyles.inputBorder} ${themeStyles.textMuted}`}
                    asChild
                  >
                    <Link href="/insta/templates">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Manage Templates
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full sm:w-1/2 bg-[#B026FF]/40 ${themeStyles.inputBorder} ${themeStyles.textMuted} hover:bg-[#B026FF]/50`}
                    asChild
                  >
                    <Link href="/insta/analytics">
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
        <Card
          className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
        >
          <CardHeader className="p-3">
            <CardTitle
              className={`flex items-center gap-2 ${themeStyles.textPrimary}`}
            >
              <Zap className="h-5 w-5 text-[#FF2E9F]" />
              Recent Activity
            </CardTitle>
            <CardDescription
              className={`${themeStyles.textSecondary} font-montserrat text-base`}
            >
              Latest automated replies and system activities for this account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto no-scrollbar">
                {account.recentActivity && account.recentActivity.length > 0 ? (
                  account.recentActivity.map((activity: any) => (
                    <div
                      key={activity.id}
                      className={`flex items-center justify-between p-3 border ${themeStyles.inputBorder} rounded-lg`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-2 w-2 rounded-full ${"bg-[#00F0FF]"}`}
                        />
                        <div>
                          <p
                            className={`text-sm font-medium ${themeStyles.textPrimary}`}
                          >
                            {activity.type === "reply_sent"
                              ? "Reply sent"
                              : "Reply failed"}
                            <span className={themeStyles.textSecondary}>
                              {" "}
                              to @{activity.account}
                            </span>
                          </p>
                          <p className={`text-xs ${themeStyles.textMuted}`}>
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
                          {formatLastActivity(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={themeStyles.textMuted}>No recent activity</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

// Settings Tab Component
interface SettingsTabProps {
  account: InstagramAccount;
  themeStyles: any;
  onToggleAccount: () => void;
  onDeleteAccount: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  account,
  themeStyles,
  onToggleAccount,
  onDeleteAccount,
}) => {
  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#d61a1a]/10 to-[#d61a1a]/5 border-[#d61a1a]/15 hover:bg-[#d61a1a]/10 ${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
    >
      <CardHeader className="p-3">
        <CardTitle className={themeStyles.textPrimary}>
          Account Settings
        </CardTitle>
        <CardDescription
          className={`font-montserrat text-base ${themeStyles.textSecondary}`}
        >
          Configure how auto-replies work for this Instagram account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className={themeStyles.textPrimary}>
              Enable Auto-Replies
            </Label>
            <p
              className={`text-base ${themeStyles.textSecondary} font-montserrat`}
            >
              Turn on/off automated replies for this account
            </p>
          </div>
          <Switch
            checked={account.isActive}
            onCheckedChange={onToggleAccount}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label className={themeStyles.textPrimary}>Rate Limiting</Label>
            <p
              className={`text-base ${themeStyles.textSecondary} font-montserrat`}
            >
              Limit 1 reply per comment, 10 replies per hour
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label className={themeStyles.textPrimary}>Smart Filtering</Label>
            <p
              className={`text-base ${themeStyles.textSecondary} font-montserrat`}
            >
              Skip replies to spam or inappropriate comments
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="pt-4 border-t border-dashed">
          <div className="flex flex-col space-y-4">
            <Label className="text-destructive">Danger Zone</Label>
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
              <div className="flex items-center justify-center gap-3">
                <p className="font-medium">Delete Account</p>
                <p
                  className={`text-base ${themeStyles.textSecondary} font-montserrat`}
                >
                  Permanently delete this Instagram account
                </p>
              </div>
              <Button variant="destructive" onClick={onDeleteAccount}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function: Format response time smart
const formatResponseTimeSmart = (timeInSeconds: number): string => {
  if (timeInSeconds < 60) {
    return `${Math.round(timeInSeconds)}s`;
  } else if (timeInSeconds < 3600) {
    return `${Math.round(timeInSeconds / 60)}m`;
  } else {
    return `${Math.round(timeInSeconds / 3600)}h`;
  }
};
