"use client";

import { useState } from "react";
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

// Mock templates data
const mockTemplates = [
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
  const [templates, setTemplates] = useState(mockTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    triggers: "",
    priority: 1,
    category: "greeting",
    accountUsername: "fashionista_jane",
  });

  const handleToggleTemplate = (templateId: string) => {
    setTemplates(
      templates.map((template) =>
        template.id === templateId
          ? { ...template, isActive: !template.isActive }
          : template
      )
    );
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter((template) => template.id !== templateId));
  };

  const handleCreateTemplate = () => {
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
      greeting: "bg-blue-100 text-blue-800",
      sales: "bg-green-100 text-green-800",
      content: "bg-purple-100 text-purple-800",
      engagement: "bg-pink-100 text-pink-800",
      support: "bg-orange-100 text-orange-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="container mx-auto p-2 md:px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 lg:gap-0 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Reply Templates
          </h1>
          <p className="text-muted-foreground text-lg">
            Create and manage automated reply templates for your Instagram
            accounts
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-transparent bg-gradient-to-br  border-[#B026FF]/20 hover:border-[#B026FF]/40 backdrop-blur-md border">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Set up an automated reply that triggers when specific keywords
                are detected
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    placeholder="e.g., Welcome Message"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) =>
                      setNewTemplate({ ...newTemplate, category: value })
                    }
                  >
                    <SelectTrigger>
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
                <Label htmlFor="content">Reply Content</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, content: e.target.value })
                  }
                  placeholder="Write your automated reply message..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="triggers">
                  Trigger Keywords (comma separated)
                </Label>
                <Input
                  id="triggers"
                  value={newTemplate.triggers}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, triggers: e.target.value })
                  }
                  placeholder="hello, hi, welcome, new"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority (1-10)</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Select
                    value={newTemplate.accountUsername}
                    onValueChange={(value) =>
                      setNewTemplate({ ...newTemplate, accountUsername: value })
                    }
                  >
                    <SelectTrigger>
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
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
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
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
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
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            <SelectItem value="fashionista_jane">@fashionista_jane</SelectItem>
            <SelectItem value="tech_guru_mike">@tech_guru_mike</SelectItem>
            <SelectItem value="food_lover_sarah">@food_lover_sarah</SelectItem>
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
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Priority {template.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    @{template.accountUsername}
                  </p>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <Switch
                    checked={template.isActive}
                    onCheckedChange={() => handleToggleTemplate(template.id)}
                  />
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {template.name}? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                <p className="text-sm text-muted-foreground mb-2">
                  Reply Content:
                </p>
                <p className="text-sm bg-muted p-3 text-wrap rounded-md">
                  {template.content}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Trigger Keywords:
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.triggers.map((trigger, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t w-full">
                <div className="flex items-center gap-3 md:gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {template.usageCount} uses
                  </div>
                  <div>{template.successRate}% success rate</div>
                  <div>Last used: {formatLastUsed(template.lastUsed)}</div>
                </div>
                <Badge variant={template.isActive ? "default" : "secondary"}>
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ||
                filterCategory !== "all" ||
                filterAccount !== "all"
                  ? "No templates match your filters"
                  : "No templates yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ||
                filterCategory !== "all" ||
                filterAccount !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first reply template to start automating responses"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
