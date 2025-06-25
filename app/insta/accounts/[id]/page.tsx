"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Power,
  PowerOff,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import TemplateForm from "@/components/insta/TemplateForm";
import TemplateCard from "@/components/insta/TemplateCard";
import Image from "next/image";

// Mock data
const mockAccount = {
  id: "1",
  username: "fashionista_jane",
  displayName: "Jane Fashion",
  profilePicture:
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
  followersCount: 15420,
  postsCount: 892,
  isActive: true,
  lastActivity: new Date().toISOString(),
};

const mockTemplates = [
  {
    id: "1",
    name: "Welcome Message",
    content: "Thanks for following! 🌟 Check out our latest collection in bio!",
    triggers: ["follow", "new", "hello"],
    isActive: true,
    priority: 1,
    usageCount: 45,
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Product Inquiry",
    content:
      "Hi! 👋 For product details and pricing, please DM us or visit our website!",
    triggers: ["price", "cost", "buy", "purchase"],
    isActive: true,
    priority: 2,
    usageCount: 78,
    lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Compliment Response",
    content: "Thank you so much! 💕 Your support means everything to us!",
    triggers: ["love", "beautiful", "amazing", "gorgeous"],
    isActive: false,
    priority: 3,
    usageCount: 23,
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function AccountPage({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState(mockAccount);
  const [templates, setTemplates] = useState(mockTemplates);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  const handleToggleAccount = () => {
    setAccount({ ...account, isActive: !account.isActive });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter((t) => t.id !== templateId));
  };

  const handleToggleTemplate = (templateId: string) => {
    setTemplates(
      templates.map((t) =>
        t.id === templateId ? { ...t, isActive: !t.isActive } : t
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src={account.profilePicture}
                  alt={account.displayName}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div
                  className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${
                    account.isActive ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">@{account.username}</h1>
                <p className="text-muted-foreground">{account.displayName}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {account.followersCount.toLocaleString()} followers
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {account.postsCount} posts
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="account-toggle">Auto-replies</Label>
                <Switch
                  id="account-toggle"
                  checked={account.isActive}
                  onCheckedChange={handleToggleAccount}
                />
              </div>
              <Badge variant={account.isActive ? "default" : "secondary"}>
                {account.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Reply Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Reply Templates</h2>
              <p className="text-muted-foreground">
                Create and manage automated reply templates for this account
              </p>
            </div>
            <Button onClick={() => setShowTemplateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>

          {showTemplateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
                <CardDescription>
                  Set up an automated reply that triggers when specific keywords
                  are detected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateForm
                  accountId={params.id}
                  onSuccess={() => setShowTemplateForm(false)}
                  onCancel={() => setShowTemplateForm(false)}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
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
                  <Button onClick={() => setShowTemplateForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#FF2E9F]/20 to-[#FF2E9F]/5 border-[#FF2E9F]/20 hover:border-[#FF2E9F]/40 group bg-transparent backdrop-blur-sm border">
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Track the performance of your auto-replies for this account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">146</div>
                  <p className="text-sm text-muted-foreground">Total Replies</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">94%</div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">2.3s</div>
                  <p className="text-sm text-muted-foreground">
                    Avg Response Time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#FF2E9F]/20 to-[#FF2E9F]/5 border-[#FF2E9F]/20 hover:border-[#FF2E9F]/40 group bg-transparent backdrop-blur-sm border">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Configure how auto-replies work for this Instagram account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
