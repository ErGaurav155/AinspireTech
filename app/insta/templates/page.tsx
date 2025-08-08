"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  MessageSquare,
  Edit2,
  Trash2,
  BarChart3,
  Search,
  Filter,
  Instagram,
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
// Dummy templates data fallback

interface accountDataType {
  instagramId: string;
  username: string;
}
export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [accounts, setAccounts] = useState<accountDataType[]>([]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();
  const router = useRouter();
  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    triggers: "",
    priority: 5,
    category: "",
    accountUsername: "",
  });

  useEffect(() => {
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
                username: acc.userName,
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
    const fetchTemplates = async () => {
      try {
        // For now, we'll use a mock account ID since we don't have account selection
        const response = await fetch(`/api/insta/templates?userId=${userId} `);
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
    };
    fetchAccounts();
    fetchTemplates();
  }, [router, userId]);
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
  const handleToggleTemplate = async (templateId: string) => {
    const template = templates.find((t: any) => t._id === templateId);
    if (!template) return;

    const newActiveState = !template.isActive;

    // Optimistically update UI

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
      setTemplates(
        templates.map((t: any) =>
          t._id === templateId ? { ...t, isActive: newActiveState } : t
        )
      );
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

  const handleCreateTemplate = async () => {
    try {
      const selectedAccount = accounts.find(
        (acc) => acc.username === newTemplate.accountUsername
      );
      if (!selectedAccount) {
        console.error("No account found with this username");
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
          triggers: newTemplate.triggers.split(",").map((t) => t.trim()),
        }),
      });
      const result = await response.json();
      console.log(result);
      if (response.ok && result.ok) {
        console.log(result.template);

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
          content: "",
          triggers: "",
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

  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.triggers.some((trigger: any) =>
        trigger.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      filterCategory === "all" || template.category === filterCategory;
    const matchesAccount =
      filterAccount === "all" || template.accountUsername === filterAccount;

    return matchesSearch && matchesCategory && matchesAccount;
  });

  const formatLastUsed = (dateString: string) => {
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

  const getCategoryColor = (category: string) => {
    const colors = {
      greeting: "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30",
      sales: "bg-[#B026FF]/20 text-[#B026FF] border-[#B026FF]/30",
      content: "bg-[#FF2E9F]/20 text-[#FF2E9F] border-[#FF2E9F]/30",
      engagement: "bg-green-500/20 text-green-400 border-green-400/30",
      support: "bg-orange-500/20 text-orange-400 border-orange-400/30",
    };
    return (
      colors[category as keyof typeof colors] ||
      "bg-gray-500/20 text-gray-400 border-gray-400/30"
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto mb-4"></div>
          <p className="text-gray-300">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto p-2 md:px-4 py-8">
        <BreadcrumbsDefault />
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 lg:gap-0 mb-8">
          <div>
            <div className="inline-flex items-center bg-blue-100/10 text-blue-400 border border-blue-400/30 rounded-full px-4 py-1 mb-4">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Template Management</span>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Reply Templates
            </h1>
            <p className="text-gray-300 text-lg ">
              Create and manage automated reply templates for your Instagram
              accounts
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
                  {editingTemplate ? "Edit Template" : "Create New Template"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingTemplate
                    ? "Update your automated reply content and triggers"
                    : "Set up an automated reply that triggers when specific keywords are detected"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
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
                                // Exclude categories that already exist in templates
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

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-gray-300">
                    Reply Content
                  </Label>
                  <Textarea
                    id="content"
                    value={
                      editingTemplate
                        ? editingTemplate.content
                        : newTemplate.content
                    }
                    onChange={(e) =>
                      editingTemplate
                        ? setEditingTemplate({
                            ...editingTemplate,
                            content: e.target.value,
                          })
                        : setNewTemplate({
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
                    value={
                      editingTemplate
                        ? editingTemplate.triggers
                        : newTemplate.triggers
                    }
                    onChange={(e) =>
                      editingTemplate
                        ? setEditingTemplate({
                            ...editingTemplate,
                            triggers: e.target.value,
                          })
                        : setNewTemplate({
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
                        {accounts.find(
                          (a) => a.username === editingTemplate.accountUsername
                        )?.username || editingTemplate.accountUsername}
                      </div>
                    ) : (
                      <Select
                        value={newTemplate.accountUsername}
                        onValueChange={(value) =>
                          setNewTemplate({
                            ...newTemplate,
                            accountUsername: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue
                            className="text-white block"
                            placeholder="Choose account"
                          />
                        </SelectTrigger>
                        <SelectContent className="block">
                          {accounts.map((account) => (
                            <SelectItem
                              key={account.instagramId}
                              value={account.username}
                            >
                              {account.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates, content, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="greeting">Greeting</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
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
        {/* Templates Grid */}
        <div className="grid gap-6">
          {filteredTemplates.map((template: any) => (
            <Card
              key={template._id}
              className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br ${
                template.isActive
                  ? "from-[#B026FF]/20 to-[#B026FF]/5 border-[#B026FF]/20 hover:border-[#B026FF]/40"
                  : "from-[#00F0FF]/10 to-[#00F0FF]/5 border-[#00F0FF]/20 hover:border-[#00F0FF]/40"
              } bg-transparent backdrop-blur-sm border`}
            >
              <CardHeader className="pb-3 p-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <CardTitle className="text-lg text-white">
                        {template.name}
                      </CardTitle>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs border-white/20 text-gray-300"
                      >
                        Priority {template.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      {template.accountUsername}
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
                      className="text-gray-300 hover:text-white"
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
                      <AlertDialogContent className="bg-[#0a0a0a]/95 border-white/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Delete Template
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete {template.name}?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-white/20 text-gray-300">
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

              <CardContent className="space-y-4 p-2">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Reply Content:</p>
                  <p className="text-sm text-wrap bg-white/5 p-3 rounded-md text-gray-300">
                    {template.content}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Trigger Keywords:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.triggers.map((trigger: any, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-white/20 text-gray-300"
                      >
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {template.usageCount} uses
                    </div>
                    {/* <div>{template.successRate}% success rate</div> */}
                    <div>Last used: {formatLastUsed(template.lastUsed)}</div>
                  </div>
                  <Badge
                    variant={template.isActive ? "default" : "secondary"}
                    className={
                      template.isActive
                        ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30"
                        : "bg-gray-800 text-gray-400"
                    }
                  >
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
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
                  <Link href="/insta/accounts/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Connect Account
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {accounts.length > 0 && filteredTemplates.length === 0 && (
            <Card className="card-hover">
              <CardContent className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {searchTerm ||
                  filterCategory !== "all" ||
                  filterAccount !== "all"
                    ? "No templates match your filters"
                    : "No templates yet"}
                </h3>
                <p className="text-gray-400 mb-4 font-mono">
                  {searchTerm ||
                  filterCategory !== "all" ||
                  filterAccount !== "all"
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
