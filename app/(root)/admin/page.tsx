"use client";

import { useState, useEffect, JSX, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Instagram,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Phone,
  MessageCircle,
  BookOpen,
  ShoppingCart,
  Shield,
  Lock,
  CalendarDays,
  User,
  MapPin,
  Target,
  Mail,
  MessageSquare,
  AlertTriangle,
  Activity,
} from "lucide-react";
import RateLimitDashboard from "@/components/shared/RateLimitDashboard";

// Types based on your models
interface WebSubscription {
  _id: string;
  clerkId: string;
  chatbotType:
    | "chatbot-customer-support"
    | "chatbot-e-commerce"
    | "chatbot-lead-generation"
    | "chatbot-education";
  subscriptionId: string;
  plan: string;
  billingCycle: "monthly" | "yearly";
  status: "active" | "cancelled" | "expired";
  createdAt: string;
  expiresAt: string;
  cancelledAt?: string;
  updatedAt: string;
}

interface InstaSubscription {
  _id: string;
  clerkId: string;
  chatbotType:
    | "Insta-Automation-Starter"
    | "Insta-Automation-Grow"
    | "Insta-Automation-Professional";
  subscriptionId: string;
  plan: string;
  billingCycle: "monthly" | "yearly";
  status: "active" | "cancelled" | "expired";
  createdAt: string;
  expiresAt: string;
  cancelledAt?: string;
  updatedAt: string;
}

interface User {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo?: string;
  phone?: string;
  websiteUrl?: string;
  totalReplies?: number;
  replyLimit?: number;
}

interface CombinedSubscription {
  _id: string;
  clerkId: string;
  chatbotType: string;
  subscriptionId: string;
  plan: string;
  billingCycle: "monthly" | "yearly";
  status: "active" | "cancelled" | "expired";
  createdAt: string;
  expiresAt: string;
  cancelledAt?: string;
  updatedAt: string;
  user?: User;
  price: number;
  type: "web" | "instagram";
}

interface Appointment {
  _id: string;
  name: string;
  phone: string;
  address: string;
  subject: string;
  email: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

interface Analytics {
  totalRevenue: number;
  activeSubscriptions: number;
  monthlyRecurring: number;
  yearlyRecurring: number;
  instaSubscriptions: number;
  webSubscriptions: number;
  totalAppointments: number;
  recentSubscriptions: CombinedSubscription[];
  subscriptionGrowth: number;
  revenueGrowth: number;
  appointmentGrowth: number;
}

// Hardcoded pricing based on your plan IDs
const PRICING = {
  // Web Subscriptions
  "chatbot-customer-support": { monthly: 29, yearly: 290 },
  "chatbot-e-commerce": { monthly: 49, yearly: 490 },
  "chatbot-lead-generation": { monthly: 39, yearly: 390 },
  "chatbot-education": { monthly: 35, yearly: 350 },

  // Instagram Subscriptions
  "Insta-Automation-Starter": { monthly: 19, yearly: 190 },
  "Insta-Automation-Grow": { monthly: 39, yearly: 390 },
  "Insta-Automation-Professional": { monthly: 79, yearly: 790 },
};

// API Functions with Clerk integration
const api = {
  // Verify if user is owner
  async verifyOwner(
    userEmail: string
  ): Promise<{ success: boolean; isOwner: boolean; message: string }> {
    const response = await fetch(
      `/api/admin/verify-owner?email=${encodeURIComponent(userEmail)}`
    );
    if (!response.ok) throw new Error("Failed to verify owner");
    return response.json();
  },

  // Fetch all web subscriptions
  async getWebSubscriptions(
    userEmail: string
  ): Promise<{ success: boolean; data: WebSubscription[]; message: string }> {
    const response = await fetch(
      `/api/admin/web-subscriptions?email=${encodeURIComponent(userEmail)}`
    );
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("ACCESS_DENIED: You are not the owner");
      }
      throw new Error("Failed to fetch web subscriptions");
    }
    return response.json();
  },

  // Fetch all instagram subscriptions
  async getInstaSubscriptions(
    userEmail: string
  ): Promise<{ success: boolean; data: InstaSubscription[]; message: string }> {
    const response = await fetch(
      `/api/admin/insta-subscriptions?email=${encodeURIComponent(userEmail)}`
    );
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("ACCESS_DENIED: You are not the owner");
      }
      throw new Error("Failed to fetch instagram subscriptions");
    }
    return response.json();
  },

  // Fetch all users
  async getUsers(
    userEmail: string
  ): Promise<{ success: boolean; data: User[]; message: string }> {
    const response = await fetch(
      `/api/admin/users?email=${encodeURIComponent(userEmail)}`
    );
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("ACCESS_DENIED: You are not the owner");
      }
      throw new Error("Failed to fetch users");
    }
    return response.json();
  },

  // Fetch all appointments
  async getAppointments(userEmail: string) {
    const response = await fetch(
      `/api/admin/appointments?email=${encodeURIComponent(userEmail)}`
    );
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("ACCESS_DENIED: You are not the owner");
      }
      throw new Error("Failed to fetch appointments");
    }
    return response.json();
  },
};

type ActiveTab = "subscriptions" | "appointments" | "rate-limits";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [subscriptions, setSubscriptions] = useState<CombinedSubscription[]>(
    []
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("subscriptions");
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState("");
  const [rateLimitStats, setRateLimitStats] = useState<any>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.primaryEmailAddress?.emailAddress) {
        setError("No email address found. Please make sure you are logged in.");
        setLoading(false);
        return;
      }

      const userEmail = user.primaryEmailAddress.emailAddress!;

      // First verify if user is owner
      const ownerVerification = await api.verifyOwner(userEmail);
      setIsOwner(ownerVerification.isOwner);

      if (!ownerVerification.isOwner) {
        setError(
          "ACCESS_DENIED: You are not the owner. Only gauravgkhaire@gmail.com can access this dashboard."
        );
        setLoading(false);
        return;
      }

      const [webSubs, instaSubs, users, appointmentsData] = await Promise.all([
        api.getWebSubscriptions(userEmail),
        api.getInstaSubscriptions(userEmail),
        api.getUsers(userEmail),
        api.getAppointments(userEmail),
      ]);

      // Create user map for quick lookup
      const userMap = new Map(users.data.map((user) => [user.clerkId, user]));

      // Combine and transform subscriptions
      const combinedSubs: CombinedSubscription[] = [
        ...webSubs.data.map((sub) => ({
          ...sub,
          type: "web" as const,
          price: getPlanPrice(sub.chatbotType, sub.billingCycle),
          user: userMap.get(sub.clerkId),
        })),
        ...instaSubs.data.map((sub) => ({
          ...sub,
          type: "instagram" as const,
          price: getPlanPrice(sub.chatbotType, sub.billingCycle),
          user: userMap.get(sub.clerkId),
        })),
      ];

      // Sort by creation date (newest first)
      combinedSubs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setSubscriptions(combinedSubs);
      setAppointments(appointmentsData.data.formattedAppointments);

      // Calculate analytics
      const analyticsData = calculateAnalytics(
        combinedSubs,
        appointmentsData.data
      );
      setAnalytics(analyticsData);

      // Fetch rate limit stats
      await fetchRateLimitStats();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);

      if (errorMessage.includes("ACCESS_DENIED")) {
        setIsOwner(false);
      }

      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.primaryEmailAddress?.emailAddress]);

  // Fetch rate limit statistics
  const fetchRateLimitStats = async () => {
    try {
      const response = await fetch("/api/rate-limits/status");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRateLimitStats(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching rate limit stats:", error);
    }
  };

  // Calculate analytics from subscription data
  const calculateAnalytics = (
    subs: CombinedSubscription[],
    apps: Appointment[]
  ): Analytics => {
    const activeSubs = subs.filter((sub) => sub.status === "active");
    const instaSubs = activeSubs.filter((sub) => sub.type === "instagram");
    const webSubs = activeSubs.filter((sub) => sub.type === "web");

    const monthlyRecurring = activeSubs
      .filter((sub) => sub.billingCycle === "monthly")
      .reduce((sum, sub) => sum + sub.price, 0);

    const yearlyRecurring = activeSubs
      .filter((sub) => sub.billingCycle === "yearly")
      .reduce((sum, sub) => sum + sub.price / 12, 0); // Convert yearly to monthly equivalent

    const totalRevenue = monthlyRecurring + yearlyRecurring;

    // For demo purposes - in real app, you'd compare with previous period
    const subscriptionGrowth = 12.5;
    const revenueGrowth = 8.3;
    const appointmentGrowth = 15.2;

    return {
      totalRevenue: Math.round(totalRevenue),
      activeSubscriptions: activeSubs.length,
      monthlyRecurring: Math.round(monthlyRecurring),
      yearlyRecurring: Math.round(yearlyRecurring),
      instaSubscriptions: instaSubs.length,
      webSubscriptions: webSubs.length,
      totalAppointments: apps.length,
      recentSubscriptions: subs.slice(0, 10),
      subscriptionGrowth,
      revenueGrowth,
      appointmentGrowth,
    };
  };

  const getPlanPrice = (
    chatbotType: string,
    billingCycle: "monthly" | "yearly"
  ) => {
    return PRICING[chatbotType as keyof typeof PRICING]?.[billingCycle] || 0;
  };

  const getPlanType = (chatbotType: string) => {
    if (chatbotType.includes("Insta")) return "instagram";
    return "web";
  };

  const getPlanSubtype = (chatbotType: string) => {
    const types: { [key: string]: string } = {
      "chatbot-customer-support": "Support",
      "chatbot-e-commerce": "E-commerce",
      "chatbot-lead-generation": "Lead Generation",
      "chatbot-education": "Education",
      "Insta-Automation-Starter": "Starter",
      "Insta-Automation-Grow": "Grow",
      "Insta-Automation-Professional": "Professional",
    };
    return types[chatbotType] || chatbotType;
  };

  const getPlanIcon = (chatbotType: string) => {
    if (chatbotType.includes("Insta")) return <Instagram className="h-4 w-4" />;

    const icons: { [key: string]: JSX.Element } = {
      "chatbot-customer-support": <Phone className="h-4 w-4" />,
      "chatbot-e-commerce": <ShoppingCart className="h-4 w-4" />,
      "chatbot-lead-generation": <Users className="h-4 w-4" />,
      "chatbot-education": <BookOpen className="h-4 w-4" />,
    };

    return icons[chatbotType] || <Globe className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "expired":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesType = typeFilter === "all" || sub.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredAppointments = appointments?.filter((appointment) => {
    if (!appointment) return false;

    return (
      appointment.name
        ?.toLowerCase()
        .includes(appointmentSearchTerm.toLowerCase()) ||
      appointment.email
        ?.toLowerCase()
        .includes(appointmentSearchTerm.toLowerCase()) ||
      appointment.subject
        ?.toLowerCase()
        .includes(appointmentSearchTerm.toLowerCase()) ||
      appointment.phone?.includes(appointmentSearchTerm)
    );
  });

  useEffect(() => {
    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded, fetchData]);

  // Clerk still loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-transparent  flex items-center justify-center h-full w-full">
        <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // User not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-cyan-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-400 mb-6">
            Please sign in to access the admin dashboard.
          </p>
          <motion.button
            onClick={() => (window.location.href = "/sign-in")}
            className="px-6 py-3 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Access Denied Component
  if (isOwner === false) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-2 font-montserrat">
            You are not authorized to access the admin dashboard.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Logged in as:{" "}
            <span className="text-cyan-400">
              {user.primaryEmailAddress?.emailAddress}
            </span>
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Only the owner (
            <span className="text-cyan-400">gauravgkhaire@gmail.com</span>) can
            view this page.
          </p>
          <motion.button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Return to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <RefreshCw className="h-12 w-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
          <p className="text-gray-400 text-sm mt-2 font-montserrat">
            Verifying access permissions
          </p>
        </motion.div>
      </div>
    );
  }

  if (error && !error.includes("ACCESS_DENIED")) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Error loading data</p>
          <p className="text-gray-400 mb-6 font-montserrat">{error}</p>
          <motion.button
            onClick={fetchData}
            className="px-6 py-3 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Main Dashboard Render
  return (
    <motion.div
      className="min-h-screen bg-transparent text-white p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with Owner Badge */}
        <motion.div
          className="flex flex-wrap flex-row justify-between items-start lg:items-center mb-8"
          variants={cardVariants}
        >
          <div className="flex flex-wrap items-start justify-center gap-4">
            <div className="">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-2 font-montserrat">
                Manage and monitor your subscription business, appointments, and
                Instagram rate limits
              </p>
            </div>
            <motion.div
              className="flex items-center px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Shield className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-green-400 text-sm font-medium">Owner</span>
            </motion.div>
          </div>
          <div className=" w-full flex flex-wrap items-center justify-between  space-x-4 mt-4 gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-gray-400">Logged in as</span>
              <p className="text-cyan-400 font-medium">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <div className="flex space-x-2">
              <motion.button
                onClick={fetchData}
                className="flex items-center px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </motion.button>
              <motion.button
                className="flex items-center px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Analytics Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          variants={containerVariants}
        >
          {/* Total Revenue */}
          <motion.div
            className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">
                  ${analytics?.totalRevenue}
                </p>
                <p className="text-green-500 text-sm mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />+
                  {analytics?.revenueGrowth}%
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </motion.div>

          {/* Active Subscriptions */}
          <motion.div
            className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Subscriptions</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {analytics?.activeSubscriptions}
                </p>
                <p className="text-green-500 text-sm mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />+
                  {analytics?.subscriptionGrowth}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          {/* Total Appointments */}
          <motion.div
            className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Appointments</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {analytics?.totalAppointments || appointments?.length}
                </p>
                <p className="text-purple-400 text-sm mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />+
                  {analytics?.appointmentGrowth}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </motion.div>

          {/* Instagram Subscriptions */}
          <motion.div
            className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-2xl p-6 backdrop-blur-sm"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Instagram Plans</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {analytics?.instaSubscriptions}
                </p>
                <p className="text-pink-400 text-sm mt-1">Automation</p>
              </div>
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                <Instagram className="h-6 w-6 text-pink-400" />
              </div>
            </div>
          </motion.div>

          {/* Rate Limits Status */}
          <motion.div
            className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-sm"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rate Limits</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {rateLimitStats?.blockedAccounts || 0}
                </p>
                <p
                  className={`text-sm mt-1 flex items-center ${
                    (rateLimitStats?.blockedAccounts || 0) > 0
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  <Activity className="h-4 w-4 mr-1" />
                  {(rateLimitStats?.blockedAccounts || 0) > 0
                    ? "Accounts Blocked"
                    : "All Good"}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs for Subscriptions, Appointments, and Rate Limits */}
        <motion.div
          className="flex border-b border-gray-700 mb-6 overflow-x-auto"
          variants={cardVariants}
        >
          <button
            className={`flex-shrink-0 px-6 py-3 font-medium text-sm border-b-2 transition-all ${
              activeTab === "subscriptions"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("subscriptions")}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Subscriptions ({subscriptions.length})
          </button>
          <button
            className={`flex-shrink-0 px-6 py-3 font-medium text-sm border-b-2 transition-all ${
              activeTab === "appointments"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("appointments")}
          >
            <CalendarDays className="h-4 w-4 inline mr-2" />
            Appointments ({appointments.length})
          </button>
          <button
            className={`flex-shrink-0 px-6 py-3 font-medium text-sm border-b-2 transition-all ${
              activeTab === "rate-limits"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("rate-limits")}
          >
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Rate Limits
          </button>
        </motion.div>

        {/* Subscriptions Tab Content */}
        {activeTab === "subscriptions" && (
          <>
            {/* Filters and Search for Subscriptions */}
            <motion.div
              className="flex flex-col lg:flex-row gap-4 mb-6"
              variants={cardVariants}
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users, emails, or plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 font-montserrat"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Types</option>
                  <option value="web">Web</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
            </motion.div>

            {/* Subscriptions Table */}
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden backdrop-blur-sm"
              variants={cardVariants}
            >
              <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                  Subscriptions ({filteredSubscriptions.length})
                </h2>
                <p className="text-gray-400 text-sm">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Plan
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Billing
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Start Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Expiry
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((subscription, index) => (
                      <motion.tr
                        key={subscription._id}
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors font-montserrat"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {subscription.user?.firstName?.[0]}
                              {subscription.user?.lastName?.[0]}
                            </div>
                            <div className="ml-3">
                              <p className="text-white font-medium">
                                {subscription.user?.firstName}{" "}
                                {subscription.user?.lastName}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {subscription.user?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                subscription.type === "instagram"
                                  ? "bg-pink-500/20"
                                  : "bg-cyan-500/20"
                              }`}
                            >
                              {getPlanIcon(subscription.chatbotType)}
                            </div>
                            <div className="ml-3">
                              <p className="text-white capitalize">
                                {subscription.type}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {getPlanSubtype(subscription.chatbotType)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white">{subscription.plan}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              subscription.billingCycle === "yearly"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {subscription.billingCycle}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getStatusIcon(subscription.status)}
                            <span className="ml-2 capitalize">
                              {subscription.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">
                            ${subscription.price}
                            <span className="text-gray-400 text-sm ml-1">
                              /
                              {subscription.billingCycle === "yearly"
                                ? "year"
                                : "month"}
                            </span>
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white">
                            {new Date(
                              subscription.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white">
                            {new Date(
                              subscription.expiresAt
                            ).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Eye className="h-4 w-4 text-gray-400" />
                            </motion.button>
                            <motion.button
                              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-400" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredSubscriptions.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg font-montserrat">
                    No subscriptions found
                  </p>
                  <p className="text-gray-500 text-sm mt-2 font-montserrat">
                    Try adjusting your search or filters
                  </p>
                </motion.div>
              )}
            </motion.div>
          </>
        )}

        {/* Appointments Tab Content */}
        {activeTab === "appointments" && (
          <>
            {/* Search for Appointments */}
            <motion.div
              className="flex flex-col lg:flex-row gap-4 mb-6"
              variants={cardVariants}
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search appointments by name, email, subject, or phone..."
                  value={appointmentSearchTerm}
                  onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 font-montserrat"
                />
              </div>
            </motion.div>

            {/* Appointments Table */}
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden backdrop-blur-sm"
              variants={cardVariants}
            >
              <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                  Appointments ({filteredAppointments.length})
                </h2>
                <p className="text-gray-400 text-sm">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        <User className="h-4 w-4 inline mr-2" />
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Address
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        <Target className="h-4 w-4 inline mr-2" />
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        <MessageSquare className="h-4 w-4 inline mr-2" />
                        Message
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment, index) => (
                      <motion.tr
                        key={appointment._id}
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors font-montserrat"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {appointment.name[0]}
                            </div>
                            <div className="ml-3">
                              <p className="text-white font-medium">
                                {appointment.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white">{appointment.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white max-w-xs truncate">
                            {appointment.address}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-white">{appointment.subject}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white">{appointment.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-400 max-w-xs truncate">
                            {appointment.message || "N/A"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white">
                            {new Date(
                              appointment.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAppointments.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No appointments found</p>
                  <p className="text-gray-500 text-sm mt-2 font-montserrat">
                    {appointmentSearchTerm
                      ? "Try adjusting your search"
                      : "No appointments have been booked yet"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </>
        )}

        {/* Rate Limits Tab Content */}
        {activeTab === "rate-limits" && (
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Rate Limit Dashboard Component */}
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden backdrop-blur-sm"
              variants={cardVariants}
            >
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  Instagram API Rate Limits
                </h2>
                <p className="text-gray-400 text-sm mt-1 font-montserrat">
                  Monitor and manage Instagram API rate limits to prevent
                  hitting Meta limits
                </p>
              </div>
              <div className="p-6">
                <RateLimitDashboard />
              </div>
            </motion.div>

            {/* Rate Limit Information Panel */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {/* Rate Limit Guidelines */}
              <motion.div
                className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm"
                variants={cardVariants}
                whileHover="hover"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-400 mr-2" />
                  Rate Limit Guidelines
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-white font-medium">Maximum Calls</p>
                      <p className="text-gray-400 text-sm font-montserrat">
                        180 API calls per hour per Instagram account
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-white font-medium">Block Threshold</p>
                      <p className="text-gray-400 text-sm font-montserrat">
                        Accounts are temporarily blocked at 170 calls
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-white font-medium">Block Duration</p>
                      <p className="text-gray-400 text-sm font-montserrat">
                        Blocked accounts are automatically unblocked after 5
                        minutes
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-white font-medium">Priority System</p>
                      <p className="text-gray-400 text-sm font-montserrat">
                        User-initiated actions get priority over automated
                        comments
                      </p>
                    </div>
                  </li>
                </ul>
              </motion.div>

              {/* Queue Statistics */}
              {rateLimitStats?.queue && (
                <motion.div
                  className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Activity className="h-5 w-5 text-cyan-400 mr-2" />
                    Queue Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Total Queued</p>
                      <p className="text-2xl font-bold text-white">
                        {rateLimitStats.queue.total || 0}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Processing</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        {rateLimitStats.queue.processing || 0}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Pending</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {rateLimitStats.queue.pending || 0}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Failed</p>
                      <p className="text-2xl font-bold text-red-400">
                        {rateLimitStats.queue.failed || 0}
                      </p>
                    </div>
                  </div>
                  {rateLimitStats.queue.avgProcessingTime > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm">
                        Average Processing Time
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {(
                          rateLimitStats.queue.avgProcessingTime / 1000
                        ).toFixed(2)}{" "}
                        seconds
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm"
              variants={cardVariants}
              whileHover="hover"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  onClick={() => {
                    // This would trigger a cleanup in a real implementation
                    alert("Cleanup triggered");
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cleanup Old Queue Items
                </motion.button>
                <motion.button
                  onClick={() => {
                    // This would trigger a system-wide reset in a real implementation
                    alert("System reset triggered");
                  }}
                  className="px-4 py-2 bg-red-700/30 hover:bg-red-700/50 border border-red-500/30 rounded-lg transition-colors text-red-400"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset All Rate Limits
                </motion.button>
                <motion.button
                  onClick={() => {
                    fetchRateLimitStats();
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="h-4 w-4 inline mr-2" />
                  Refresh Stats
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          variants={containerVariants}
        >
          <motion.div
            className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monthly Recurring</p>
                <p className="text-2xl font-bold text-white mt-2">
                  ${analytics?.monthlyRecurring}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-cyan-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Yearly Recurring</p>
                <p className="text-2xl font-bold text-white mt-2">
                  ${analytics?.yearlyRecurring}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Records</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {subscriptions.length + appointments.length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
