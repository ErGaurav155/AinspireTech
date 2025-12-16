"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
  Plus,
  MessageSquare,
  Edit2,
  Trash2,
  BarChart3,
  Search,
  Filter,
  Instagram,
  X,
  ImageIcon,
  VideoIcon,
  RefreshCw,
  Link as LinkIcon,
  ChevronDown,
} from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { toast } from "@/components/ui/use-toast";

// Actions
import { getInstaSubscriptionInfo } from "@/lib/action/subscription.action";

// Types
interface InstagramAccount {
  instagramId: string;
  username: string;
}

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
  isActive: boolean;
  priority: number;
  accountUsername: string;
  mediaId: string;
  mediaUrl: string;
  mediaType?: string;
  usageCount?: number;
  lastUsed?: string;
  successRate?: number;
  userId?: string;
}

interface TemplateFormData {
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
const INITIAL_TEMPLATE_FORM: TemplateFormData = {
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

const MAX_TRIGGERS = 3;
const MIN_REPLIES = 3;
const PRIORITY_MIN = 1;
const PRIORITY_MAX = 10;

export default function TemplatesPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { theme, resolvedTheme } = useTheme();

  // State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const [hasMoreTemplates, setHasMoreTemplates] = useState(false);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAccount, setFilterAccount] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccountMedia, setSelectedAccountMedia] = useState<MediaItem[]>(
    []
  );
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isUpdatingTemplate, setIsUpdatingTemplate] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [canFollow, setCanFollow] = useState(false);

  // Form state
  const [templateForm, setTemplateForm] = useState<TemplateFormData>(
    INITIAL_TEMPLATE_FORM
  );

  // Refs
  const isInitialMount = useRef(true);
  const userIdRef = useRef<string | null>(null);
  const filterAccountRef = useRef<string>("all");

  // Derived state
  const currentTheme = resolvedTheme || theme || "light";

  // Theme-based styles
  const themeStyles = useMemo(() => {
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
      buttonOutlineText: isDark ? "text-gray-300" : "text-n-6",
      dialogBg: isDark ? "bg-[#0a0a0a]/95" : "bg-white/95",
      inputBg: isDark ? "bg-white/5" : "bg-white",
      inputBorder: isDark ? "border-white/20" : "border-gray-300",
      inputText: isDark ? "text-white" : "text-n-5",
    };
  }, [currentTheme]);

  // Helper functions
  const showSuccessToast = (message: string) => {
    toast({
      title: "Success!",
      description: message,
      duration: 3000,
      className: "success-toast",
    });
  };

  const showErrorToast = (message: string, error?: string) => {
    toast({
      title: "Error",
      description: error ? `${message}: ${error}` : message,
      duration: 3000,
      className: "error-toast",
      variant: "destructive",
    });
  };

  // Authentication check
  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push("/sign-in");
      return;
    }
  }, [userId, isLoaded, router]);

  // Fetch accounts - runs only once
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/insta/accounts?userId=${userId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch accounts: ${response.status}`);
        }

        const data = await response.json();

        if (data?.accounts && Array.isArray(data.accounts)) {
          setAccounts(
            data.accounts.map((acc: any) => ({
              instagramId: acc.instagramId,
              username: acc.username,
            }))
          );
        } else {
          setAccounts([]);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setAccounts([]);
        showErrorToast("Failed to load Instagram accounts");
      }
    };

    fetchAccounts();
  }, [userId]); // Only depends on userId

  // Fetch subscription info - runs only once
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!userId) return;

      try {
        const subscriptionInfo = await getInstaSubscriptionInfo(userId);
        setCanFollow(subscriptionInfo && subscriptionInfo.length > 0);
      } catch (error) {
        console.error("Error fetching subscription info:", error);
        setCanFollow(false);
      }
    };

    fetchSubscriptionInfo();
  }, [userId]); // Only depends on userId

  // Fetch templates - using useCallback with proper dependencies
  const fetchTemplates = useCallback(
    async (loadCount = 0, forceRefresh = false) => {
      if (!userId) return;

      // Skip if it's not a forced refresh and we're already loading the same data
      if (
        !forceRefresh &&
        loadCount === 0 &&
        !isInitialMount.current &&
        userId === userIdRef.current &&
        filterAccount === filterAccountRef.current
      ) {
        return;
      }

      const loadingState = loadCount === 0 ? setIsLoading : setIsLoadingMore;
      loadingState(true);

      try {
        const url = new URL(`/api/insta/templates`, window.location.origin);
        url.searchParams.set("userId", userId);
        url.searchParams.set("loadMoreCount", loadCount.toString());

        if (filterAccount !== "all") {
          url.searchParams.set("filterAccount", filterAccount);
        }

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

          if (loadCount === 0) {
            setTemplates(formattedTemplates);
          } else {
            setTemplates((prev) => [...prev, ...formattedTemplates]);
          }

          setHasMoreTemplates(data.hasMore || false);
          setTotalTemplates(data.totalCount || 0);
          setLoadMoreCount(loadCount);

          // Update refs to track current state
          userIdRef.current = userId;
          filterAccountRef.current = filterAccount;
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        showErrorToast("Failed to load templates");
      } finally {
        loadingState(false);
        if (isInitialMount.current) {
          isInitialMount.current = false;
        }
      }
    },
    [userId, filterAccount]
  ); // Only depends on userId and filterAccount

  // Initial data fetch - runs only once on mount
  useEffect(() => {
    if (!userId || !isLoaded) return;

    fetchTemplates(0, true);
  }, [userId, isLoaded, fetchTemplates]); // Only runs when userId or isLoaded changes

  // Filter change effect - only runs when filterAccount changes
  useEffect(() => {
    if (!userId || isInitialMount.current) return;

    const timer = setTimeout(() => {
      fetchTemplates(0, true);
    }, 300); // Debounce filter changes

    return () => clearTimeout(timer);
  }, [filterAccount, fetchTemplates, userId]); // Only runs when filterAccount changes

  // Load more templates
  const loadMoreTemplates = async () => {
    if (!userId || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextLoadCount = loadMoreCount + 1;

    try {
      await fetchTemplates(nextLoadCount, false);
    } catch (error) {
      console.error("Error loading more templates:", error);
      showErrorToast("Failed to load more templates");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Fetch account media
  const fetchAccountMedia = async (accountId: string, username: string) => {
    if (!userId) return;

    setIsLoadingMedia(true);
    setSelectedAccountMedia([]);

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
        showErrorToast(
          "No media found",
          `No posts or reels found for @${username}`
        );
      }
    } catch (error: any) {
      console.error("Error fetching media:", error);
      showErrorToast("Failed to fetch media", error.message);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  // Handle account change
  const handleAccountChange = (username: string) => {
    setTemplateForm({
      ...templateForm,
      accountUsername: username,
      mediaId: "",
      mediaUrl: "",
    });
    setSelectedMedia(null);

    const account = accounts.find((acc) => acc.username === username);
    if (account && account.instagramId) {
      fetchAccountMedia(account.instagramId, username);
    } else {
      setSelectedAccountMedia([]);
      showErrorToast(
        "Account not connected",
        "This Instagram account is not properly connected to Facebook"
      );
    }
  };

  // Handle edit template
  const handleEditClick = (template: Template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      content: template.content,
      openDm: template.openDm,
      reply: template.reply,
      triggers: template.triggers,
      isFollow: template.isFollow,
      priority: template.priority,
      accountUsername: template.accountUsername,
      mediaId: template.mediaId,
      mediaUrl: template.mediaUrl,
    });
    setIsCreateDialogOpen(true);

    const account = accounts.find(
      (acc) => acc.username === template.accountUsername
    );
    if (account && account.instagramId) {
      fetchAccountMedia(account.instagramId, account.username);
      setSelectedMedia(template.mediaId);
    }
  };

  // Handle update template
  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !userId) return;

    setIsUpdatingTemplate(true);

    try {
      const templateId = editingTemplate._id;
      const response = await fetch(`/api/insta/templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...templateForm,
          isFollow: canFollow ? templateForm.isFollow : false,
          reply: templateForm.reply.filter((r) => r.trim() !== ""),
          content: templateForm.content.filter((c) => c.text.trim() !== ""),
          triggers: templateForm.triggers.filter((t) => t.trim() !== ""),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update template: ${response.status}`);
      }

      await fetchTemplates(0, true); // Force refresh after update
      setIsCreateDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
      showSuccessToast("Template updated successfully");
    } catch (error) {
      console.error("Error updating template:", error);
      showErrorToast("Failed to update template");
    } finally {
      setIsUpdatingTemplate(false);
    }
  };

  // Handle toggle template active state
  const handleToggleTemplate = async (templateId: string) => {
    if (!userId) return;

    try {
      const template = templates.find((t) => t._id === templateId);
      if (!template) return;

      const newActiveState = !template.isActive;

      const response = await fetch(`/api/insta/templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...template,
          isActive: newActiveState,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update template: ${response.status}`);
      }

      await fetchTemplates(0, true); // Force refresh after toggle
      showSuccessToast(
        `Template ${newActiveState ? "activated" : "deactivated"}`
      );
    } catch (error) {
      console.error("Error updating template:", error);
      showErrorToast("Failed to update template status");
    }
  };

  // Handle delete template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/insta/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.status}`);
      }

      await fetchTemplates(0, true); // Force refresh after delete
      showSuccessToast("Template deleted successfully");
    } catch (error) {
      console.error("Error deleting template:", error);
      showErrorToast("Failed to delete template");
    }
  };

  // Handle create template
  const handleCreateTemplate = async () => {
    if (!userId) return;

    setIsCreatingTemplate(true);

    try {
      // Validation
      if (!templateForm.name.trim()) {
        throw new Error("Template name is required");
      }

      if (!templateForm.accountUsername) {
        throw new Error("Please select an Instagram account");
      }

      if (!templateForm.mediaId) {
        throw new Error("Please select a post or reel for this template");
      }

      if (templateForm.reply.length < MIN_REPLIES) {
        throw new Error(`Please add at least ${MIN_REPLIES} replies`);
      }

      if (templateForm.reply.some((r) => !r.trim())) {
        throw new Error("All replies must have content");
      }

      if (templateForm.triggers.length === 0) {
        throw new Error("Please add at least one trigger");
      }

      if (templateForm.triggers.some((t) => !t.trim())) {
        throw new Error("All triggers must have content");
      }

      if (templateForm.content.length === 0) {
        throw new Error("Please add at least one DM content");
      }

      if (templateForm.content.some((c) => !c.text.trim() || !c.link?.trim())) {
        throw new Error("All DM content must have both text and link");
      }

      const selectedAccount = accounts.find(
        (acc) => acc.username === templateForm.accountUsername
      );

      if (!selectedAccount) {
        throw new Error("Selected account not found");
      }

      const response = await fetch("/api/insta/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          accountId: selectedAccount.instagramId,
          ...templateForm,
          isFollow: canFollow ? templateForm.isFollow : false,
          reply: templateForm.reply.filter((r) => r.trim() !== ""),
          content: templateForm.content.filter((c) => c.text.trim() !== ""),
          triggers: templateForm.triggers.filter((t) => t.trim() !== ""),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create template");
      }

      await fetchTemplates(0, true); // Force refresh after create
      setIsCreateDialogOpen(false);
      resetForm();
      showSuccessToast("Template created successfully");
    } catch (error: any) {
      console.error("Error creating template:", error);
      showErrorToast("Failed to create template", error.message);
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTemplateForm(INITIAL_TEMPLATE_FORM);
    setSelectedAccountMedia([]);
    setSelectedMedia(null);
    setEditingTemplate(null);
  };

  // Format last used time
  const formatLastUsed = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 60) {
        return `${diffInMinutes || 0}m ago`;
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60) || 0}h ago`;
      } else {
        return `${Math.floor(diffInMinutes / 1440) || 0}d ago`;
      }
    } catch {
      return "Never";
    }
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return templates;

    const searchLower = searchTerm.toLowerCase();
    return templates.filter((template) => {
      return (
        template.name.toLowerCase().includes(searchLower) ||
        template.content.some((c) =>
          c.text.toLowerCase().includes(searchLower)
        ) ||
        template.triggers.some((trigger) =>
          trigger.toLowerCase().includes(searchLower)
        ) ||
        template.reply.some((r) => r.toLowerCase().includes(searchLower)) ||
        template.openDm.toLowerCase().includes(searchLower)
      );
    });
  }, [templates, searchTerm]);

  // Form validation
  const isFormValid = useMemo(() => {
    const form = templateForm;

    const basicValid =
      form.name.trim() &&
      form.openDm.trim() &&
      form.accountUsername &&
      form.mediaId &&
      form.reply.length >= MIN_REPLIES &&
      form.reply.every((r) => r.trim()) &&
      form.triggers.length > 0 &&
      form.triggers.every((t) => t.trim()) &&
      form.content.length > 0 &&
      form.content.every((c) => c.text.trim() && c.link?.trim());

    return basicValid;
  }, [templateForm]);

  // Loading state
  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Render functions
  const renderMediaGrid = () => {
    if (isLoadingMedia) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]" />
        </div>
      );
    }

    if (selectedAccountMedia.length === 0) {
      return (
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-gray-400">
            No posts or reels found for this account
          </p>
          <p className="text-sm mt-2 text-gray-500">
            Make sure your Instagram account is connected to a Facebook Page
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-2">
        {selectedAccountMedia.map((media) => (
          <div
            key={media.id}
            className={`relative cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
              selectedMedia === media.id
                ? "border-[#00F0FF]"
                : themeStyles.inputBorder
            }`}
            onClick={() => {
              setSelectedMedia(media.id);
              setTemplateForm({
                ...templateForm,
                mediaId: media.id,
                mediaUrl: media.media_url,
              });
            }}
          >
            <Image
              src={media.media_url}
              alt="Post"
              height={160}
              width={160}
              className="w-full h-40 object-cover"
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
    );
  };

  const renderTemplateCard = (template: Template) => (
    <Card
      key={template._id}
      className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br ${
        template.isActive
          ? "from-[#B026FF]/20 to-[#B026FF]/5 border-[#B026FF]/20 hover:border-[#B026FF]/40"
          : "from-[#00F0FF]/10 to-[#00F0FF]/5 border-[#00F0FF]/20 hover:border-[#00F0FF]/40"
      } ${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <CardTitle
                className={`text-lg font-semibold ${themeStyles.textPrimary}`}
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
            <p className={`text-sm ${themeStyles.textMuted}`}>
              @{template.accountUsername}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={template.isActive}
              onCheckedChange={() => handleToggleTemplate(template._id)}
              className="data-[state=checked]:bg-[#00F0FF]"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(template)}
              className="text-gray-400 hover:text-white"
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
                className={`${themeStyles.dialogBg} ${themeStyles.cardBorder}`}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className={themeStyles.textPrimary}>
                    Delete Template
                  </AlertDialogTitle>
                  <AlertDialogDescription className={themeStyles.textMuted}>
                    Are you sure you want to delete {template.name}? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className={`${themeStyles.buttonOutlineBorder} ${themeStyles.buttonOutlineText}`}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteTemplate(template._id)}
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

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Replies Section */}
          <div>
            <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
              Comment Replies:
            </p>
            <div className="space-y-2">
              {template.reply.slice(0, 3).map((reply, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`w-full justify-start text-left ${themeStyles.inputBg} p-2 rounded-md ${themeStyles.textMuted}`}
                >
                  {reply}
                </Badge>
              ))}
            </div>
          </div>

          {/* Opening DM Section */}
          <div>
            <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
              Opening DM:
            </p>
            <Badge
              variant="outline"
              className={`w-full justify-start text-left ${themeStyles.inputBg} p-2 rounded-md ${themeStyles.textMuted} min-h-[80px]`}
            >
              {template.openDm}
            </Badge>
          </div>

          {/* DM Content Section */}
          <div>
            <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
              DM Content:
            </p>
            <div className="space-y-2">
              {template.content.map((content, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`w-full justify-start text-left ${themeStyles.inputBg} p-2 rounded-md ${themeStyles.textMuted}`}
                >
                  <div className="truncate">{content.text}</div>
                  {content.link && (
                    <div className="text-xs text-cyan-400 truncate mt-1">
                      <LinkIcon className="h-3 w-3 inline mr-1" />
                      {content.link}
                    </div>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Triggers & Info Section */}
          <div className="space-y-3">
            <div>
              <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
                Triggers:
              </p>
              <div className="flex flex-wrap gap-1">
                {template.triggers.map((trigger, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`${themeStyles.inputBorder} ${themeStyles.textMuted}`}
                  >
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
                Content For:
              </p>
              <Badge
                variant="outline"
                className={`${themeStyles.inputBorder} ${themeStyles.textMuted}`}
              >
                {template.isFollow ? "Followers Only" : "Everyone"}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div
                className={`flex items-center gap-1 text-sm ${themeStyles.textMuted}`}
              >
                <BarChart3 className="h-3 w-3" />
                {template.usageCount || 0} uses
              </div>
              <div className="text-xs text-gray-400">
                Last used:{" "}
                {formatLastUsed(template.lastUsed || new Date().toISOString())}
              </div>
            </div>
          </div>
        </div>

        {/* Media Preview */}
        {template.mediaUrl && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className={`text-sm ${themeStyles.textMuted} mb-2`}>
              Linked Media:
            </p>
            <div
              className={`relative w-24 h-24 rounded-md overflow-hidden border ${themeStyles.inputBorder}`}
            >
              <Image
                src={template.mediaUrl}
                alt="Linked media"
                height={96}
                width={96}
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
      </CardContent>
    </Card>
  );

  return (
    <div
      className={`min-h-screen ${themeStyles.containerBg} ${themeStyles.textPrimary}`}
    >
      <div className="container mx-auto px-2 md:px-4 py-8">
        <BreadcrumbsDefault />

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <div
              className={`inline-flex items-center ${
                currentTheme === "dark"
                  ? "bg-blue-100/10 text-blue-400 border-blue-400/30"
                  : "bg-blue-100 text-blue-600 border-blue-300"
              } border rounded-full px-4 py-1 mb-4`}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Template Management</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
              Reply Templates
            </h1>
            <p className={`${themeStyles.textSecondary} text-lg`}>
              Create and manage automated reply templates for your Instagram
              posts and reels
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:opacity-90 text-black">
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className={themeStyles.textPrimary}>
                  {editingTemplate ? "Edit Template" : "Create New Template"}
                </DialogTitle>
                <DialogDescription className={themeStyles.textMuted}>
                  {editingTemplate
                    ? "Update your automated replies and triggers"
                    : "Set up automated replies for specific Instagram posts or reels"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Template Name and Account */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className={themeStyles.textSecondary}>
                      Template Name
                    </Label>
                    <Input
                      id="name"
                      value={templateForm.name}
                      onChange={(e) =>
                        setTemplateForm({
                          ...templateForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g., Welcome Message"
                      className={themeStyles.inputBg}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="account"
                      className={themeStyles.textSecondary}
                    >
                      Account
                    </Label>
                    <Select
                      value={templateForm.accountUsername}
                      onValueChange={handleAccountChange}
                    >
                      <SelectTrigger className={themeStyles.inputBg}>
                        <SelectValue placeholder="Choose account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem
                            key={account.instagramId}
                            value={account.username}
                            disabled={!account.instagramId}
                          >
                            {account.username}
                            {!account.instagramId && " (Not Connected)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Media Selection */}
                {templateForm.accountUsername && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className={themeStyles.textSecondary}>
                        Select Post or Reel
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const account = accounts.find(
                            (acc) =>
                              acc.username === templateForm.accountUsername
                          );
                          if (account) {
                            fetchAccountMedia(
                              account.instagramId,
                              account.username
                            );
                          }
                        }}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </div>
                    {renderMediaGrid()}
                  </div>
                )}

                {/* Comment Replies */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className={themeStyles.textSecondary}>
                      Comment Replies (Add at least {MIN_REPLIES})
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTemplateForm({
                          ...templateForm,
                          reply: [...templateForm.reply, ""],
                        });
                      }}
                      disabled={templateForm.reply.length >= 10}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Reply
                    </Button>
                  </div>

                  {templateForm.reply.map((reply, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label
                          htmlFor={`reply-${index}`}
                          className={themeStyles.textSecondary}
                        >
                          Reply {index + 1}
                        </Label>
                        {templateForm.reply.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedReply = [...templateForm.reply];
                              updatedReply.splice(index, 1);
                              setTemplateForm({
                                ...templateForm,
                                reply: updatedReply,
                              });
                            }}
                            className="h-6 w-6 p-0 text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        id={`reply-${index}`}
                        value={reply}
                        onChange={(e) => {
                          const updatedReply = [...templateForm.reply];
                          updatedReply[index] = e.target.value;
                          setTemplateForm({
                            ...templateForm,
                            reply: updatedReply,
                          });
                        }}
                        placeholder="e.g., Nice! Check your DMs!"
                      />
                    </div>
                  ))}
                </div>

                {/* Opening DM */}
                <div className="space-y-2">
                  <Label htmlFor="openDm" className={themeStyles.textSecondary}>
                    Opening DM
                  </Label>
                  <Textarea
                    id="openDm"
                    value={templateForm.openDm}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        openDm: e.target.value,
                      })
                    }
                    placeholder="Hey there! I'm so happy you're here..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* DM Content */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className={themeStyles.textSecondary}>
                      DM Content
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTemplateForm({
                          ...templateForm,
                          content: [
                            ...templateForm.content,
                            { text: "", link: "" },
                          ],
                        });
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Content
                    </Button>
                  </div>

                  {templateForm.content.map((content, index) => (
                    <div
                      key={index}
                      className="space-y-2 border p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <Label className={themeStyles.textSecondary}>
                          Content {index + 1}
                        </Label>
                        {templateForm.content.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedContent = [...templateForm.content];
                              updatedContent.splice(index, 1);
                              setTemplateForm({
                                ...templateForm,
                                content: updatedContent,
                              });
                            }}
                            className="h-6 w-6 p-0 text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={content.text}
                        onChange={(e) => {
                          const updatedContent = [...templateForm.content];
                          updatedContent[index] = {
                            ...updatedContent[index],
                            text: e.target.value,
                          };
                          setTemplateForm({
                            ...templateForm,
                            content: updatedContent,
                          });
                        }}
                        placeholder="Message text..."
                        className="min-h-[80px]"
                      />
                      <div className="flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <Input
                          value={content.link || ""}
                          onChange={(e) => {
                            const updatedContent = [...templateForm.content];
                            updatedContent[index] = {
                              ...updatedContent[index],
                              link: e.target.value,
                            };
                            setTemplateForm({
                              ...templateForm,
                              content: updatedContent,
                            });
                          }}
                          placeholder="Link (e.g., https://example.com)"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Triggers */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className={themeStyles.textSecondary}>
                      Triggers (up to {MAX_TRIGGERS})
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (templateForm.triggers.length < MAX_TRIGGERS) {
                          setTemplateForm({
                            ...templateForm,
                            triggers: [...templateForm.triggers, ""],
                          });
                        }
                      }}
                      disabled={templateForm.triggers.length >= MAX_TRIGGERS}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Trigger
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {templateForm.triggers.map((trigger, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs">Trigger {index + 1}</Label>
                          {templateForm.triggers.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedTriggers = [
                                  ...templateForm.triggers,
                                ];
                                updatedTriggers.splice(index, 1);
                                setTemplateForm({
                                  ...templateForm,
                                  triggers: updatedTriggers,
                                });
                              }}
                              className="h-5 w-5 p-0 text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <Input
                          value={trigger}
                          onChange={(e) => {
                            const updatedTriggers = [...templateForm.triggers];
                            updatedTriggers[index] = e.target.value;
                            setTemplateForm({
                              ...templateForm,
                              triggers: updatedTriggers,
                            });
                          }}
                          placeholder="e.g., Price, Link"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow Requirement */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      Require follow before sending link
                    </p>
                    <p className="text-sm text-gray-500">
                      User must follow your account before receiving the link
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        canFollow
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {canFollow ? "Available" : "Paid Feature"}
                    </Badge>
                    <Switch
                      checked={templateForm.isFollow}
                      onCheckedChange={(checked) =>
                        setTemplateForm({ ...templateForm, isFollow: checked })
                      }
                      disabled={!canFollow}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label
                    htmlFor="priority"
                    className={themeStyles.textSecondary}
                  >
                    Priority (1-{PRIORITY_MAX})
                  </Label>
                  <Input
                    id="priority"
                    type="number"
                    min={PRIORITY_MIN}
                    max={PRIORITY_MAX}
                    value={templateForm.priority}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setTemplateForm({
                        ...templateForm,
                        priority: isNaN(value)
                          ? 5
                          : Math.min(
                              Math.max(value, PRIORITY_MIN),
                              PRIORITY_MAX
                            ),
                      });
                    }}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={
                    editingTemplate
                      ? handleUpdateTemplate
                      : handleCreateTemplate
                  }
                  disabled={
                    !isFormValid || isCreatingTemplate || isUpdatingTemplate
                  }
                  className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:opacity-90"
                >
                  {isCreatingTemplate || isUpdatingTemplate ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.instagramId} value={account.username}>
                  {account.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Count */}
        <div className="mb-6">
          <p className="text-gray-500">
            Showing {filteredTemplates.length} of {totalTemplates} templates
          </p>
        </div>

        {/* Templates Grid */}
        <div className="space-y-6">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(renderTemplateCard)
          ) : (
            <Card
              className={`card-hover ${themeStyles.cardBg} ${themeStyles.cardBorder}`}
            >
              <CardContent className="text-center py-12">
                {accounts.length === 0 ? (
                  <>
                    {" "}
                    <div
                      className={`mx-auto w-24 h-24 ${
                        theme === "dark" ? "bg-white/5" : "bg-gray-100"
                      } rounded-full flex items-center justify-center mb-4`}
                    >
                      <Instagram className="h-12 w-12 text-gray-400 mx-auto " />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No accounts connected
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Connect your first Instagram account to start automating
                      replies
                    </p>
                    <Button asChild className="btn-gradient-cyan">
                      <Link href="/insta/accounts/add">
                        <Plus className="mr-2 h-4 w-4" />
                        Connect Account
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div
                      className={`mx-auto w-24 h-24 ${
                        theme === "dark" ? "bg-white/5" : "bg-gray-100"
                      } rounded-full flex items-center justify-center mb-4`}
                    >
                      <MessageSquare className="h-8 w-8 text-gray-500" />
                    </div>{" "}
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm || filterAccount !== "all"
                        ? "No templates match your filters"
                        : "No templates yet"}
                    </h3>
                    <p className="text-gray-500 mb-4 ">
                      {searchTerm || filterAccount !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Create your first reply template to start automating responses"}
                    </p>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="btn-gradient-cyan"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Template
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Load More Button */}
          {hasMoreTemplates && filteredTemplates.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={loadMoreTemplates}
                disabled={isLoadingMore}
                variant="outline"
                className="px-8 py-3"
              >
                {isLoadingMore ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                    Loading...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Load More ({totalTemplates - filteredTemplates.length} more)
                  </div>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
