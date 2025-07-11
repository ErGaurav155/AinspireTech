"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import {
  Bot,
  MessageCircle,
  Calendar,
  Users,
  TrendingUp,
  Settings,
  Code,
  Eye,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  BarChart3,
  LogOut,
  X,
  CreditCard,
  Globe,
  Save,
  Upload,
  Trash2,
  Edit,
  Phone,
  Mail,
  MapPin,
  User,
  ShoppingCart,
  GraduationCap,
  Stethoscope,
  Building2,
  Target,
  Instagram,
  Zap,
  Star,
  Crown,
  Lock,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { apiClient } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  cancelRazorPaySubscription,
  getSubscription,
} from "@/lib/action/subscription.action";
import { XMarkIcon } from "@heroicons/react/24/solid";

// Chatbot types configuration
const chatbotTypes = [
  {
    id: "chatbot-customer-support",
    name: "Customer Support",
    icon: MessageCircle,
    description: "24/7 automated customer service",
    category: "Website",
    color: "text-[#00F0FF]",
    gradient: "from-[#00F0FF] to-[#0080FF]",
    features: [
      "Instant responses",
      "Multi-language support",
      "Ticket routing",
      "FAQ automation",
    ],
  },
  {
    id: "chatbot-e-commerce",
    name: "E-Commerce",
    icon: ShoppingCart,
    description: "Boost sales with AI shopping assistant",
    category: "Website",
    color: "text-[#FF2E9F]",
    gradient: "from-[#FF2E9F] to-[#B026FF]",
    features: [
      "Product recommendations",
      "Order tracking",
      "Cart recovery",
      "Inventory queries",
    ],
  },
  {
    id: "chatbot-lead-generation",
    name: "Lead Generation",
    icon: Target,
    description: "Convert visitors into qualified leads",
    category: "Website",
    color: "text-[#B026FF]",
    gradient: "from-[#B026FF] to-[#FF2E9F]",
    features: [
      "Lead qualification",
      "Contact forms",
      "CRM integration",
      "Follow-up automation",
    ],
  },
  {
    id: "chatbot-education",
    name: "Chatbot Education",
    icon: Instagram,
    description: "Automate Instagram engagement",
    category: "Social Media",
    color: "text-[#E4405F]",
    gradient: "from-[#E4405F] to-[#F56040]",
    features: [
      "Comment automation",
      "DM responses",
      "Story interactions",
      "Hashtag monitoring",
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  // const [user, setUser] = useState<any>(null);
  const [selectedChatbot, setSelectedChatbot] = useState(
    "chatbot-customer-support"
  );
  const [chatbotCode, setChatbotCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any>({});
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [websiteData, setWebsiteData] = useState("");
  const [appointmentQuestions, setAppointmentQuestions] = useState([
    {
      id: 1,
      question: "What is your full name?",
      type: "text",
      required: true,
    },
    {
      id: 2,
      question: "What is your email address?",
      type: "email",
      required: true,
    },
    {
      id: 3,
      question: "What is your phone number?",
      type: "tel",
      required: true,
    },
    {
      id: 4,
      question: "What service are you interested in?",
      type: "select",
      options: ["Consultation", "Service A", "Service B"],
      required: true,
    },
    {
      id: 5,
      question: "Preferred appointment date?",
      type: "date",
      required: true,
    },
  ]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelSubDialog, setShowCancelSubDialog] = useState(false);
  const [cancelSub, setCancelSub] = useState(false);
  const [selectedChatbotId, setSelectedChatbotId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImmediateSubmitting, setIsImmediateSubmitting] = useState(false);

  const [mode, setMode] = useState<"Immediate" | "End-of-term">("End-of-term");

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load subscriptions
      const subscriptionsData = await apiClient.getSubscriptions();

      const subscriptionsMap = subscriptionsData.reduce(
        (acc: any, sub: any) => {
          acc[sub.chatbotType] = sub;
          return acc;
        },
        {}
      );
      setSubscriptions(subscriptionsMap);

      // Load website data for selected chatbot
      const websiteDataResponse = await apiClient.getWebsiteData(
        selectedChatbot
      );
      setWebsiteData(websiteDataResponse.websiteData.content);

      // Load appointment questions for selected chatbot
      const questionsResponse = await apiClient.getAppointmentQuestions(
        selectedChatbot
      );
      setAppointmentQuestions(questionsResponse.appointmentQuestions.questions);

      // Load analytics if subscribed
      if (subscriptionsMap[selectedChatbot]?.status === "active") {
        const analyticsData = await apiClient.getAnalytics(selectedChatbot);
        setAnalytics(analyticsData.analytics);

        // Load conversations
        const conversationsData = await apiClient.getConversations(
          selectedChatbot
        );
        setConversations(conversationsData.conversations);
      }

      // Generate chatbot code
      const code = `<script>
    (function() {
      const chatbotId = '${Math.random().toString(36).substr(2, 9)}';
      const script = document.createElement('script');
      script.src = 'https://cdn.chatbot-ai.com/embed.js';
      script.setAttribute('data-chatbot-id', chatbotId);
      script.setAttribute('data-chatbot-type', '${selectedChatbot}');
      document.head.appendChild(script);
    })();
  </script>`;
      setChatbotCode(code);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [selectedChatbot]);
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    loadDashboardData();
  }, [user, isLoaded, loadDashboardData, router]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(chatbotCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    signOut(() => router.push("/"));
  };

  // const handleCancelSubscription = async (chatbotId: string) => {
  //   try {
  //     await apiClient.cancelSubscription(chatbotId);
  //     await loadDashboardData(); // Reload data
  //   } catch (err: any) {
  //     setError(err.message || "Failed to cancel subscription");
  //   }
  // };
  const handleCancelSubscription = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const subcriptionId = subscriptions[selectedChatbotId]?.subcriptionId;
    const formData = new FormData(event.currentTarget);
    const reason = formData.get("reason") as string;

    try {
      if (mode === "Immediate") {
        setIsSubmitting(true);
      } else {
        setIsImmediateSubmitting(true);
      }
      const getSub = await getSubscription(selectedChatbotId, subcriptionId);
      if (!getSub) {
        router.push("/");
        return;
      }
      const response = await fetch("/api/web/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subcriptionId,
          reason: reason,
          mode: mode,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Subscription cancelled successfully!",
          description: result.message,
          duration: 3000,
          className: "success-toast",
        });
        router.refresh();
      } else {
        toast({
          title: "Subscription cancelled Failed!",
          description: result.message,
          duration: 3000,
          className: "error-toast",
        });
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    } finally {
      setIsSubmitting(false);
      setIsImmediateSubmitting(false);
    }
  };

  // const handleCancelSubscription = async (chatbotId: string) => {
  //   setCancelSub(true);
  //   try {
  //     // In a real app, you would call your API endpoint here
  //     const response = await apiClient.cancelSubscription(chatbotId);

  //     if (!response.ok) {
  //       throw new Error("Failed to delete account");
  //     }

  //     toast({
  //       title: "Subcription Cancelled successfully!",
  //       duration: 3000,
  //       className: "success-toast",
  //     });
  //     await loadDashboardData(); // Reload data
  //   } catch (error: any) {
  //     setError(error.message || "Failed to cancel subscription");
  //     toast({
  //       title: "Subcription cancelling Failed!",
  //       duration: 3000,
  //       className: "error-toast",
  //     });
  //   } finally {
  //     setCancelSub(false);
  //     setShowCancelSubDialog(false);
  //   }
  // };
  const saveWebsiteData = async () => {
    try {
      await apiClient.saveWebsiteData(selectedChatbot, websiteData);
      alert("Website data saved successfully!");
    } catch (err: any) {
      alert("Failed to save website data: " + err.message);
    }
  };

  const saveAppointmentQuestions = async () => {
    try {
      await apiClient.saveAppointmentQuestions(
        selectedChatbot,
        appointmentQuestions
      );
      alert("Appointment questions saved successfully!");
    } catch (err: any) {
      alert("Failed to save appointment questions: " + err.message);
    }
  };

  const addAppointmentQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: "New question?",
      type: "text",
      required: false,
    };
    setAppointmentQuestions([...appointmentQuestions, newQuestion]);
  };

  const updateAppointmentQuestion = (id: number, field: string, value: any) => {
    setAppointmentQuestions(
      appointmentQuestions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const removeAppointmentQuestion = (id: number) => {
    setAppointmentQuestions(appointmentQuestions.filter((q) => q.id !== id));
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#00F0FF] mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentChatbot = chatbotTypes.find((bot) => bot.id === selectedChatbot);
  const isSubscribed = subscriptions[selectedChatbot]?.status === "active";

  const getStatsForChatbot = (chatbotId: string) => {
    if (!analytics) return [];

    const overview = analytics.overview;
    const baseStats = {
      "chatbot-customer-support": [
        {
          title: "Support Tickets",
          value: overview.totalConversations?.toString() || "0",
          icon: MessageCircle,
          color: "text-[#00F0FF]",
          change: "+12%",
        },
        {
          title: "Resolved Issues",
          value: overview.resolvedIssues?.toString() || "0",
          icon: CheckCircle,
          color: "text-green-400",
          change: "+8%",
        },
        {
          title: "Avg Response Time",
          value: `${overview.averageResponseTime || 0}s`,
          icon: Clock,
          color: "text-[#B026FF]",
          change: "-15%",
        },
        {
          title: "Satisfaction Rate",
          value: `${overview.satisfactionScore || 0}%`,
          icon: TrendingUp,
          color: "text-[#FF2E9F]",
          change: "+2%",
        },
      ],
      "chatbot-e-commerce": [
        {
          title: "Product Inquiries",
          value: overview.productInquiries?.toString() || "0",
          icon: ShoppingCart,
          color: "text-[#FF2E9F]",
          change: "+18%",
        },
        {
          title: "Sales Assisted",
          value: `$${overview.salesAssisted?.toLocaleString() || "0"}`,
          icon: TrendingUp,
          color: "text-green-400",
          change: "+25%",
        },
        {
          title: "Cart Recoveries",
          value: overview.cartRecoveries?.toString() || "0",
          icon: Target,
          color: "text-[#B026FF]",
          change: "+12%",
        },
        {
          title: "Conversion Rate",
          value: `${overview.conversionRate || 0}%`,
          icon: BarChart3,
          color: "text-[#00F0FF]",
          change: "+3%",
        },
      ],
      "chatbot-lead-generation": [
        {
          title: "Leads Generated",
          value: overview.leadsGenerated?.toString() || "0",
          icon: Target,
          color: "text-[#B026FF]",
          change: "+22%",
        },
        {
          title: "Qualified Leads",
          value: overview.qualifiedLeads?.toString() || "0",
          icon: Users,
          color: "text-[#FF2E9F]",
          change: "+15%",
        },
        {
          title: "Conversion Rate",
          value: `${overview.conversionRate || 0}%`,
          icon: TrendingUp,
          color: "text-green-400",
          change: "+5%",
        },
        {
          title: "Form Completions",
          value: `${overview.formCompletions || 0}%`,
          icon: CheckCircle,
          color: "text-[#00F0FF]",
          change: "+7%",
        },
      ],
      "chatbot-education": [
        {
          title: "Comments Replied",
          value: overview.commentsReplied?.toString() || "0",
          icon: MessageCircle,
          color: "text-[#E4405F]",
          change: "+28%",
        },
        {
          title: "DMs Automated",
          value: overview.dmsAutomated?.toString() || "0",
          icon: Mail,
          color: "text-[#F56040]",
          change: "+35%",
        },
        {
          title: "Engagement Rate",
          value: `${overview.engagementRate || 0}%`,
          icon: TrendingUp,
          color: "text-green-400",
          change: "+12%",
        },
        {
          title: "Followers Growth",
          value: `+${overview.followersGrowth || 0}`,
          icon: Users,
          color: "text-[#B026FF]",
          change: "+18%",
        },
      ],
    };

    return (
      baseStats[chatbotId as keyof typeof baseStats] ||
      baseStats["chatbot-customer-support"]
    );
  };
  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Header */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <span className="text-red-400">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError("")}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chatbot Selection Tabs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Your AI Chatbots
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {chatbotTypes.map((chatbot) => {
              const isActive = selectedChatbot === chatbot.id;
              const hasSubscription =
                subscriptions[chatbot.id]?.status === "active";

              return (
                <Card
                  key={chatbot.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-[#00F0FF]/50"
                      : "bg-gray-900/30 border-gray-800/50 hover:border-gray-700/50"
                  }`}
                  onClick={() => setSelectedChatbot(chatbot.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <chatbot.icon className={`h-8 w-8 ${chatbot.color}`} />
                      {hasSubscription ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Crown className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-700/50 text-gray-400"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-white mb-1">
                      {chatbot.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                      {chatbot.description}
                    </p>
                    {!hasSubscription && (
                      <Button
                        size="sm"
                        className={`w-full bg-gradient-to-r ${chatbot.gradient} hover:opacity-90 text-black font-medium`}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/web/pricing?id=${chatbot.id}`);
                        }}
                      >
                        Subscribe Now
                      </Button>
                    )}
                    {hasSubscription && (
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          setShowCancelSubDialog(true),
                            setSelectedChatbotId(chatbot.id);
                        }}
                        className={`border-red-500/50 text-red-400  w-full bg-gradient-to-r hover:bg-red-500/10 from-[#7d3c3c]/50 to-[#921642]/20 hover:opacity-90  font-medium`}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Current Chatbot Info */}

        {/* Stats Grid - Only show if subscribed */}
        {isSubscribed && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {getStatsForChatbot(selectedChatbot).map((stat, index) => (
              <Card
                key={index}
                className="bg-gray-900/30 backdrop-blur-sm border-gray-800/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-green-400 mt-1">
                        {stat.change} from last week
                      </p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content Tabs - Only show if subscribed */}
        {isSubscribed ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-[#0a0a0a]/60 border min-h-max flex flex-wrap max-w-max gap-1 md:gap-3 text-white border-gray-800">
              <TabsTrigger
                value="overview"
                className="text-gray-400 data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="conversations"
                className="text-gray-400 data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chatting
              </TabsTrigger>
              <TabsTrigger
                value="integration"
                className="text-gray-400 data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]"
              >
                <Code className="h-4 w-4 mr-2" />
                Integration
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="text-gray-400 data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Conversation Trends */}
                  <Card className="bg-transparent backdrop-blur-sm border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Conversation Trends
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Daily conversation volume for {currentChatbot?.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 overflow-x-auto">
                        <ResponsiveContainer width={1000} height="100%">
                          <LineChart data={analytics.trends}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#374151"
                            />
                            <XAxis
                              dataKey="name"
                              stroke="#9CA3AF"
                              tick={{ fill: "#9CA3AF" }}
                            />
                            <YAxis
                              stroke="#9CA3AF"
                              tick={{ fill: "#9CA3AF" }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1F2937",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                                color: "#F3F4F6",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="conversations"
                              stroke="#00F0FF"
                              strokeWidth={2}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="responses"
                              stroke="#FF2E9F"
                              strokeWidth={2}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Response Time Distribution */}
                  <Card className="bg-transparent backdrop-blur-sm border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Response Time Distribution
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        How quickly your {currentChatbot?.name.toLowerCase()}{" "}
                        responds
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 overflow-x-auto">
                        <ResponsiveContainer width={1000} height="100%">
                          <BarChart data={analytics.responseTime}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#374151"
                            />
                            <XAxis
                              dataKey="time"
                              stroke="#9CA3AF"
                              tick={{ fill: "#9CA3AF" }}
                            />
                            <YAxis
                              stroke="#9CA3AF"
                              tick={{ fill: "#9CA3AF" }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1F2937",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                                color: "#F3F4F6", // Better text visibility
                              }}
                            />
                            <Bar
                              dataKey="count"
                              fill="#B026FF"
                              radius={[4, 4, 0, 0]} // Rounded top corners
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Satisfaction */}
                  <Card className="bg-transparent backdrop-blur-sm border-gray-800/50">
                    <CardHeader className="p-2">
                      <CardTitle className="text-white">
                        Customer Satisfaction
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Feedback ratings from{" "}
                        {currentChatbot?.name.toLowerCase()} users
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="">
                      <div className="h-64   overflow-x-auto">
                        <ResponsiveContainer
                          className={` `}
                          width={500}
                          height="100%"
                        >
                          <PieChart className="">
                            <Pie
                              className=" "
                              data={analytics.satisfaction}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}%`}
                            >
                              {analytics.satisfaction.map(
                                (entry: any, index: number) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                )
                              )}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Conversations */}
                  <Card className="bg-transparent backdrop-blur-sm border-gray-800/50">
                    <CardHeader className="p-2">
                      <CardTitle className="text-white">
                        Recent Conversations
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Latest {currentChatbot?.name.toLowerCase()} interactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="space-y-4">
                        {conversations
                          .slice(0, 4)
                          .map((conversation, index) => (
                            <div
                              key={conversation.id ? conversation.id : index}
                              className="flex items-start space-x-3 p-3 rounded-lg bg-[#5d1a6d]/10 hover:bg-[#5a1e92]/15 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-white">
                                    {conversation.customerName || "Anonymous"}
                                  </p>
                                  <Badge
                                    variant={
                                      conversation.status === "answered"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {conversation.status === "answered" ? (
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : (
                                      <Clock className="h-3 w-3 mr-1" />
                                    )}
                                    {conversation.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-400 truncate">
                                  {conversation.messages[0]?.content ||
                                    "No message"}{" "}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    conversation.createdAt
                                  ).toLocaleString()}{" "}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="conversations" className="space-y-6">
              <Card className="bg-transparent backdrop-blur-sm border-gray-800/50">
                <CardHeader className="p-2">
                  <CardTitle className="text-white">
                    All Conversations - {currentChatbot?.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage and respond to {currentChatbot?.name.toLowerCase()}{" "}
                    conversations
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-4">
                    {conversations.map((conversation, index) => (
                      <div
                        key={conversation.id ? conversation.id : index}
                        className="flex items-start space-x-3 p-4 rounded-lg bg-[#147679]/10 hover:bg-[#308285]/15  transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-white">
                              {conversation.customerName || "Anonymous"}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  conversation.status === "answered"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {conversation.status === "answered" ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {conversation.status}
                              </Badge>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-transparent backdrop-blur-md border-gray-800 text-white max-w-2xl p-2">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Conversation Details
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      Customer:{" "}
                                      {conversation.customerName || "Anonymous"}{" "}
                                      | Chatbot: {currentChatbot?.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">
                                        Message
                                      </h4>
                                      <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {conversation.messages.map(
                                          (message: any) => (
                                            <div
                                              key={message.id}
                                              className={`p-3 rounded ${
                                                message.type === "user"
                                                  ? "bg-blue-900/20"
                                                  : "bg-gray-800/50"
                                              }`}
                                            >
                                              <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium">
                                                  {message.type === "user"
                                                    ? "Customer"
                                                    : "Bot"}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  {new Date(
                                                    message.timestamp
                                                  ).toLocaleTimeString()}
                                                </span>
                                              </div>
                                              <p className="text-sm text-gray-300">
                                                {message.content}
                                              </p>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>

                                    <div className="bg-[#b71b86]/10 p-4 rounded space-y-2">
                                      <h4 className="font-medium mb-2">
                                        Form Data
                                      </h4>
                                      {conversation.formData.map(
                                        (field: any) => {
                                          // Map field.question to specific UI components
                                          if (
                                            /name|full name|your name/i.test(
                                              field.question
                                            )
                                          ) {
                                            return (
                                              <div
                                                key="name"
                                                className="flex items-center space-x-2"
                                              >
                                                <User className="h-4 w-4 text-[#00F0FF]" />
                                                <span className="text-gray-300">
                                                  Name: {field.answer}
                                                </span>
                                              </div>
                                            );
                                          }
                                          if (/email/i.test(field.question)) {
                                            return (
                                              <div
                                                key="email"
                                                className="flex items-center space-x-2"
                                              >
                                                <Mail className="h-4 w-4 text-[#FF2E9F]" />
                                                <span className="text-gray-300">
                                                  Email:{" "}
                                                  <a
                                                    href={`mailto:${field.answer}`}
                                                    className="text-blue-400 hover:underline"
                                                  >
                                                    {field.answer}
                                                  </a>
                                                </span>
                                              </div>
                                            );
                                          }
                                          if (
                                            /phone|mobile|contact number/i.test(
                                              field.question
                                            )
                                          ) {
                                            return (
                                              <div
                                                key="phone"
                                                className="flex items-center space-x-2"
                                              >
                                                <Phone className="h-4 w-4 text-[#B026FF]" />
                                                <span className="text-gray-300">
                                                  Phone:{" "}
                                                  <a
                                                    href={`tel:${field.answer}`}
                                                    className="text-blue-400 hover:underline"
                                                  >
                                                    {field.answer}
                                                  </a>
                                                </span>
                                              </div>
                                            );
                                          }
                                          if (
                                            /service|interested in|service required/i.test(
                                              field.question
                                            )
                                          ) {
                                            return (
                                              <div
                                                key="service"
                                                className="flex items-center space-x-2"
                                              >
                                                <Settings className="h-4 w-4 text-green-400" />
                                                <span className="text-gray-300">
                                                  Service: {field.answer}
                                                </span>
                                              </div>
                                            );
                                          }
                                          if (
                                            /date|time|appointment date/i.test(
                                              field.question
                                            )
                                          ) {
                                            return (
                                              <div
                                                key="date"
                                                className="flex items-center space-x-2"
                                              >
                                                <Calendar className="h-4 w-4 text-yellow-400" />
                                                <span className="text-gray-300">
                                                  Date:{" "}
                                                  {new Date(
                                                    field.answer
                                                  ).toLocaleDateString()}
                                                </span>
                                              </div>
                                            );
                                          }
                                          return null;
                                        }
                                      )}
                                    </div>
                                    {conversation.formData.find((f: any) =>
                                      /message|additional comments/i.test(
                                        f.question
                                      )
                                    ) && (
                                      <div className="mt-3">
                                        <p className="text-sm text-gray-400 mb-1">
                                          Additional Message:
                                        </p>
                                        <p className="text-gray-300">
                                          {
                                            conversation.formData.find(
                                              (f: any) =>
                                                /message|additional comments/i.test(
                                                  f.question
                                                )
                                            )?.answer
                                          }
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400">
                            {conversation.messages[0]?.content || "No message"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(conversation.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integration" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chatbot Integration Code */}
                <Card className="bg-transparent backdrop-blur-sm border-gray-800/50">
                  <CardHeader className="p-2">
                    <CardTitle className="text-white">
                      {currentChatbot?.name} Integration
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Copy and paste this code into your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="space-y-4">
                      <div className="relative">
                        <pre className="bg-[#a54b17]/5 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                          <code>{chatbotCode}</code>
                        </pre>
                        <Button
                          size="sm"
                          className="absolute top-2 text-white right-2 bg-[#1a894c]/90  hover:bg-[#1a894c]"
                          onClick={handleCopyCode}
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                      </div>

                      <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-400">
                              Integration Instructions
                            </h4>
                            <p className="text-sm text-gray-300 mt-1">
                              1. Copy the code above
                              <br />
                              2. Paste it before the closing &lt;/body&gt; tag
                              on your website
                              <br />
                              3. The {currentChatbot?.name.toLowerCase()} will
                              automatically appear on your site
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Website Data Management */}
                <Card className="bg-transparent backdrop-blur-sm border-gray-800/50">
                  <CardHeader className="p-2">
                    <CardTitle className="text-white flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Website Data for {currentChatbot?.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your website information for better AI responses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="websiteData" className="text-gray-300">
                          Website Information
                        </Label>
                        <Textarea
                          id="websiteData"
                          value={websiteData}
                          onChange={(e) => setWebsiteData(e.target.value)}
                          className="mt-2 bg-[#8f28a4]/5 border-gray-700 text-white min-h-[200px]"
                          placeholder="Enter your website information, services, business hours, etc."
                        />
                      </div>
                      <Button
                        onClick={saveWebsiteData}
                        className={`bg-gradient-to-r ${currentChatbot?.gradient} hover:opacity-90 text-black`}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Website Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chatbot Settings */}
                <Card className="bg-transparent backdrop-blur-sm border-gray-800/50">
                  <CardHeader className="p-2">
                    <CardTitle className="text-white">
                      {currentChatbot?.name} Settings
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure your chatbot behavior and appearance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="chatbotName"
                            className="text-gray-300"
                          >
                            Chatbot Name
                          </Label>
                          <Input
                            id="chatbotName"
                            className="mt-2 bg-transparent border-gray-700 text-white"
                            placeholder={currentChatbot?.name}
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="welcomeMessage"
                            className="text-gray-300"
                          >
                            Welcome Message
                          </Label>
                          <Input
                            id="welcomeMessage"
                            className="mt-2 bg-transparent border-gray-700 text-white"
                            placeholder="Hi! How can I help you today?"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          className={`bg-gradient-to-r ${currentChatbot?.gradient} hover:opacity-90 text-black`}
                        >
                          Save Changes
                        </Button>
                      </div>
                      <div className="">
                        <Label htmlFor="websiteUrl" className="text-gray-300">
                          Website URL
                        </Label>
                        <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0  sm:space-x-2 mt-2">
                          <Input
                            id="websiteUrl"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            className="bg-transparent border-gray-700 text-white"
                            placeholder="https://yourwebsite.com"
                          />
                          <Button
                            // onClick={saveWebsiteUrl}
                            className="bg-gradient-to-r from-[#00F0FF] to-[#0080FF] hover:opacity-90 text-black"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Appointment Form Questions */}
                <Card className="bg-transparent backdrop-blur-sm border-gray-800/50">
                  <CardHeader className="p-2">
                    <CardTitle className="text-white flex flex-wrap gap-2 p-0 items-center justify-between">
                      <span className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Appointment Form Questions
                      </span>
                      <Button
                        size="sm"
                        onClick={addAppointmentQuestion}
                        className="bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-black"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Question
                      </Button>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure questions for appointment booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {appointmentQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="p-4 bg-[#921a58]/10 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Input
                              value={question.question}
                              onChange={(e) =>
                                updateAppointmentQuestion(
                                  question.id,
                                  "question",
                                  e.target.value
                                )
                              }
                              className="bg-transparent border-gray-600 text-white text-sm"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                removeAppointmentQuestion(question.id)
                              }
                              className="text-red-400 hover:text-red-300 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-4">
                            <select
                              value={question.type}
                              onChange={(e) =>
                                updateAppointmentQuestion(
                                  question.id,
                                  "type",
                                  e.target.value
                                )
                              }
                              className=" bg-[#805283]/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option
                                className="bg-transparent  border border-gray-600 rounded px-2 py-1  text-sm text-black"
                                value="text"
                              >
                                Text
                              </option>
                              <option
                                className="bg-transparent border border-gray-600 rounded px-2 py-1 text-black text-sm"
                                value="email"
                              >
                                Email
                              </option>
                              <option
                                className="bg-transparent border border-gray-600 rounded px-2 py-1 text-black text-sm"
                                value="tel"
                              >
                                Phone
                              </option>
                              <option
                                className="bg-transparent border border-gray-600 rounded px-2 py-1 text-black text-sm"
                                value="date"
                              >
                                Date
                              </option>
                              <option
                                className="bg-transparent border border-gray-600 rounded px-2 py-1 text-black text-sm"
                                value="select"
                              >
                                Select
                              </option>
                            </select>
                            <label className="flex items-center text-sm text-gray-300">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) =>
                                  updateAppointmentQuestion(
                                    question.id,
                                    "required",
                                    e.target.checked
                                  )
                                }
                                className="mr-2"
                              />
                              Required
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4">
                      <Button
                        onClick={saveAppointmentQuestions}
                        className={`bg-gradient-to-r ${currentChatbot?.gradient} hover:opacity-90 text-black`}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Questions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-16">
            <Lock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Subscription Required
            </h3>
            <p className="text-gray-500 mb-6">
              Subscribe to access dashboard features for {currentChatbot?.name}
            </p>
            <Button
              onClick={() =>
                router.push(`/web/pricing?id=${currentChatbot?.id}`)
              }
              className={`bg-gradient-to-r ${currentChatbot?.gradient} hover:opacity-90 text-black font-semibold`}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Subscribe to {currentChatbot?.name}
            </Button>
          </div>
        )}
      </div>
      <AlertDialog
        open={showCancelSubDialog}
        onOpenChange={setShowCancelSubDialog}
      >
        <AlertDialogContent className="  backdrop-blur-md">
          <AlertDialogContent>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF2E9F] to-[#B026FF]">
                Cancel Subscription
              </h2>
              <XMarkIcon
                onClick={() => setShowCancelSubDialog(false)}
                className="text-gray-400 size-6 cursor-pointer hover:text-white"
              />
            </div>
            <form onSubmit={handleCancelSubscription} className="space-y-6">
              <label className="block text-lg font-semibold text-gray-200">
                Please Provide Reason
              </label>
              <textarea
                name="reason"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#B026FF]"
                placeholder="Cancellation reason"
                required
              />
              <div className="flex justify-center gap-4">
                <button
                  type="submit"
                  onClick={() => setMode("Immediate")}
                  className="px-6 py-2 bg-gradient-to-r from-[#FF2E9F]/20 to-[#B026FF]/20 bg-transparent  text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? "Cancelling..." : "Immediate"}
                </button>
                <button
                  type="submit"
                  onClick={() => setMode("End-of-term")}
                  className="px-6 py-2 bg-gradient-to-r from-[#00F0FF]/20 to-[#B026FF]/20 bg-transparent  text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  {isImmediateSubmitting ? "Cancelling..." : "End-of-term"}
                </button>
              </div>
            </form>
          </AlertDialogContent>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
