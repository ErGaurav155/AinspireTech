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
  getCachedAccountById,
  isCacheValid,
  InstagramAccount,
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
import { toast } from "@/components/ui/use-toast";

import { Progress } from "@/components/ui/progress";
import { useAuth } from "@clerk/nextjs";

// Mock data
const dummyAccountData = {
  id: "1",
  accountId: "dummy_account_1",
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
  lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  accessToken: "dummy_access_token",
};

const mockTemplates = [
  {
    userId: "1",
    accountId: "1",
    name: "Welcome Message",
    content: "Thanks for following! 🌟 Check out our latest collection in bio!",
    triggers: ["follow", "new", "hello", "hi"],
    isActive: true,
    priority: 1,
    usageCount: 234,
    // successRate: 97.2,
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    accountUsername: "fashionista_jane",
    category: "greeting",
  },
  {
    userId: "2",
    accountId: "2",

    name: "Product Inquiry",
    content:
      "Hi! 👋 For product details and pricing, please DM us or visit our website!",
    triggers: ["price", "cost", "buy", "purchase", "shop"],
    isActive: true,
    priority: 2,
    usageCount: 189,
    // successRate: 93.1,
    lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    accountUsername: "fashionista_jane",
    category: "sales",
  },
  {
    userId: "3",
    accountId: "3",

    name: "Recipe Request",
    content:
      "Love that you're interested! 👩‍🍳 Full recipe is in my highlights or DM me!",
    triggers: ["recipe", "ingredients", "how to make", "tutorial"],
    isActive: true,
    priority: 1,
    usageCount: 156,
    // successRate: 95.5,
    lastUsed: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    accountUsername: "food_lover_sarah",
    category: "content",
  },
  {
    userId: "4",
    accountId: "4",
    name: "Compliment Response",
    content: "Thank you so much! 💕 Your support means everything to us!",
    triggers: ["love", "beautiful", "amazing", "gorgeous", "stunning"],
    isActive: false,
    priority: 3,
    usageCount: 123,
    // successRate: 98.4,
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    accountUsername: "fashionista_jane",
    category: "engagement",
  },
  {
    userId: "5",
    accountId: "5",

    name: "Tech Support",
    content:
      "Thanks for reaching out! 🔧 For technical questions, please check our FAQ or contact support.",
    triggers: ["help", "problem", "issue", "bug", "error"],
    isActive: true,
    priority: 1,
    usageCount: 67,
    // successRate: 91.3,
    lastUsed: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    accountUsername: "tech_guru_mike",
    category: "support",
  },
];

export default function AccountPage({ params }: { params: { id: string } }) {
  const [templates, setTemplates] = useState(mockTemplates);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [account, setAccount] = useState<InstagramAccount>(dummyAccountData);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const { userId } = useAuth();
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    triggers: "",
    priority: 1,
    category: "greeting",
    accountUsername: "fashionista_jane",
  });
  const handleToggleTemplate = async (templateId: string) => {
    const template = templates.find((t) => t.accountId === templateId);
    if (!template) return;

    const newActiveState = !template.isActive;

    // Optimistically update UI
    setTemplates(
      templates.map((t) =>
        t.accountId === templateId ? { ...t, isActive: newActiveState } : t
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
          templates.map((t) =>
            t.accountId === templateId ? { ...t, isActive: !newActiveState } : t
          )
        );
        console.error("Failed to update template status");
      }
    } catch (error) {
      // Revert on error
      setTemplates(
        templates.map((t) =>
          t.accountId === templateId ? { ...t, isActive: !newActiveState } : t
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
          templates.filter((template) => template.accountId !== templateId)
        );
      } else {
        console.error("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      // For demo purposes, still remove from UI
      setTemplates(
        templates.filter((template) => template.accountId !== templateId)
      );
    }
  };
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // In a real app, you would call your API endpoint here
      const response = await fetch(`/api/insta/accounts?id=${params.id}`, {
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
            setTemplates(mockTemplates);
          }
        } else {
          setTemplates(mockTemplates);
        }
      } catch (error) {
        setTemplates(mockTemplates);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );
  useEffect(() => {
    const loadData = async () => {
      if (!params.id || !userId) {
        router.push("/sign-in");
        return;
      }

      const cachedAccount = getCachedAccountById(params.id);

      if (cachedAccount) {
        setAccount(cachedAccount);
        setIsStale(!isCacheValid());
        await fetchTemplates(cachedAccount.accountId);
      } else {
        await fetchAccountData(params.id as string);
        setIsStale(true);
        await fetchTemplates(account.accountId);
      }

      setIsLoading(false);
    };

    loadData(); // Execute the async function
  }, [params.id, router, userId, fetchTemplates, account.accountId]); // Removed account.accountId (causes infinite loops)
  const fetchAccountData = async (accountId: string) => {
    try {
      const accountResponse = await fetch(`/api/insta/accounts/${accountId}`);
      // { accountData: dbAccount }
      if (accountResponse.ok) {
        const data = await accountResponse.json();
        const dbAccount = data.accountData;
        // Fetch Instagram data for each account

        try {
          const instaResponse = await fetch(
            `/api/insta/user-info?accessToken=${dbAccount.accessToken}&fields=username,user_id,followers_count,media_count,profile_picture_url`
          );

          if (!instaResponse.ok) throw new Error("Instagram API failed");

          const instaData = await instaResponse.json();

          setAccount({
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
          });
        } catch (instaError) {
          console.error(
            `Failed to fetch Instagram data for account ${dbAccount._id}:`,
            instaError
          );
          setAccount({
            id: dbAccount._id,
            accountId: dbAccount.instagramId,
            username: dbAccount.username,
            displayName: dbAccount.displayName || "No Name",
            profilePicture:
              dbAccount.profilePicture || "/public/assets/img/default-img.jpg",
            followersCount: dbAccount.followersCount || 0,
            postsCount: dbAccount.postsCount || 0,
            isActive: dbAccount.isActive || false,
            templatesCount: dbAccount.templatesCount || 0,
            repliesCount: dbAccount.repliesCount || 0,
            lastActivity: dbAccount.lastActivity || new Date().toISOString(),
            engagementRate: dbAccount.engagementRate || 0,
            avgResponseTime: dbAccount.avgResponseTime || "0s",
            accessToken: dbAccount.accessToken,
          });
        }
      } else if (accountResponse.status === 404) {
        setAccount({ ...dummyAccountData, id: accountId });
      } else {
        setAccount({ ...dummyAccountData, id: accountId });
      }
    } catch (error) {
      setAccount({ ...dummyAccountData, id: accountId });
    } finally {
      setIsLoading(false);
    }
  };

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
          triggers: newTemplate.triggers.split(",").map((t) => t.trim()),
        }),
      });

      if (response.ok) {
        const createdTemplate = await response.json();
        setTemplates([createdTemplate, ...templates]);
      } else {
        console.error("Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
    }

    setNewTemplate({
      name: "",
      content: "",
      triggers: "",
      priority: 1,
      category: "greeting",
      accountUsername: "fashionista_jane",
    });
    setIsCreateDialogOpen(false);
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
      <Card className="mb-8 overflow-hidden hover:-translate-y-1 transition-all shadow  hover:shadow-[#FF2E9F">
        <CardContent className="pt-6 group hover:shadow-xl  duration-300  bg-gradient-to-br from-[#FF2E9F]/20 to-[#FF2E9F]/5 border-[#FF2E9F]/10 hover:border-[#FF2E9F]/20  bg-transparent backdrop-blur-sm border">
          <div className="flex flex-col md:flex-row gap-5 md:gap-0 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-5 md:gap-0 items-center space-x-4">
              <div className="relative">
                <Image
                  width={100}
                  height={100}
                  src={account.profilePicture}
                  alt={account.displayName}
                  className="h-24 w-24 rounded-full object-cover"
                />
                <div
                  className={`absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-2 border-[#0a0a0a] ${
                    account.isActive ? "bg-[#00F0FF]" : "bg-gray-400"
                  }`}
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-2 gradient-text-main">
                  @{account.username}
                </h1>
                <p className="text-xl text-gray-300 mb-2">
                  {account.displayName}
                </p>
                <div className="flex items-center gap-2 md:gap-6 text-gray-400">
                  <span>
                    {account.followersCount.toLocaleString()} followers
                  </span>
                  <span>{account.postsCount} posts</span>
                  <span>{account.engagementRate}% engagement</span>
                </div>
              </div>
            </div>
            <div className="flex items-center flex-col gap-3 md:flex-row ">
              <div className="flex items-center space-x-2">
                <Label htmlFor="account-toggle">Auto-replies</Label>
                <Switch
                  id="account-toggle"
                  checked={account.isActive}
                  onCheckedChange={handleToggleAccount}
                />
              </div>
              <div className="flex items-center justify-between gap-5 md:gap-3">
                <Badge variant={account.isActive ? "default" : "secondary"}>
                  {account.isActive ? "Active" : "Inactive"}
                </Badge>
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
                <Button className="btn-gradient-cyan hover:opacity-90 hover:shadow-cyan-500 shadow-lg transition-opacity ">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-transparent bg-gradient-to-br  border-[#B026FF]/20 hover:border-[#B026FF]/40 backdrop-blur-md border">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Create New Template
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Set up an automated reply that triggers when specific
                    keywords are detected
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">
                        Template Name
                      </Label>
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-gray-300">
                        Category
                      </Label>
                      <Select
                        value={newTemplate.category}
                        onValueChange={(value) =>
                          setNewTemplate({ ...newTemplate, category: value })
                        }
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="greeting">Greeting</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="engagement">Engagement</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-gray-300">
                      Reply Content
                    </Label>
                    <Textarea
                      id="content"
                      value={newTemplate.content}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          content: e.target.value,
                        })
                      }
                      placeholder="Write your automated reply message..."
                      className="min-h-[100px] bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="triggers" className="text-gray-300">
                      Trigger Keywords (comma separated)
                    </Label>
                    <Input
                      id="triggers"
                      value={newTemplate.triggers}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          triggers: e.target.value,
                        })
                      }
                      placeholder="hello, hi, welcome, new"
                      className="bg-white/5 border-white/20 text-white"
                    />
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
                        value={newTemplate.priority}
                        onChange={(e) =>
                          setNewTemplate({
                            ...newTemplate,
                            priority: parseInt(e.target.value),
                          })
                        }
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-white/20 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTemplate}
                    className="btn-gradient-cyan"
                  >
                    Create Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template.accountId}
                template={template}
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
                      {account.templatesCount}
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
                      {account.repliesCount}
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
                      {account.avgResponseTime}
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
                      {account.engagementRate}%
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
                          {formatLastActivity(account.lastActivity)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-300">Last Sync</span>
                        <span className="text-gray-400">
                          {formatLastActivity(account.lastActivity)}
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
                          {account.templatesCount}
                        </div>
                        <div className="text-xs text-gray-400">
                          Active Templates
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-[#B026FF] mb-1">
                          {account.repliesCount}
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
                    {[
                      {
                        id: "1",
                        type: "reply_sent",
                        message: "Auto-reply sent to @user123",
                        template: "Welcome Message",
                        timestamp: new Date(
                          Date.now() - 5 * 60 * 1000
                        ).toISOString(),
                        success: true,
                      },
                      {
                        id: "2",
                        type: "reply_sent",
                        message: "Auto-reply sent to @customer456",
                        template: "Product Inquiry",
                        timestamp: new Date(
                          Date.now() - 15 * 60 * 1000
                        ).toISOString(),
                        success: true,
                      },
                      {
                        id: "3",
                        type: "template_triggered",
                        message: 'Template "Compliment Response" triggered',
                        template: "Compliment Response",
                        timestamp: new Date(
                          Date.now() - 30 * 60 * 1000
                        ).toISOString(),
                        success: true,
                      },
                    ].map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              activity.success ? "bg-[#00F0FF]" : "bg-[#FF2E9F]"
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {activity.message}
                            </p>
                            <p className="text-xs text-gray-400">
                              Template: {activity.template}
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
                    ))}
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
