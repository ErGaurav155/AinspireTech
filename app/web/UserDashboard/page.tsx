"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Check,
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
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  cancelRazorPaySubscription,
  getSubscription,
  updateSubcriptionInfo,
} from "@/lib/action/subscription.action";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useTheme } from "next-themes";
import {
  getUserById,
  setScrappedFile,
  setWebsiteScrapped,
} from "@/lib/action/user.actions";
import { Toast } from "@/components/ui/toast";
import z from "zod";
import { countryCodes } from "@/constant";
import OTPVerification from "@/components/shared/OTPVerification";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  content: string;
  level: number;
}

interface ScrapedData {
  fileName: string;
  domain: string;
  userId: string;
  totalPages: number;
  maxLevel: number;
  cloudinaryLink: string;
  pages: ScrapedPage[];
}
// Chatbot types configuration
const chatbotTypes = [
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
  // {
  //   id: "chatbot-e-commerce",
  //   name: "E-Commerce",
  //   icon: ShoppingCart,
  //   description: "Boost sales with AI shopping assistant",
  //   category: "Website",
  //   color: "text-[#FF2E9F]",
  //   gradient: "from-[#FF2E9F] to-[#B026FF]",
  //   features: [
  //     "Product recommendations",
  //     "Order tracking",
  //     "Cart recovery",
  //     "Inventory queries",
  //   ],
  // },
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
const phoneFormSchema = z.object({
  MobileNumber: z
    .string()
    .min(10, "MOBILE number is required")
    .regex(/^\d+$/, "invalid number"),
});
type PhoneFormData = z.infer<typeof phoneFormSchema>;

export default function DashboardPage() {
  const router = useRouter();
  const [selectedChatbot, setSelectedChatbot] = useState(
    "chatbot-customer-support"
  );
  const [copied, setCopied] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any>({});
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [step, setStep] = useState<"phone" | "otp" | "weblink">("weblink");
  const [phone, setPhone] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("+1"); // Default to US

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
  const [defaultValue, setDefaultValue] = useState("overview");
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [webError, setWebError] = useState<string | null>(null);
  const [scrapingComplete, setScrapingComplete] = useState(false);
  const [rawScrapedData, setRawScrapedData] = useState<any>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showCancelSubDialog, setShowCancelSubDialog] = useState(false);
  const [cancelSub, setCancelSub] = useState(false);
  const [isWebScrapped, setWebIsScrapped] = useState(true);
  const [webLoading, setWebLoading] = useState(false);
  const [fileLink, setFileLink] = useState();
  const [chatbotNamed, setChatbotNamed] = useState<null | string>(null);
  const [chatbotMessaged, setChatbotMessaged] = useState<null | string>(null);

  const [infoLoading, setInfoLoading] = useState(false);

  const [selectedChatbotId, setSelectedChatbotId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImmediateSubmitting, setIsImmediateSubmitting] = useState(false);
  const [mode, setMode] = useState<"Immediate" | "End-of-term">("End-of-term");
  const [faqQuestions, setFaqQuestions] = useState([
    {
      id: "1",
      question: "What are your business hours?",
      answer: "We are open from 9 AM to 6 PM, Monday to Friday.",
      category: "General",
    },
    {
      id: "2",
      question: "How can I contact support?",
      answer:
        "You can contact our support team via email at support@example.com or call us at (555) 123-4567.",
      category: "Support",
    },
  ]);
  const { userId, isLoaded } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme || "light";

  // Theme-based styles
  const themeStyles = useMemo(() => {
    const isDark = currentTheme === "dark";
    return {
      textPrimary: isDark ? "text-white" : "text-n-7",
      textSecondary: isDark ? "text-gray-300" : "text-n-5",
      textMuted: isDark ? "text-gray-400" : "text-n-5",
      containerBg: isDark ? "bg-transparent" : "bg-gray-50",
      loadingBg: isDark ? "bg-black" : "bg-white",
      cardBg: isDark ? "bg-gray-900/30" : "bg-white",
      cardBorder: isDark ? "border-gray-800/50" : "border-gray-200",
      hoverBorder: isDark
        ? "hover:border-gray-700/50"
        : "hover:border-gray-300",
      activeBorder: isDark ? "border-[#00F0FF]/50" : "border-[#00F0FF]",
      badgeActiveBg: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-600 border-green-300",
      badgeInactiveBg: isDark
        ? "bg-gray-700/50 text-gray-400"
        : "bg-gray-100 text-gray-600 border-gray-300",
      tableHeaderBg: isDark ? "bg-gray-800/50" : "bg-gray-100",
      tableBorder: isDark ? "border-gray-700" : "border-gray-300",
      tableRowHover: isDark ? "hover:bg-gray-800/20" : "hover:bg-gray-50",
      inputBg: isDark ? "bg-transparent" : "bg-white",
      inputBorder: isDark ? "border-gray-700" : "border-gray-300",
      dialogBg: isDark
        ? "bg-gray-900/95 backdrop-blur-md"
        : "bg-white backdrop-blur-md",
      alertBg: isDark
        ? "bg-gray-900/95 backdrop-blur-md"
        : "bg-white backdrop-blur-md",
    };
  }, [currentTheme]);
  const {
    handleSubmit: handlePhoneSubmit,
    register: registerPhone,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneFormSchema),
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const userInfo = await getUserById(userId!);
      if (userInfo) {
        setWebsiteUrl(userInfo.websiteUrl || null);
        setWebIsScrapped(userInfo.isScrapped);
        setFileLink(userInfo.scrappedFile);
        setPhone(userInfo.phone);
      }
      // Load subscriptions
      const subscriptionsData = await apiClient.getSubscriptions(userId!);

      const subscriptionsMap = subscriptionsData.reduce(
        (acc: any, sub: any) => {
          acc[sub.chatbotType] = sub;
          return acc;
        },
        {}
      );
      setSubscriptions(subscriptionsMap);

      if (selectedChatbot === "chatbot-education") {
        setDefaultValue("integration");
      } else {
        setDefaultValue("overview");
      }

      // Load appointment questions for selected chatbot
      const questionsResponse = await apiClient.getAppointmentQuestions(
        selectedChatbot
      );
      setAppointmentQuestions(questionsResponse.appointmentQuestions.questions);
      const faqResponse = await apiClient.getFAQ(userId!, selectedChatbot);
      setFaqQuestions(faqResponse.faq?.questions || []);
      // Load analytics if subscribed
      // {selectedChatbot === "chatbot-lead-generation" ||
      //           (selectedChatbot === "chatbot-customer-support"
      if (
        (selectedChatbot === "chatbot-lead-generation" ||
          selectedChatbot === "chatbot-customer-support") &&
        subscriptionsMap[selectedChatbot]?.status === "active"
      ) {
        if (selectedChatbot === "chatbot-lead-generation") {
          const analyticsData = await apiClient.getAnalytics(selectedChatbot);
          setAnalytics(analyticsData.analytics);
        }
        // Load conversations
        const conversationsData = await apiClient.getConversations(
          selectedChatbot
        );
        setConversations(conversationsData.conversations);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [selectedChatbot, userId]);

  useEffect(() => {
    if (!isLoaded) {
      return; // Wait for auth to load
    }
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    loadDashboardData();
  }, [userId, loadDashboardData, router, isLoaded]);
  const handleCopyCode = () => {
    const code =
      subscriptions[selectedChatbot]?.chatbotName === "chatbot-education"
        ? `<script 
src="https://ainspiretech.com/mcqchatbotembed.js" 
data-mcq-chatbot='{
  "userId":"${userId}",
  "isAuthorized":${isSubscribed},
  "chatbotType":"${selectedChatbot}",
  "apiUrl":"https://ainspiretech.com",
  "primaryColor":"#00F0FF",
  "position":"bottom-right",
  "welcomeMessage":"${subscriptions[selectedChatbot]?.chatbotMessage}",
  "chatbotName":"${subscriptions[selectedChatbot]?.chatbotName}"
}'>
</script>`
        : `<script 
src="https://ainspiretech.com/chatbotembed.js" 
data-chatbot-config='{
  "userId":"${userId}",
  "isAuthorized":${isSubscribed},
  "filename":"${subscriptions[selectedChatbot]?.filename}",
  "chatbotType":"${selectedChatbot}",
  "apiUrl":"https://ainspiretech.com",
  "primaryColor":"#00F0FF",
  "position":"bottom-right",
  "welcomeMessage":"${subscriptions[selectedChatbot]?.chatbotMessage}",
  "chatbotName":"${subscriptions[selectedChatbot]?.chatbotName}"
}'>
</script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setCopied(false);
    }, 3000);

    toast({
      title: "Code copied!",
      description: "Universal widget code copied to clipboard",
    });
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

  const handleScrape = async () => {
    if (!websiteUrl || !userId) {
      setWebError("Please enter a valid URL.");
      return;
    }

    // Client-side URL validation: must start with http:// or https:// and be a valid URL
    if (!/^https?:\/\//i.test(websiteUrl.trim())) {
      setWebError("URL must start with http:// or https://");
      return;
    }

    try {
      new URL(websiteUrl.trim());
    } catch {
      setWebError("Invalid URL format. Please enter a valid URL.");
      return;
    }
    setWebLoading(true);
    setWebError(null);
    setScrapedData(null);
    setScrapingComplete(false);
    setRawScrapedData(null);

    try {
      // Step 1: Call scraping API
      const webSubscriptionId = subscriptions[selectedChatbot]?.subscriptionId;
      const webSelectedChatbot = selectedChatbot;

      const scrapeResponse = await fetch(
        `/api/scrape-anu?url=${encodeURIComponent(
          websiteUrl
        )}&userId=${encodeURIComponent(
          userId
        )}&subscriptionId=${webSubscriptionId}&agentId=${webSelectedChatbot}`
      );

      if (!scrapeResponse.ok) {
        if (scrapeResponse.status === 429) {
          throw new Error("Rate limit reached. Please try again later.");
        }
        const errorText = await scrapeResponse.text();
        throw new Error(errorText || "Failed to scrape website.");
      }

      const scrapeResult = await scrapeResponse.json();

      if (scrapeResult.success) {
        setRawScrapedData(scrapeResult.data);
        setScrapingComplete(true);
        console.log("rawScrapedData:", scrapeResult.data);
        // Step 2: Automatically call processing API
        await handleProcessData(scrapeResult.data);
      } else {
        throw new Error("Scraping failed");
      }
    } catch (err) {
      setWebError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setWebLoading(false);
    }
  };

  const handleProcessData = async (data: any) => {
    setProcessing(true);
    setWebError(null);

    try {
      const processResponse = await fetch("/api/scrape-anu/process-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!processResponse.ok) {
        const errorText = await processResponse.text();
        throw new Error(errorText || "Failed to process data.");
      }

      const processResult = await processResponse.json();

      if (processResult.success) {
        await setScrappedFile(userId!, processResult.data.cloudinaryLink);

        await setWebsiteScrapped(userId!);

        setScrapedData(processResult.data);
      } else {
        throw new Error("Data processing failed");
      }
    } catch (err) {
      setWebError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing data."
      );
    } finally {
      setProcessing(false);
      router.refresh();
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

  // Add this function near your other functions
  const saveFAQ = async () => {
    try {
      await apiClient.saveFAQ(userId!, selectedChatbot, faqQuestions);
      toast({
        title: "FAQ saved successfully!",
        description: "Your FAQ questions have been updated.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to save FAQ",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const addFAQQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      question: "",
      answer: "",
      category: "General",
    };
    setFaqQuestions([...faqQuestions, newQuestion]);
  };

  const updateFAQQuestion = (id: string, field: string, value: any) => {
    setFaqQuestions(
      faqQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const removeFAQQuestion = (id: string) => {
    setFaqQuestions(faqQuestions.filter((q) => q.id !== id));
  };
  const handlePhoneSubmission = async (data: PhoneFormData) => {
    setIsOtpSubmitting(true);
    try {
      const fullPhoneNumber = `${countryCode}${data.MobileNumber}`;

      const res = await fetch("/api/web/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullPhoneNumber }),
      });
      if (res.ok) {
        setPhone(fullPhoneNumber);
        setStep("otp");
      } else {
        console.error("Failed to send OTP:", res.statusText);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setIsOtpSubmitting(false);
    }
  };
  const handleChangedInfo = async () => {
    const subcriptionId = subscriptions[selectedChatbot]?.subscriptionId;
    setInfoLoading(true);
    try {
      if (
        !userId ||
        !selectedChatbot ||
        !subcriptionId ||
        !chatbotMessaged ||
        !chatbotNamed
      ) {
        return;
      }

      const getSub = await updateSubcriptionInfo(
        userId!,
        selectedChatbot,
        subcriptionId,
        chatbotMessaged!,
        chatbotNamed!
      );
      if (getSub) {
        toast({
          title: " Got Success",
          description: "Updated chatbotInfo successfully!",
          duration: 3000,
          className: "success-toast",
        });
      } else {
        console.error("Failed to update chatbotInfo:", getSub.statusText);
      }
    } catch (error) {
      console.error("Error updating chatbotInfo:", error);
    } finally {
      setInfoLoading(false);
    }
  };
  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-transparent  flex items-center justify-center h-full w-full">
        <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) return null;

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
          value: `$${overview.salesAssisted || "0"}`,
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
    <div
      className={`min-h-screen ${themeStyles.containerBg} ${themeStyles.textPrimary}`}
    >
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
          <h2 className={`text-2xl font-bold ${themeStyles.textPrimary} mb-6`}>
            Your AI Chatbots
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {chatbotTypes?.map((chatbot) => {
              const isActive = selectedChatbot === chatbot.id;
              const hasSubscription =
                subscriptions[chatbot.id]?.status === "active";

              return (
                <Card
                  key={chatbot.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    themeStyles.cardBg
                  } ${themeStyles.cardBorder} ${
                    isActive
                      ? `bg-gradient-to-br ${
                          theme === "dark"
                            ? "from-gray-800/50 to-gray-900/50"
                            : "from-blue-50 to-purple-50"
                        } ${themeStyles.activeBorder}`
                      : `${themeStyles.hoverBorder}`
                  }`}
                  onClick={() => {
                    setSelectedChatbot(chatbot.id);
                    setChatbotNamed(subscriptions[chatbot.id]?.chatbotName);
                    setChatbotMessaged(
                      subscriptions[chatbot.id]?.chatbotMessage
                    );
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <chatbot.icon className={`h-8 w-8 ${chatbot.color}`} />
                      {hasSubscription ? (
                        <Badge className={themeStyles.badgeActiveBg}>
                          <Crown className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className={themeStyles.badgeInactiveBg}
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <h3
                      className={`font-semibold ${themeStyles.textPrimary} mb-1`}
                    >
                      {chatbot.name}
                    </h3>
                    <p
                      className={`text-xs ${themeStyles.textSecondary} mb-3 font-montserrat`}
                    >
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
                        className={`border-red-500/50 text-red-400 w-full bg-gradient-to-r hover:bg-red-500/10 ${
                          theme === "dark"
                            ? "from-[#7d3c3c]/50 to-[#921642]/20"
                            : "from-red-50 to-pink-50"
                        } hover:opacity-90 font-medium`}
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

        {/* Stats Grid - Only show if subscribed */}
        {currentChatbot?.id === "chatbot-lead-generation" &&
          isSubscribed &&
          analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {getStatsForChatbot(selectedChatbot).map((stat, index) => (
                <Card
                  key={index}
                  className={`${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm ${themeStyles.textSecondary} mb-1`}
                        >
                          {stat.title}
                        </p>
                        <p
                          className={`text-2xl font-bold ${themeStyles.textPrimary}`}
                        >
                          {stat.value}
                        </p>
                        <p className="text-xs text-green-400 mt-1 font-montserrat">
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
          <Tabs defaultValue={`${defaultValue}`} className="space-y-6">
            <TabsList
              className={`${
                theme === "dark"
                  ? "bg-[#0a0a0a]/60 border-gray-800"
                  : "bg-gray-100 border-gray-300"
              } border min-h-max flex flex-wrap max-w-max gap-1 md:gap-3 ${
                themeStyles.textPrimary
              }`}
            >
              {(selectedChatbot === "chatbot-lead-generation" ||
                selectedChatbot === "chatbot-customer-support") && (
                <TabsTrigger
                  value="overview"
                  className={`${themeStyles.textSecondary} data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
              )}
              {(selectedChatbot === "chatbot-lead-generation" ||
                selectedChatbot === "chatbot-customer-support") && (
                <TabsTrigger
                  value="conversations"
                  className={`${themeStyles.textSecondary} data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]`}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chatting
                </TabsTrigger>
              )}
              <TabsTrigger
                value="integration"
                className={`${themeStyles.textSecondary} data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]`}
              >
                <Code className="h-4 w-4 mr-2" />
                Integration
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className={`${themeStyles.textSecondary} data-[state=active]:text-black data-[state=active]:bg-[#2d8a55]`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversation Trends */}
                {analytics &&
                  currentChatbot?.id === "chatbot-lead-generation" && (
                    <Card
                      className={`${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
                    >
                      <CardHeader>
                        <CardTitle className={themeStyles.textPrimary}>
                          Conversation Trends
                        </CardTitle>
                        <CardDescription className={themeStyles.textSecondary}>
                          Daily conversation volume for {currentChatbot?.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 overflow-x-auto ">
                          <ResponsiveContainer width={1000} height="100%">
                            <LineChart data={analytics.trends}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={
                                  theme === "dark" ? "#374151" : "#e5e7eb"
                                }
                              />
                              <XAxis
                                dataKey="name"
                                stroke={themeStyles.textSecondary}
                                tick={{ fill: themeStyles.textSecondary }}
                              />
                              <YAxis
                                stroke={themeStyles.textSecondary}
                                tick={{ fill: themeStyles.textSecondary }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor:
                                    theme === "dark" ? "#1F2937" : "#ffffff",
                                  border:
                                    theme === "dark"
                                      ? "1px solid #374151"
                                      : "1px solid #e5e7eb",
                                  borderRadius: "8px",
                                  color:
                                    theme === "dark" ? "#F3F4F6" : "#1f2937",
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
                  )}

                {/* Response Time Distribution */}
                {analytics &&
                  currentChatbot?.id === "chatbot-lead-generation" && (
                    <Card
                      className={`${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
                    >
                      <CardHeader>
                        <CardTitle className={themeStyles.textPrimary}>
                          Response Time Distribution
                        </CardTitle>
                        <CardDescription className={themeStyles.textSecondary}>
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
                                stroke={
                                  theme === "dark" ? "#374151" : "#e5e7eb"
                                }
                              />
                              <XAxis
                                dataKey="time"
                                stroke={themeStyles.textSecondary}
                                tick={{ fill: themeStyles.textSecondary }}
                              />
                              <YAxis
                                stroke={themeStyles.textSecondary}
                                tick={{ fill: themeStyles.textSecondary }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor:
                                    theme === "dark" ? "#1F2937" : "#ffffff",
                                  border:
                                    theme === "dark"
                                      ? "1px solid #374151"
                                      : "1px solid #e5e7eb",
                                  borderRadius: "8px",
                                  color:
                                    theme === "dark" ? "#F3F4F6" : "#1f2937",
                                }}
                              />
                              <Bar
                                dataKey="count"
                                fill="#B026FF"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Customer Satisfaction */}
                {analytics &&
                  currentChatbot?.id === "chatbot-lead-generation" && (
                    <Card
                      className={`${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
                    >
                      <CardHeader className="p-2">
                        <CardTitle className={themeStyles.textPrimary}>
                          Customer Satisfaction
                        </CardTitle>
                        <CardDescription className={themeStyles.textSecondary}>
                          Feedback ratings from{" "}
                          {currentChatbot?.name.toLowerCase()} users
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="">
                        <div className="h-64 overflow-x-auto">
                          <ResponsiveContainer width={500} height="100%">
                            <PieChart>
                              <Pie
                                data={analytics.satisfaction}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, value }) =>
                                  `${name}: ${value}%`
                                }
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
                  )}

                {/* Recent Conversations */}
                {(selectedChatbot === "chatbot-lead-generation" ||
                  selectedChatbot === "chatbot-customer-support") && (
                  <Card
                    className={`${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
                  >
                    <CardHeader className="p-2">
                      <CardTitle className={themeStyles.textPrimary}>
                        Recent Conversations
                      </CardTitle>
                      <CardDescription className={themeStyles.textSecondary}>
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
                              className={`flex items-start space-x-3 p-3 rounded-lg ${
                                theme === "dark"
                                  ? "bg-[#5d1a6d]/10 hover:bg-[#5a1e92]/15"
                                  : "bg-purple-50 hover:bg-purple-100"
                              } transition-colors`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium ">
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
                                <p
                                  className={`text-sm ${themeStyles.textSecondary} truncate font-montserrat`}
                                >
                                  {conversation.messages[0]?.content ||
                                    "No message"}{" "}
                                </p>
                                <p
                                  className={`text-xs ${themeStyles.textMuted} mt-1 font-montserrat`}
                                >
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
                )}
              </div>
            </TabsContent>

            <TabsContent value="conversations" className="space-y-6">
              <Card
                className={`${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
              >
                <CardHeader className="p-2">
                  <CardTitle className={themeStyles.textPrimary}>
                    All Conversations - {currentChatbot?.name}
                  </CardTitle>
                  <CardDescription className={themeStyles.textSecondary}>
                    Manage and respond to {currentChatbot?.name.toLowerCase()}{" "}
                    conversations
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-4">
                    {conversations?.map((conversation, index) => (
                      <div
                        key={conversation.id ? conversation.id : index}
                        className={`flex items-start space-x-3 p-4 rounded-lg ${
                          theme === "dark"
                            ? "bg-[#147679]/10 hover:bg-[#308285]/15"
                            : "bg-cyan-50 hover:bg-cyan-100"
                        } transition-colors`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium ">
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
                                <DialogContent
                                  className={`${themeStyles.dialogBg} border-gray-800  max-w-2xl p-2 font-montserrat`}
                                >
                                  <DialogHeader>
                                    <DialogTitle>
                                      Conversation Details
                                    </DialogTitle>
                                    <DialogDescription
                                      className={themeStyles.textSecondary}
                                    >
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
                                                  ? theme === "dark"
                                                    ? "bg-blue-900/20"
                                                    : "bg-blue-100"
                                                  : theme === "dark"
                                                  ? "bg-gray-800/50"
                                                  : "bg-gray-100"
                                              }`}
                                            >
                                              <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium">
                                                  {message.type === "user"
                                                    ? "Customer"
                                                    : "Bot"}
                                                </span>
                                                <span
                                                  className={`text-xs ${themeStyles.textMuted}`}
                                                >
                                                  {new Date(
                                                    message.timestamp
                                                  ).toLocaleTimeString()}
                                                </span>
                                              </div>
                                              <p
                                                className={`text-sm ${themeStyles.textSecondary}`}
                                              >
                                                {message.content}
                                              </p>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                    <div
                                      className={`bg-[#b71b86]/10 p-4 rounded ${themeStyles.textMuted} space-y-2 `}
                                    >
                                      <h4 className="font-medium mb-2">
                                        Form Data
                                      </h4>
                                      {conversation &&
                                        conversation?.formData &&
                                        conversation?.formData.length === 0 && (
                                          <p className="text-sm">
                                            No form data submitted.
                                          </p>
                                        )}
                                      {conversation &&
                                        conversation?.formData &&
                                        Array.isArray(conversation?.formData) &&
                                        conversation?.formData?.map(
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
                                                  <span className="">
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
                                                  <span className="">
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
                                                  <span className="">
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
                                                  <span className="">
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
                                                  <span className="">
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
                                    {conversation &&
                                      conversation?.formData &&
                                      Array.isArray(conversation?.formData) &&
                                      conversation?.formData?.find((f: any) =>
                                        /message|additional comments/i.test(
                                          f.question
                                        )
                                      ) && (
                                        <div className="mt-3">
                                          <p className="text-sm  mb-1">
                                            Additional Message:
                                          </p>
                                          <p className="">
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
                          <p
                            className={`text-sm ${themeStyles.textSecondary} font-montserrat`}
                          >
                            {conversation.messages[0]?.content || "No message"}
                          </p>
                          <p
                            className={`text-xs ${themeStyles.textMuted} mt-1 font-montserrat`}
                          >
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
                <Card
                  className={`${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
                >
                  <CardHeader className="p-4">
                    <CardTitle
                      className={`${themeStyles.textPrimary} flex items-center`}
                    >
                      <Code className="h-5 w-5 mr-2" />
                      {currentChatbot?.name} Widget Integration
                    </CardTitle>
                    <CardDescription className={themeStyles.textSecondary}>
                      Copy and paste the code below to integrate{" "}
                      {currentChatbot?.name} into your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-400">
                            Universal Integration
                          </h4>
                          <p
                            className={`text-sm ${themeStyles.textSecondary} mt-1 font-montserrat`}
                          >
                            This code works on any website platform. Simply copy
                            and paste it before the closing &lt;/body&gt; tag.
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <pre
                          className={`${
                            theme === "dark" ? "bg-gray-900/80" : "bg-gray-100"
                          } p-4 rounded-lg text-sm ${
                            themeStyles.textSecondary
                          } overflow-x-auto min-h-max`}
                        >
                          <code className="min-h-max block overflow-hidden text-wrap h-20">
                            {subscriptions[selectedChatbot]?.chatbotName ===
                            "chatbot-education"
                              ? `<script 
src="https://ainspiretech.com/mcqchatbotembed.js" 
data-mcq-chatbot='{
  "userId":"${userId}",
  "isAuthorized":${isSubscribed},
  "chatbotType":"${selectedChatbot}",
  "apiUrl":"https://ainspiretech.com",
  "primaryColor":"#00F0FF",
  "position":"bottom-right",
  "welcomeMessage":"${subscriptions[selectedChatbot]?.chatbotMessage}",
  "chatbotName":"${subscriptions[selectedChatbot]?.chatbotName}"
}'>
</script>`
                              : `<script 
src="https://ainspiretech.com/chatbotembed.js" 
data-chatbot-config='{
  "userId":"${userId}",
  "isAuthorized":${isSubscribed},
  "filename":"${subscriptions[selectedChatbot]?.filename}",
  "chatbotType":"${selectedChatbot}",
  "apiUrl":"https://ainspiretech.com",
  "primaryColor":"#00F0FF",
  "position":"bottom-right",
  "welcomeMessage":"${subscriptions[selectedChatbot]?.chatbotMessage}",
  "chatbotName":"${subscriptions[selectedChatbot]?.chatbotName}"
}'>
</script>`}
                          </code>
                        </pre>

                        <Button
                          size="sm"
                          className="absolute top-2 right-2 bg-green-600 hover:bg-green-700"
                          onClick={handleCopyCode}
                          disabled={copied}
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Code
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div
                      className={`mt-6 p-4 ${
                        theme === "dark"
                          ? "bg-amber-900/20 border-amber-400/30"
                          : "bg-amber-50 border-amber-200"
                      } border rounded-lg`}
                    >
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-amber-400">
                            Important Notes
                          </h4>
                          <ul
                            className={`text-sm ${themeStyles.textSecondary} mt-1 list-disc list-inside space-y-1 font-montserrat`}
                          >
                            <li>
                              Works on WordPress, React, Angular, Vue, plain
                              HTML - any website
                            </li>
                            <li>
                              Just copy and paste the code anywhere in your
                              website
                            </li>
                            <li>
                              The widget will automatically appear in the
                              bottom-right corner
                            </li>
                            <li>
                              Make sure your subscription is active
                              (isAuthorized: true)
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
                >
                  <CardHeader className="p-4">
                    <CardTitle
                      className={`${themeStyles.textPrimary} flex items-center justify-between`}
                    >
                      <span className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        FAQ Questions for {currentChatbot?.name}
                      </span>
                      <Button
                        size="sm"
                        onClick={addFAQQuestion}
                        className="bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-black"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add FAQ
                      </Button>
                    </CardTitle>
                    <CardDescription className={themeStyles.textSecondary}>
                      Add frequently asked questions and answers for your
                      chatbot
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {faqQuestions.map((faq) => (
                        <div
                          key={faq.id}
                          className={`p-4 rounded-lg ${
                            theme === "dark" ? "bg-[#1a4d7c]/10" : "bg-blue-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1 mr-2">
                              <Input
                                value={faq.question}
                                onChange={(e) =>
                                  updateFAQQuestion(
                                    faq.id,
                                    "question",
                                    e.target.value
                                  )
                                }
                                className={`${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.textPrimary} text-sm font-montserrat mb-2`}
                                placeholder="FAQ Question"
                              />
                              {!faq.question.trim() && (
                                <p className="text-red-500 text-xs mt-1 font-montserrat">
                                  Question cannot be empty
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFAQQuestion(faq.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <select
                              value={faq.category}
                              onChange={(e) =>
                                updateFAQQuestion(
                                  faq.id,
                                  "category",
                                  e.target.value
                                )
                              }
                              className={`${
                                theme === "dark"
                                  ? "bg-[#2d5a8c]/40 border-gray-600"
                                  : "bg-white border-gray-300"
                              } border rounded px-2 py-1 ${
                                themeStyles.textPrimary
                              } text-sm`}
                            >
                              <option value="General">General</option>
                              <option value="Support">Support</option>
                              <option value="Pricing">Pricing</option>
                              <option value="Technical">Technical</option>
                              <option value="Services">Services</option>
                            </select>
                          </div>

                          <div className="relative">
                            <Textarea
                              value={faq.answer}
                              onChange={(e) =>
                                updateFAQQuestion(
                                  faq.id,
                                  "answer",
                                  e.target.value
                                )
                              }
                              className={`${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.textPrimary} text-sm font-montserrat min-h-[80px]`}
                              placeholder="FAQ Answer"
                            />
                            {!faq.answer.trim() && (
                              <p className="text-red-500 text-xs mt-1 font-montserrat">
                                Answer cannot be empty
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {faqQuestions.length === 0 && (
                      <div className="text-center py-8 font-montserrat">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className={themeStyles.textSecondary}>
                          No FAQ questions added yet
                        </p>
                        <p className={`text-sm ${themeStyles.textMuted} mt-1`}>
                          Add some frequently asked questions to help your users
                        </p>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button
                        disabled={
                          faqQuestions.length === 0 ||
                          faqQuestions.some(
                            (faq) => !faq.question.trim() || !faq.answer.trim()
                          )
                        }
                        onClick={saveFAQ}
                        className={`bg-gradient-to-r ${currentChatbot?.gradient} hover:opacity-90 text-black disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {faqQuestions.some(
                          (faq) => !faq.question.trim() || !faq.answer.trim()
                        )
                          ? "Please fill all questions and answers"
                          : "Save FAQ Questions"}
                      </Button>

                      {faqQuestions.length > 0 &&
                        faqQuestions.some(
                          (faq) => !faq.question.trim() || !faq.answer.trim()
                        ) && (
                          <p className="text-red-500 text-sm mt-2 font-montserrat">
                            Please fill in all questions and answers before
                            saving
                          </p>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chatbot Settings */}
                <Card
                  className={`${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
                >
                  <CardHeader className="p-2">
                    <CardTitle className={themeStyles.textPrimary}>
                      {currentChatbot?.name} Settings
                    </CardTitle>
                    <CardDescription className={themeStyles.textSecondary}>
                      Configure your chatbot behavior and appearance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="chatbotName"
                            className={themeStyles.textSecondary}
                          >
                            Chatbot Name
                          </Label>
                          <Input
                            id="chatbotName"
                            value={
                              chatbotNamed ? chatbotNamed : currentChatbot?.name
                            }
                            onChange={(event) =>
                              setChatbotNamed(event?.target.value)
                            }
                            className={`mt-2 ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.textPrimary} font-montserrat`}
                            placeholder={
                              chatbotNamed ? chatbotNamed : currentChatbot?.name
                            }
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="welcomeMessage"
                            className={themeStyles.textSecondary}
                          >
                            Welcome Message
                          </Label>
                          <Input
                            id="welcomeMessage"
                            value={
                              chatbotMessaged
                                ? chatbotMessaged
                                : "Hi! How can I help you today?"
                            }
                            onChange={(event) =>
                              setChatbotMessaged(event?.target.value)
                            }
                            className={`mt-2 ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.textPrimary} font-montserrat`}
                            placeholder={
                              chatbotMessaged
                                ? chatbotMessaged
                                : "Hi! How can I help you today?"
                            }
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          onClick={() => handleChangedInfo()}
                          disabled={
                            infoLoading || !chatbotMessaged || !chatbotNamed
                          }
                          className={`bg-gradient-to-r ${currentChatbot?.gradient} hover:opacity-90 text-black`}
                        >
                          {infoLoading ? "Saving...." : "Save Changes"}
                        </Button>
                      </div>
                      <div className="">
                        <Label
                          htmlFor="websiteUrl"
                          className={themeStyles.textSecondary}
                        >
                          Website URL
                        </Label>
                        {currentChatbot?.id !== "chatbot-education" && (
                          <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                            {websiteUrl === null || !isWebScrapped ? (
                              <Input
                                disabled={websiteUrl === null ? true : false}
                                id="websiteUrl"
                                value={websiteUrl!}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                className={`${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.textPrimary} font-montserrat`}
                                placeholder="https://yourwebsite.com"
                              />
                            ) : (
                              <p
                                className={`flex items-center justify-center border ${themeStyles.inputBorder} ${themeStyles.textPrimary} font-montserrat p-2 rounded-lg w-full`}
                              >
                                {websiteUrl}
                              </p>
                            )}
                            <Button
                              disabled={
                                (websiteUrl === null
                                  ? false
                                  : isWebScrapped
                                  ? true
                                  : false) ||
                                loading ||
                                processing
                              }
                              onClick={() => handleScrape()}
                              className={` hover:opacity-90 text-black ${
                                websiteUrl === null || isWebScrapped === false
                                  ? "bg-gradient-to-r from-[#00F0FF] to-[#0080FF]"
                                  : "bg-gray-500"
                              }`}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              {webLoading
                                ? "Scraping..."
                                : processing
                                ? "Processing..."
                                : "Start Scraping"}
                            </Button>
                          </div>
                        )}
                        {currentChatbot?.id === "chatbot-lead-generation" && (
                          <>
                            {" "}
                            <div className="pt-4">
                              <Label
                                htmlFor="websiteUrl"
                                className={themeStyles.textSecondary}
                              >
                                Whatsapp Number
                              </Label>
                              <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                                {phone === null ? (
                                  <p
                                    className={`flex items-center justify-center border ${themeStyles.inputBorder} ${themeStyles.textPrimary} font-montserrat p-2 rounded-lg w-full`}
                                  >
                                    Please Add Whatsapp Number.
                                  </p>
                                ) : (
                                  <p
                                    className={`flex items-center justify-center border ${themeStyles.inputBorder} ${themeStyles.textPrimary} font-montserrat p-2 rounded-lg w-full`}
                                  >
                                    {phone}
                                  </p>
                                )}
                                {/* <Button
                            disabled={
                              (websiteUrl === null
                                ? false
                                : isWebScrapped
                                ? true
                                : false) ||
                              loading ||
                              processing
                            }
                            onClick={() => handleScrape()}
                            className={` hover:opacity-90 text-black ${
                              websiteUrl === null || isWebScrapped === false
                                ? "bg-gradient-to-r from-[#00F0FF] to-[#0080FF]"
                                : "bg-gray-500"
                            }`}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            {webLoading
                              ? "Scraping..."
                              : processing
                              ? "Processing..."
                              : "Start Scraping"}
                          </Button> */}
                                <Button
                                  onClick={() => setStep("phone")}
                                  // disabled={phone === null ? false : true}
                                  disabled={true}
                                  className={` hover:opacity-90 text-black ${
                                    phone === null
                                      ? "bg-gradient-to-r from-[#00F0FF] to-[#0080FF]"
                                      : "bg-gray-500"
                                  }`}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  {/* Verify Number */} Cooming Soon...
                                </Button>
                              </div>
                            </div>
                            <span className="text-green-400 text-sm font-montserrat mt-1">
                              * Add Whatsapp number to get appointment info
                              immedietly on whatsapp
                            </span>
                          </>
                        )}
                        {webError && (
                          <div className=" border border-red-200 rounded-lg p-4 mt-8">
                            <p
                              className={`text-red-700 ${themeStyles.textPrimary} font-montserrat`}
                            >
                              {webError}
                            </p>
                          </div>
                        )}
                        {(webLoading || processing) && (
                          <div className=" border border-green-200 rounded-lg p-4 mt-8">
                            <p
                              className={`text-green-700 ${themeStyles.textPrimary}font-montserrat`}
                            >
                              This might take 1-2 min so please wait,Dont do
                              anything.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Appointment Form Questions */}
                {currentChatbot?.id === "chatbot-lead-generation" && (
                  <Card
                    className={`${themeStyles.cardBg} backdrop-blur-sm ${themeStyles.cardBorder}`}
                  >
                    <CardHeader className="p-2">
                      <CardTitle
                        className={`${themeStyles.textPrimary} flex flex-wrap gap-2 p-0 items-center justify-between`}
                      >
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
                      <CardDescription className={themeStyles.textSecondary}>
                        Configure questions for appointment booking
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {appointmentQuestions.map((question) => (
                          <div
                            key={question.id}
                            className={`p-4 rounded-lg ${
                              theme === "dark"
                                ? "bg-[#921a58]/10"
                                : "bg-pink-50"
                            }`}
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
                                className={`${themeStyles.inputBg} ${
                                  theme === "dark"
                                    ? "border-gray-600"
                                    : "border-gray-300"
                                } ${
                                  themeStyles.textPrimary
                                } text-sm font-montserrat`}
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
                                className={`${
                                  theme === "dark"
                                    ? "bg-[#805283]/40 border-gray-600"
                                    : "bg-white border-gray-300"
                                } border rounded px-2 py-1 ${
                                  themeStyles.textPrimary
                                } text-sm`}
                              >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="tel">Phone</option>
                                <option value="date">Date</option>
                                <option value="select">Select</option>
                              </select>
                              <label
                                className={`flex items-center text-sm ${themeStyles.textSecondary}`}
                              >
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
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-16">
            <Lock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3
              className={`text-xl font-semibold ${themeStyles.textSecondary} mb-2`}
            >
              Subscription Required
            </h3>
            <p className={`${themeStyles.textMuted} mb-6 font-montserrat`}>
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
        <AlertDialogContent className={`${themeStyles.alertBg}`}>
          <AlertDialogDescription
            className={`${themeStyles.textSecondary} mb-4`}
          >
            Cancelling your subscription will result in the loss of access to
            premium features. You can choose to cancel immediately or at the end
            of your current billing cycle.
          </AlertDialogDescription>
          <AlertDialogTitle className={themeStyles.textPrimary}>
            Are you sure you want to cancel your subscription?
          </AlertDialogTitle>
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF2E9F] to-[#B026FF]`}
              >
                Cancel Subscription
              </h2>
              <XMarkIcon
                onClick={() => setShowCancelSubDialog(false)}
                className={`${themeStyles.textSecondary} size-6 cursor-pointer hover:${themeStyles.textPrimary}`}
              />
            </div>
            <form onSubmit={handleCancelSubscription} className="space-y-6">
              <label
                className={`block text-lg font-semibold ${themeStyles.textSecondary}`}
              >
                Please Provide Reason
              </label>
              <textarea
                name="reason"
                className={`w-full ${
                  theme === "dark"
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-gray-100 border-gray-300"
                } border rounded-lg p-3 ${
                  themeStyles.textPrimary
                } focus:outline-none focus:ring-2 focus:ring-[#B026FF]`}
                placeholder="Cancellation reason"
                required
              />
              <div className="flex justify-center gap-4">
                <button
                  type="submit"
                  onClick={() => setMode("Immediate")}
                  className="px-6 py-2 bg-gradient-to-r from-[#FF2E9F]/20 to-[#B026FF]/20 bg-transparent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? "Cancelling..." : "Immediate"}
                </button>
                <button
                  type="submit"
                  onClick={() => setMode("End-of-term")}
                  className="px-6 py-2 bg-gradient-to-r from-[#00F0FF]/20 to-[#B026FF]/20 bg-transparent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  {isImmediateSubmitting ? "Cancelling..." : "End-of-term"}
                </button>
              </div>
            </form>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      {step === "phone" && (
        <AlertDialog defaultOpen>
          <AlertDialogContent className="bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] backdrop-blur-2xl border border-white/10 rounded-2xl max-w-md p-0 overflow-hidden shadow-2xl">
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.5,
                    ease: "easeOut",
                  },
                },
              }}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/5 via-transparent to-[#B026FF]/5"></div>

              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <AlertDialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                      OTP Verification
                    </AlertDialogTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      Secure your account
                    </p>
                  </motion.div>

                  <AlertDialogCancel
                    onClick={() => router.push(`/web/pricing`)}
                    className="border-0 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group bg-transparent"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                  </AlertDialogCancel>
                </div>
              </div>

              {/* Content */}
              <form
                onSubmit={handlePhoneSubmit(handlePhoneSubmission)}
                className="p-6 space-y-6"
              >
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                    PLEASE ENTER YOUR MOBILE NUMBER
                  </h3>
                </motion.div>

                {/* Phone Input */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-300">
                    Enter Your Phone Number
                  </label>

                  <motion.div
                    className="flex items-center w-full bg-[#1a1a1a]/80 backdrop-blur-sm border-2 border-white/10 rounded-xl overflow-hidden transition-all duration-300"
                    whileFocus={{
                      borderColor: "#00F0FF",
                      boxShadow: "0 0 20px rgba(0, 240, 255, 0.2)",
                    }}
                    whileHover={{
                      borderColor: "#B026FF",
                      boxShadow: "0 0 15px rgba(176, 38, 255, 0.1)",
                    }}
                  >
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-[#1a1a1a] text-white p-4 border-r border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] no-scrollbar appearance-none cursor-pointer"
                    >
                      {countryCodes.map((countryCode, index) => (
                        <option
                          key={index}
                          className="bg-[#1a1a1a] text-gray-300 py-2"
                          value={countryCode.code}
                        >
                          {countryCode.code}
                        </option>
                      ))}
                    </select>

                    <input
                      id="MobileNumber"
                      type="text"
                      {...registerPhone("MobileNumber")}
                      className="w-full bg-transparent py-4 px-4 text-white placeholder:text-gray-500 focus:outline-none text-lg"
                      placeholder="Phone number"
                    />
                  </motion.div>

                  <AnimatePresence>
                    {phoneErrors.MobileNumber && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-center"
                      >
                        <p className="text-red-400 text-sm bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                          {phoneErrors.MobileNumber.message}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Send OTP Button */}
                <motion.button
                  type="submit"
                  variants={{
                    initial: {
                      background:
                        "linear-gradient(135deg, #00F0FF 0%, #B026FF 100%)",
                    },
                    hover: {
                      background:
                        "linear-gradient(135deg, #00F0FF 20%, #B026FF 80%)",
                      scale: 1.02,
                      boxShadow: "0 10px 30px rgba(0, 240, 255, 0.3)",
                      transition: {
                        duration: 0.3,
                        ease: "easeOut",
                      },
                    },
                    tap: {
                      scale: 0.98,
                    },
                    loading: {
                      background: "linear-gradient(135deg, #666 0%, #888 100%)",
                    },
                  }}
                  initial="initial"
                  whileHover={isOtpSubmitting ? "loading" : "hover"}
                  whileTap="tap"
                  animate={isOtpSubmitting ? "loading" : "initial"}
                  className={`w-full py-4 relative z-30 rounded-xl font-bold text-lg text-white transition-all duration-300 ${
                    isOtpSubmitting ? "cursor-not-allowed" : ""
                  }`}
                  disabled={isOtpSubmitting}
                >
                  {isOtpSubmitting ? (
                    <motion.div
                      className="flex items-center justify-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Sending OTP...
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Send OTP
                    </motion.span>
                  )}
                </motion.button>
              </form>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="p-4 text-center border-t border-white/10 bg-black/20"
              >
                <AlertDialogDescription className="text-sm">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF] font-semibold font-montserrat">
                    IT WILL HELP US TO PROVIDE BETTER SERVICES
                  </span>
                </AlertDialogDescription>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-[#00F0FF]/10 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#B026FF]/10 rounded-full blur-xl translate-x-1/2 translate-y-1/2"></div>
            </motion.div>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {step === "otp" && (
        <OTPVerification
          phone={phone!}
          onVerified={() => {
            setStep("weblink");
          }}
          userId={userId}
        />
      )}
    </div>
  );
}
