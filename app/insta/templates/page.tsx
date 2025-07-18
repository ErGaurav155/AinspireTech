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
// Dummy templates data fallback
const dummyTemplates = [
  {
    id: "1",
    name: "Welcome Message",
    content: "Thanks for following! 🌟 Check out our latest collection in bio!",
    triggers: ["follow", "new", "hello", "hi"],
    isActive: true,
    priority: 1,
    usageCount: 234,
    successRate: 97.2,
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    accountUsername: "fashionista_jane",
    category: "greeting",
  },
  {
    id: "2",
    name: "Product Inquiry",
    content:
      "Hi! 👋 For product details and pricing, please DM us or visit our website!",
    triggers: ["price", "cost", "buy", "purchase", "shop"],
    isActive: true,
    priority: 2,
    usageCount: 189,
    successRate: 93.1,
    lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    accountUsername: "fashionista_jane",
    category: "sales",
  },
  {
    id: "3",
    name: "Recipe Request",
    content:
      "Love that you're interested! 👩‍🍳 Full recipe is in my highlights or DM me!",
    triggers: ["recipe", "ingredients", "how to make", "tutorial"],
    isActive: true,
    priority: 1,
    usageCount: 156,
    successRate: 95.5,
    lastUsed: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    accountUsername: "food_lover_sarah",
    category: "content",
  },
  {
    id: "4",
    name: "Compliment Response",
    content: "Thank you so much! 💕 Your support means everything to us!",
    triggers: ["love", "beautiful", "amazing", "gorgeous", "stunning"],
    isActive: false,
    priority: 3,
    usageCount: 123,
    successRate: 98.4,
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    accountUsername: "fashionista_jane",
    category: "engagement",
  },
  {
    id: "5",
    name: "Tech Support",
    content:
      "Thanks for reaching out! 🔧 For technical questions, please check our FAQ or contact support.",
    triggers: ["help", "problem", "issue", "bug", "error"],
    isActive: true,
    priority: 1,
    usageCount: 67,
    successRate: 91.3,
    lastUsed: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    accountUsername: "tech_guru_mike",
    category: "support",
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(dummyTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    triggers: "",
    priority: 1,
    category: "greeting",
    accountUsername: "fashionista_jane",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      // For now, we'll use a mock account ID since we don't have account selection
      const response = await fetch(
        "/api/insta/templates?accountId=mock-account-id"
      );
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setTemplates(data);
        } else {
          console.log("No templates found, using dummy data");
          setTemplates(dummyTemplates);
        }
      } else {
        console.log("API not available, using dummy data");
        setTemplates(dummyTemplates);
      }
    } catch (error) {
      console.log("API error, using dummy data:", error);
      setTemplates(dummyTemplates);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTemplate = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const newActiveState = !template.isActive;

    // Optimistically update UI
    setTemplates(
      templates.map((t) =>
        t.id === templateId ? { ...t, isActive: newActiveState } : t
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
            t.id === templateId ? { ...t, isActive: !newActiveState } : t
          )
        );
        console.error("Failed to update template status");
      }
    } catch (error) {
      // Revert on error
      setTemplates(
        templates.map((t) =>
          t.id === templateId ? { ...t, isActive: !newActiveState } : t
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
          templates.filter((template) => template.id !== templateId)
        );
      } else {
        console.error("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      // For demo purposes, still remove from UI
      setTemplates(templates.filter((template) => template.id !== templateId));
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
          accountId: "mock-account-id",
          ...newTemplate,
          triggers: newTemplate.triggers.split(",").map((t) => t.trim()),
        }),
      });

      if (response.ok) {
        const createdTemplate = await response.json();
        setTemplates([createdTemplate, ...templates]);
      } else {
        console.error("Failed to create template");
        // For demo purposes, still add to UI
        const template = {
          id: Date.now().toString(),
          ...newTemplate,
          triggers: newTemplate.triggers.split(",").map((t) => t.trim()),
          isActive: true,
          usageCount: 0,
          successRate: 0,
          lastUsed: new Date().toISOString(),
        };
        setTemplates([template, ...templates]);
      }
    } catch (error) {
      console.error("Error creating template:", error);
      // For demo purposes, still add to UI
      const template = {
        id: Date.now().toString(),
        ...newTemplate,
        triggers: newTemplate.triggers.split(",").map((t) => t.trim()),
        isActive: true,
        usageCount: 0,
        successRate: 0,
        lastUsed: new Date().toISOString(),
      };
      setTemplates([template, ...templates]);
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

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.triggers.some((trigger) =>
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
                  Create New Template
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Set up an automated reply that triggers when specific keywords
                  are detected
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
                        setNewTemplate({ ...newTemplate, name: e.target.value })
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
                  <div className="space-y-2">
                    <Label htmlFor="account" className="text-gray-300">
                      Account
                    </Label>
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
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fashionista_jane">
                          @fashionista_jane
                        </SelectItem>
                        <SelectItem value="tech_guru_mike">
                          @tech_guru_mike
                        </SelectItem>
                        <SelectItem value="food_lover_sarah">
                          @food_lover_sarah
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
              <SelectItem value="fashionista_jane">
                @fashionista_jane
              </SelectItem>
              <SelectItem value="tech_guru_mike">@tech_guru_mike</SelectItem>
              <SelectItem value="food_lover_sarah">
                @food_lover_sarah
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Templates Grid */}
        <div className="grid gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
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
                      @{template.accountUsername}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Switch
                      checked={template.isActive}
                      onCheckedChange={() => handleToggleTemplate(template.id)}
                      className="data-[state=checked]:bg-[#00F0FF]"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white"
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
                            onClick={() => handleDeleteTemplate(template.id)}
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
                    {template.triggers.map((trigger, index) => (
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
                    <div>{template.successRate}% success rate</div>
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

          {filteredTemplates.length === 0 && (
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
