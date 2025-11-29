"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { getInstaSubscriptionInfo } from "@/lib/action/subscription.action";

interface accountDataType {
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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any>([]);
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const [hasMoreTemplates, setHasMoreTemplates] = useState(false);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAccount, setFilterAccount] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [accounts, setAccounts] = useState<accountDataType[]>([]);
  const [selectedAccountMedia, setSelectedAccountMedia] = useState<MediaItem[]>(
    []
  );
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isTemplateCreating, setIsTemplateCreting] = useState(false);
  const [isUpdateTemplate, setIsUpdateTempalte] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canFollow, setCanFollow] = useState(false);
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  // Theme-based styles
  const containerBg = theme === "dark" ? "bg-transperant" : "bg-gray-50";
  const textPrimary = theme === "dark" ? "text-white" : "text-n-7";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-n-5";
  const textMuted = theme === "dark" ? "text-gray-400" : "text-n-5";
  const cardBg = theme === "dark" ? "bg-[#0a0a0a]/60" : "bg-white/80";
  const cardBorder = theme === "dark" ? "border-white/10" : "border-gray-200";
  const badgeBg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-white";
  const alertBg = theme === "dark" ? "bg-[#6d1717]/5" : "bg-red-50/80";
  const buttonOutlineBorder =
    theme === "dark" ? "border-white/20" : "border-gray-300";
  const buttonOutlineText = theme === "dark" ? "text-gray-300" : "text-n-6";
  const dialogBg = theme === "dark" ? "bg-[#0a0a0a]/95" : "bg-white/95";
  const inputBg = theme === "dark" ? "bg-white/5" : "bg-white";
  const inputBorder = theme === "dark" ? "border-white/20" : "border-gray-300";
  const inputText = theme === "dark" ? "text-white" : "text-n-5";

  // Updated template form state - content is now array of objects
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: [
      { text: "This Is the link you want,Click the button below.", link: "" },
    ],
    openDm:
      "Hey there! I’m so happy you’re here, thanks so much for your interest 😊 Click below and I’ll send you the link in just a sec ✨",
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
  });

  useEffect(() => {
    if (!isLoaded) {
      return; // Wait for auth to load
    }
    if (!userId) {
      router.push("/sign-in");
      return;
    }
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`/api/insta/accounts?userId=${userId}`);
        if (response.ok) {
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
        } else {
          setAccounts([]);
        }
      } catch (error) {
        setAccounts([]);
      }
    };
    fetchAccounts();
  }, [router, userId, isLoaded]);

  // Fetch templates with loadMoreCount
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);

    try {
      const url = new URL(
        `/api/insta/templates?userId=${userId}`,
        window.location.origin
      );
      url.searchParams.set("loadMoreCount", "0"); // Always start from 0 for initial load
      if (filterAccount !== "all")
        url.searchParams.set("filterAccount", filterAccount);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        if (data.templates && Array.isArray(data.templates)) {
          const formattedTemplates = data.templates.map((template: any) => ({
            ...template,
            lastUsed: template.lastUsed
              ? new Date(template.lastUsed).toISOString()
              : new Date().toISOString(),
            successRate: template.successRate || 0,
          }));

          setTemplates(formattedTemplates);
          setHasMoreTemplates(data.hasMore);
          setTotalTemplates(data.totalCount);
          setLoadMoreCount(0); // Reset to 0 for initial load
        }
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterAccount, userId]);

  // Load initial templates
  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const subs = await getInstaSubscriptionInfo(userId);
        if (!subs || subs.length === 0) {
          setCanFollow(false);
        } else {
          setCanFollow(true);
        }
        await fetchTemplates();
      }
    };

    fetchData();
  }, [userId, fetchTemplates]);

  // Reload templates when filters change
  useEffect(() => {
    if (userId) {
      fetchTemplates();
    }
  }, [filterAccount, fetchTemplates, userId]);

  // Load more templates
  const loadMoreTemplates = async () => {
    setIsLoadingMore(true);
    const nextLoadCount = loadMoreCount + 1;

    try {
      const url = new URL(
        `/api/insta/templates?userId=${userId}`,
        window.location.origin
      );
      url.searchParams.set("loadMoreCount", nextLoadCount.toString());
      if (filterAccount !== "all")
        url.searchParams.set("filterAccount", filterAccount);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        if (data.templates && Array.isArray(data.templates)) {
          const formattedTemplates = data.templates.map((template: any) => ({
            ...template,
            lastUsed: template.lastUsed
              ? new Date(template.lastUsed).toISOString()
              : new Date().toISOString(),
            successRate: template.successRate || 0,
          }));

          // CORRECTLY APPEND NEW TEMPLATES TO EXISTING ONES
          setTemplates((prevTemplates: any) => [
            ...prevTemplates,
            ...formattedTemplates,
          ]);
          setHasMoreTemplates(data.hasMore);
          setTotalTemplates(data.totalCount);
          setLoadMoreCount(nextLoadCount);
        }
      } else {
        console.error("Failed to load more templates");
      }
    } catch (error) {
      console.error("Error loading more templates:", error);
      toast({
        title: "Failed to load more templates",
        description: "Please try again",
        duration: 3000,
        className: "error-toast",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchAccountMedia = async (accountId: string, username: string) => {
    setIsLoadingMedia(true);
    try {
      const response = await fetch(
        `/api/insta/media?accountId=${accountId}&userId=${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.media && data.media.length > 0) {
          setSelectedAccountMedia(data.media);
        } else {
          setSelectedAccountMedia([]);
          toast({
            title: "No media found",
            description: `No posts or reels found for @${username}`,
            duration: 3000,
            className: "info-toast",
          });
        }
      } else {
        const errorData = await response.json();
        setSelectedAccountMedia([]);
        toast({
          title: "Failed to fetch media",
          description:
            errorData.error || "Could not load Instagram posts and reels",
          duration: 3000,
          className: "error-toast",
        });
      }
    } catch (error) {
      setSelectedAccountMedia([]);
      toast({
        title: "Error fetching media",
        description: "Please try again later",
        duration: 3000,
        className: "error-toast",
      });
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleAccountChange = (username: string) => {
    setNewTemplate({
      ...newTemplate,
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
      toast({
        title: "Account not connected",
        description:
          "This Instagram account is not properly connected to Facebook",
        duration: 3000,
        className: "error-toast",
      });
    }
  };

  const handleEditClick = (template: any) => {
    setEditingTemplate(template);
    setIsCreateDialogOpen(true);

    // If editing, fetch media for the account
    const account = accounts.find(
      (acc) => acc.username === template.accountUsername
    );
    if (account && account.instagramId) {
      fetchAccountMedia(account.instagramId, account.username);
      setSelectedMedia(template.mediaId || null);
    }
  };

  const handleUpdateTemplate = async (template: any) => {
    try {
      setIsUpdateTempalte(true);
      const templateId = template._id;
      const response = await fetch(`/api/insta/templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...template,
          isFollow: canFollow ? template.isFollow : false,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        // Refresh templates after update
        fetchTemplates();
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
    } finally {
      setIsUpdateTempalte(false);
    }
  };

  const handleToggleTemplate = async (templateId: string) => {
    try {
      const template = templates.find((t: any) => t._id === templateId);
      if (!template) return;

      const newActiveState = !template.isActive;

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

      if (response.ok) {
        // Refresh templates after toggle
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/insta/templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh templates after delete
        fetchTemplates();
      } else {
        console.error("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setIsTemplateCreting(true);
      const selectedAccount = accounts.find(
        (acc) => acc.username === newTemplate.accountUsername
      );
      if (!selectedAccount) {
        toast({
          title: "Account not found",
          description: "Please select a valid Instagram account",
          duration: 3000,
          className: "error-toast",
        });
        return;
      }

      if (!newTemplate.mediaId) {
        toast({
          title: "Media required",
          description: "Please select a post or reel for this template",
          duration: 3000,
          className: "error-toast",
        });
        return;
      }

      const response = await fetch("/api/insta/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          accountId: selectedAccount.instagramId,
          ...newTemplate,
          isFollow: canFollow ? newTemplate.isFollow : false,
          reply: newTemplate.reply.filter((r) => r.trim() !== ""),
          content: newTemplate.content.filter((c) => c.text.trim() !== ""),
          triggers: newTemplate.triggers.filter((t) => t.trim() !== ""),
        }),
      });
      const result = await response.json();
      if (response.ok && result.ok) {
        // Refresh templates after create
        fetchTemplates();
        setIsCreateDialogOpen(false);

        toast({
          title: "Template created successfully",
          duration: 3000,
          className: "success-toast",
        });
        setNewTemplate({
          name: "",
          openDm: "",
          content: [{ text: "", link: "" }],
          reply: [""],
          isFollow: false,
          triggers: [""],
          priority: 5,
          accountUsername: "",
          mediaId: "",
          mediaUrl: "",
        });
        setSelectedMedia(null);
        setSelectedAccountMedia([]);
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
    } finally {
      setIsTemplateCreting(false);
    }
  };

  const formatLastUsed = (dateString: string) => {
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
  };
  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content
        .join(", ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      template.triggers.some((trigger: any) =>
        trigger.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesSearch;
  });

  if (isLoading || !isLoaded) {
    return (
      <div
        className={`min-h-screen ${textPrimary} flex items-center justify-center ${containerBg}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto mb-4"></div>
          <p className={textSecondary}>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${textPrimary} ${containerBg}`}>
      <div className="container mx-auto p-2 md:px-4 py-8">
        <BreadcrumbsDefault />
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 lg:gap-0 mb-8">
          <div>
            <div
              className={`inline-flex items-center ${
                theme === "dark"
                  ? "bg-blue-100/10 text-blue-400 border-blue-400/30"
                  : "bg-blue-100 text-blue-600 border-blue-300"
              } border rounded-full px-4 py-1 mb-4`}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Template Management</span>
            </div>
            <h1
              className={`text-4xl font-bold mb-2 gradient-text-main ${textPrimary}`}
            >
              Reply Templates
            </h1>
            <p
              className={`${textSecondary} text-lg font-light font-montserrat`}
            >
              Create and manage automated reply templates for your Instagram
              posts and reels
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setEditingTemplate(null);
                setSelectedAccountMedia([]);
                setSelectedMedia(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="btn-gradient-cyan hover:opacity-90 hover:shadow-cyan-500 shadow-lg transition-opacity">
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent
              className={`sm:max-w-[800px] bg-transparent bg-gradient-to-br border-[#B026FF]/20 hover:border-[#B026FF]/40 backdrop-blur-md border max-h-[95vh] overflow-y-auto ${dialogBg}`}
            >
              <DialogHeader>
                <DialogTitle className={textPrimary}>
                  {editingTemplate ? "Edit Template" : "Create New Template"}
                </DialogTitle>
                <DialogDescription
                  className={`${textMuted} text-lg font-montserrat`}
                >
                  {editingTemplate
                    ? "Update your automated replies and triggers"
                    : "Set up automated replies for specific Instagram posts or reels"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className={textSecondary}>
                      Template Name
                    </Label>
                    {editingTemplate ? (
                      <div
                        className={`px-3 py-2 ${inputBg} ${inputBorder} rounded-md ${textMuted} font-montserrat`}
                      >
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
                        className={`${inputBg} ${inputBorder} ${inputText} font-montserrat`}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account" className={textSecondary}>
                      Account
                    </Label>
                    {editingTemplate ? (
                      <div
                        className={`px-3 py-2 ${inputBg} ${inputBorder} rounded-md ${textMuted} font-montserrat`}
                      >
                        {accounts.find(
                          (a) => a.username === editingTemplate.accountUsername
                        )?.username || editingTemplate.accountUsername}
                      </div>
                    ) : (
                      <Select
                        value={newTemplate.accountUsername}
                        onValueChange={handleAccountChange}
                      >
                        <SelectTrigger
                          className={`${inputBg} ${inputBorder} ${inputText} font-montserrat`}
                        >
                          <SelectValue
                            className={`${inputText} block font-montserrat`}
                            placeholder="Choose account"
                          />
                        </SelectTrigger>
                        <SelectContent
                          className={`block font-montserrat ${dialogBg}`}
                        >
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
                    )}
                  </div>
                </div>

                {/* Media Selection */}
                {newTemplate.accountUsername && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className={textSecondary}>
                        Select Post or Reel
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const account = accounts.find(
                            (acc) =>
                              acc.username === newTemplate.accountUsername
                          );
                          if (account) {
                            fetchAccountMedia(
                              account.instagramId,
                              account.username
                            );
                          }
                        }}
                        className={`${buttonOutlineBorder} ${buttonOutlineText} hover:bg-cyan-300/10`}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </div>
                    {isLoadingMedia ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]"></div>
                      </div>
                    ) : selectedAccountMedia.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-max overflow-y-auto no-scrollbar p-2">
                        {selectedAccountMedia.map((media) => (
                          <div
                            key={media.id}
                            className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${
                              selectedMedia === media.id
                                ? "border-[#00F0FF]"
                                : inputBorder
                            } transition-all`}
                            onClick={() => {
                              setSelectedMedia(media.id);
                              setNewTemplate({
                                ...newTemplate,
                                mediaId: media.id,
                                mediaUrl: media.media_url,
                              });
                            }}
                          >
                            <Image
                              src={media.media_url}
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
                        className={`text-center py-8 ${textMuted} font-montserrat`}
                      >
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No posts or reels found for this account</p>
                        <p className="text-sm mt-2">
                          Make sure your Instagram account is connected to a
                          Facebook Page
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Multi-Comment Reply Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className={textSecondary}>
                      reply to their comments under the post. ( Add atleast 3
                      reply )
                    </Label>
                    {(!editingTemplate ||
                      (editingTemplate.reply &&
                        editingTemplate.reply.length < 3)) && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (editingTemplate) {
                            setEditingTemplate({
                              ...editingTemplate,
                              reply: [...(editingTemplate.reply || []), ""],
                            });
                          } else {
                            setNewTemplate({
                              ...newTemplate,
                              reply: [...(newTemplate.reply || []), ""],
                            });
                          }
                        }}
                        className={`${buttonOutlineBorder} ${buttonOutlineText} hover:bg-cyan-300/10`}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add Reply
                      </Button>
                    )}
                  </div>

                  {(editingTemplate
                    ? editingTemplate.reply
                    : newTemplate.reply
                  )?.map((reply: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <Label
                          htmlFor={`Dm reply-${index}`}
                          className={textSecondary}
                        >
                          Reply {index + 1}
                        </Label>
                        {(editingTemplate
                          ? editingTemplate.reply
                          : newTemplate.reply
                        )?.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updatedReply = editingTemplate
                                ? [...editingTemplate.reply]
                                : [...newTemplate.reply];
                              updatedReply.splice(index, 1);

                              if (editingTemplate) {
                                setEditingTemplate({
                                  ...editingTemplate,
                                  reply: updatedReply,
                                });
                              } else {
                                setNewTemplate({
                                  ...newTemplate,
                                  reply: updatedReply,
                                });
                              }
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
                          const updatedReply = editingTemplate
                            ? [...editingTemplate.reply]
                            : [...newTemplate.reply];

                          updatedReply[index] = e.target.value;

                          if (editingTemplate) {
                            setEditingTemplate({
                              ...editingTemplate,
                              reply: updatedReply,
                            });
                          } else {
                            setNewTemplate({
                              ...newTemplate,
                              reply: updatedReply,
                            });
                          }
                        }}
                        placeholder="Eg.Nice! Check your DMs!"
                        className={` ${inputBg} ${inputBorder} ${inputText} font-montserrat`}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className={textSecondary}>
                    An opening DM
                  </Label>
                  <Textarea
                    id="openDm"
                    value={
                      editingTemplate
                        ? editingTemplate.openDm || ""
                        : newTemplate.openDm || ""
                    }
                    onChange={(e) => {
                      if (editingTemplate) {
                        setEditingTemplate({
                          ...editingTemplate,
                          openDm: e.target.value,
                        });
                      } else {
                        setNewTemplate({
                          ...newTemplate,
                          openDm: e.target.value,
                        });
                      }
                    }}
                    placeholder="Hey there! I’m so happy you’re here, thanks so much for your interest 😊 Click below and I’ll send you the link in just a sec ✨"
                    className={`${inputBg} ${inputBorder} ${inputText} font-montserrat`}
                  />
                </div>
                {/* Multi-DmReply Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className={textSecondary}>
                      Get reply in Direct Dm{" "}
                    </Label>
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
                                { text: "", link: "" },
                              ],
                            });
                          } else {
                            setNewTemplate({
                              ...newTemplate,
                              content: [
                                ...(newTemplate.content || []),
                                { text: "", link: "" },
                              ],
                            });
                          }
                        }}
                        className={`${buttonOutlineBorder} ${buttonOutlineText} hover:bg-cyan-300/10 font-montserrat`}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add Reply
                      </Button>
                    )}
                  </div>

                  {(editingTemplate
                    ? editingTemplate.content
                    : newTemplate.content
                  )?.map((content: ContentItem, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <Label
                          htmlFor={`content-${index}`}
                          className={textSecondary}
                        >
                          Sent Dm {index + 1}
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
                            className="text-red-500 bg-red-100 hover:bg-red-500/10 h-6 w-6"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        )}
                      </div>

                      {/* Text input for the content text */}
                      <Textarea
                        id={`content-text-${index}`}
                        value={content.text}
                        onChange={(e) => {
                          const updatedContent = editingTemplate
                            ? [...editingTemplate.content]
                            : [...newTemplate.content];

                          updatedContent[index] = {
                            ...updatedContent[index],
                            text: e.target.value,
                          };

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
                        placeholder="This Is the link you want,Click the button below."
                        className={`min-h-[80px] ${inputBg} ${inputBorder} ${inputText} font-montserrat`}
                      />

                      {/* Link input for the content link */}
                      <div className="flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <Input
                          id={`content-link-${index}`}
                          value={content.link || ""}
                          onChange={(e) => {
                            const updatedContent = editingTemplate
                              ? [...editingTemplate.content]
                              : [...newTemplate.content];

                            updatedContent[index] = {
                              ...updatedContent[index],
                              link: e.target.value,
                            };

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
                          placeholder="Eg.www.yourlink.com"
                          className={`${inputBg} ${inputBorder} ${inputText} font-montserrat`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className={` flex items-center justify-between gap-8 p-3 border rounded-md ${inputBg} ${inputBorder} ${inputText} font-montserrat`}
                >
                  <p> a DM asking to follow you before they get the link</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-blue-700 px-1 rounded-sm">Paid</div>
                    <Switch
                      disabled={!canFollow}
                      checked={
                        editingTemplate
                          ? editingTemplate.isFollow
                          : newTemplate.isFollow
                      }
                      onCheckedChange={() => {
                        if (editingTemplate) {
                          setEditingTemplate({
                            ...editingTemplate,
                            isFollow: !editingTemplate.isFollow,
                          });
                        } else {
                          setNewTemplate({
                            ...newTemplate,
                            isFollow: !newTemplate.isFollow,
                          });
                        }
                      }}
                      className="self-start  data-[state=checked]:bg-[#00F0FF]"
                    />
                  </div>
                </div>
                {/* Triggers Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="triggers" className={textSecondary}>
                      Set triggers (up to 3)
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
                        className={`${buttonOutlineBorder} ${buttonOutlineText} hover:bg-cyan-300/10`}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add Trigger
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-start w-full gap-5">
                    {(editingTemplate
                      ? editingTemplate.triggers
                      : newTemplate.triggers
                    )?.map((trigger: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <Label
                            htmlFor={`trigger-${index}`}
                            className={textSecondary}
                          >
                            Trigger {index + 1}
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
                                const updatedTriggers = editingTemplate
                                  ? [...editingTemplate.triggers]
                                  : [...newTemplate.triggers];
                                updatedTriggers.splice(index, 1);

                                if (editingTemplate) {
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    triggers: updatedTriggers,
                                  });
                                } else {
                                  setNewTemplate({
                                    ...newTemplate,
                                    triggers: updatedTriggers,
                                  });
                                }
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
                            const updatedTriggers = editingTemplate
                              ? [...editingTemplate.triggers]
                              : [...newTemplate.triggers];

                            updatedTriggers[index] = e.target.value;

                            if (editingTemplate) {
                              setEditingTemplate({
                                ...editingTemplate,
                                triggers: updatedTriggers,
                              });
                            } else {
                              setNewTemplate({
                                ...newTemplate,
                                triggers: updatedTriggers,
                              });
                            }
                          }}
                          placeholder="Enter trigger keyword Like Link,Product,etc"
                          className={`${inputBg} ${inputBorder} ${inputText} max-w-max font-montserrat`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className={textSecondary}>
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
                    className={`${inputBg} ${inputBorder} ${inputText} font-montserrat`}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingTemplate(null);
                    setSelectedAccountMedia([]);
                    setSelectedMedia(null);
                  }}
                  className={`${buttonOutlineBorder} ${buttonOutlineText}`}
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
                  disabled={
                    isTemplateCreating ||
                    isUpdateTemplate ||
                    (editingTemplate
                      ? !editingTemplate.name ||
                        !editingTemplate.openDm ||
                        !editingTemplate.accountUsername ||
                        !editingTemplate.mediaId ||
                        editingTemplate.reply.length === 0 ||
                        editingTemplate.reply.some(
                          (r: any) => r.trim() === ""
                        ) ||
                        editingTemplate.triggers.length === 0 ||
                        editingTemplate.triggers.some(
                          (t: any) => t.trim() === ""
                        ) ||
                        editingTemplate.content.length === 0 ||
                        editingTemplate.content.some(
                          (c: ContentItem) =>
                            c.text.trim() === "" || c.link!.trim() === ""
                        )
                      : !newTemplate.name ||
                        !newTemplate.openDm ||
                        !newTemplate.accountUsername ||
                        !newTemplate.mediaId ||
                        newTemplate.reply.length === 0 ||
                        newTemplate.reply.some((r) => r.trim() === "") ||
                        newTemplate.triggers.length === 0 ||
                        newTemplate.triggers.some((t) => t.trim() === "") ||
                        newTemplate.content.length === 0 ||
                        newTemplate.content.some(
                          (c: ContentItem) =>
                            c.text.trim() === "" || c.link!.trim() === ""
                        ))
                  }
                >
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${textMuted}`}
            />
            <Input
              placeholder="Search templates, content, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${inputBg} ${inputBorder} ${inputText} text-base font-light font-montserrat`}
            />
          </div>
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger
              className={`w-48 ${inputBg} ${inputBorder} ${inputText}`}
            >
              <SelectValue placeholder="Filter by account" />
            </SelectTrigger>
            <SelectContent className={dialogBg}>
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
          <p className={textMuted}>
            Showing {templates.length} of {totalTemplates} templates
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6">
          {filteredTemplates.map((template: any) => (
            <Card
              key={template._id}
              className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br ${
                template.isActive
                  ? "from-[#B026FF]/20 to-[#B026FF]/5 border-[#B026FF]/20 hover:border-[#B026FF]/40"
                  : "from-[#00F0FF]/10 to-[#00F0FF]/5 border-[#00F0FF]/20 hover:border-[#00F0FF]/40"
              } ${cardBg} backdrop-blur-sm ${cardBorder}`}
            >
              <CardHeader className="pb-3 p-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <CardTitle
                        className={`text-base font-normal ${textPrimary}`}
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
                        className={`text-xs ${inputBorder} ${textMuted}`}
                      >
                        Priority {template.priority}
                      </Badge>
                    </div>
                    <p className={`text-sm ${textMuted}`}>
                      @{template.accountUsername}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Switch
                      checked={template.isActive}
                      onCheckedChange={() => {
                        handleToggleTemplate(template._id);
                      }}
                      className="data-[state=checked]:bg-[#00F0FF]"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${textMuted} hover:${textPrimary}`}
                      onClick={() => handleEditClick(template)}
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
                        className={`${dialogBg} ${cardBorder}`}
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle className={textPrimary}>
                            Delete Template
                          </AlertDialogTitle>
                          <AlertDialogDescription className={textMuted}>
                            Are you sure you want to delete {template.name}?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            className={`${buttonOutlineBorder} ${buttonOutlineText}`}
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

              <CardContent className="flex flex-col items-start p-2 w-full">
                <div className="flex flex-col md:flex-row-reverse items-start justify-between gap-3 w-full">
                  {template.mediaUrl && (
                    <div className="w-full flex-1">
                      <p className={`text-sm ${textMuted} mb-2`}>
                        Linked Media:
                      </p>
                      <div
                        className={`relative w-40 h-40 rounded-md overflow-hidden border ${inputBorder} mb-2`}
                      >
                        <Image
                          src={template.mediaUrl}
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
                    <p className={`text-sm ${textMuted} mb-2`}>
                      reply to their comments:
                    </p>
                    <div className="flex flex-wrap items-center justify-start w-full gap-2">
                      {template.reply.map((reply: any, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`${inputBg} p-3 rounded-md ${textMuted} text-wrap text-base font-light font-montserrat`}
                        >
                          {reply}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className=" flex-1">
                    <p className={`text-sm ${textMuted} mb-2`}>An opening DM</p>
                    <div className="flex ">
                      <Badge
                        variant="outline"
                        className={`flex flex-col items-start justify-center ${textMuted} ${inputBg} p-3 rounded-md `}
                      >
                        <p className="text-base font-light font-montserrat">
                          {template.openDm}
                        </p>
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <p className={`text-sm ${textMuted} mb-2`}>
                        Reply send in Dm:
                      </p>
                      <div className="flex flex-col gap-2">
                        {template.content.map(
                          (content: ContentItem, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={`flex flex-col items-start ${inputBg} p-3 rounded-md ${textMuted}`}
                            >
                              <p className="text-base font-light font-montserrat">
                                {content.text}
                              </p>
                              {content.link && (
                                <p className="text-xs text-cyan-400 mt-1 truncate">
                                  <LinkIcon className="h-3 w-3 inline mr-1" />
                                  {content.link.length > 30
                                    ? content.link.substring(0, 30) + "..."
                                    : content.link}
                                </p>
                              )}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div className="pb-2 w-full">
                      <p className={`text-sm ${textMuted} mb-2`}>
                        Trigger Keywords:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.triggers.map(
                          (trigger: any, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={`text-base font-light font-montserrat ${inputBorder} ${textMuted}`}
                            >
                              {trigger}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div className="pb-2 w-full">
                      <p className={`text-sm ${textMuted} mb-2`}>
                        Content For:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.isFollow ? (
                          <Badge
                            variant="outline"
                            className={`text-base font-light font-montserrat ${inputBorder} ${textMuted}`}
                          >
                            Followers Only
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`text-base font-light font-montserrat ${inputBorder} ${textMuted}`}
                          >
                            Everyone
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 w-full">
                  <div
                    className={`flex items-center gap-6 text-sm ${textMuted}`}
                  >
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {template?.usageCount || 0} uses
                    </div>
                    <div>
                      Last used: {formatLastUsed(template.lastUsed) || 1}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

          {/* No templates states */}
          {accounts.length === 0 && (
            <Card className={`card-hover ${cardBg} ${cardBorder}`}>
              <CardContent className="text-center py-12">
                <div
                  className={`mx-auto w-24 h-24 ${
                    theme === "dark" ? "bg-white/5" : "bg-gray-100"
                  } rounded-full flex items-center justify-center mb-4`}
                >
                  <Instagram className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>
                  No accounts connected
                </h3>
                <p className={`${textMuted} mb-4 font-mono`}>
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
          {accounts.length > 0 && templates.length === 0 && (
            <Card className={`card-hover ${cardBg} ${cardBorder}`}>
              <CardContent className="text-center py-12">
                <div
                  className={`mx-auto w-24 h-24 ${
                    theme === "dark" ? "bg-white/5" : "bg-gray-100"
                  } rounded-full flex items-center justify-center mb-4`}
                >
                  <MessageSquare className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>
                  {searchTerm || filterAccount !== "all"
                    ? "No templates match your filters"
                    : "No templates yet"}
                </h3>
                <p className={`${textMuted} mb-4 font-mono`}>
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
