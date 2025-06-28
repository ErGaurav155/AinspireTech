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
  Loader2,
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
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
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // In a real app, you would call your API endpoint here
      const response = await fetch(`/api/accounts?id=${params.id}`, {
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
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-5 md:gap-0 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-5 md:gap-0 items-center space-x-4">
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
              </Badge>{" "}
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
        </CardContent>
      </Card>
      {/* Main Content */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex flex-wrap gap-3 md:gap-0 justify-between items-center">
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
            <Card
              className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#FF2E9F]/20 to-[#FF2E9F]/5 border-[#FF2E9F]/20 hover:border-[#FF2E9F]/40  bg-transparent backdrop-blur-sm border`}
            >
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
                <CardDescription>
                  Set up an automated reply that triggers when specific keywords
                  are detected
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2">
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
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#187d31]/20 to-[#187d31]/5 border-[#187d31]/20 hover:bg-[#187d31]/15 group bg-transparent backdrop-blur-sm border">
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
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#d61a1a]/20 to-[#d61a1a]/5 border-[#d61a1a]/20 hover:bg-[#d61a1a]/15 group bg-transparent backdrop-blur-sm border">
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
              </div>{" "}
              <div className="pt-4 border-t border-dashed">
                <div className="flex flex-col space-y-4">
                  <Label className="text-destructive">Danger Zone</Label>
                  <div className="flex justify-between items-center">
                    <div>
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
      </Tabs>{" "}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              Instagram account and all associated templates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
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
