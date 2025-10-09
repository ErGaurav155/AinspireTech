"use client";

import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  Instagram,
  Check,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Faq from "@/components/shared/Faq";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { useTheme } from "next-themes";

export default function Home() {
  const { theme } = useTheme();

  // Theme-based styles
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const textMuted = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const containerBg = theme === "dark" ? "bg-transparent" : "bg-gray-50";
  const cardBg = theme === "dark" ? "bg-transparent" : "bg-white/80";
  const cardBorder = theme === "dark" ? "border-white/10" : "border-gray-200";
  const ctaCardBg =
    theme === "dark"
      ? "bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]/90"
      : "bg-gradient-to-br from-white to-gray-100/90";
  const ctaCardBorder =
    theme === "dark" ? "border-white/10" : "border-gray-300";
  const iconBg =
    theme === "dark"
      ? "bg-gradient-to-br from-white/10 to-white/5"
      : "bg-gradient-to-br from-gray-100 to-gray-200";
  const outlineButtonBorder =
    theme === "dark" ? "border-[#B026FF]/30" : "border-[#B026FF]/50";
  const outlineButtonText =
    theme === "dark" ? "text-[#B026FF]" : "text-[#B026FF]";
  const outlineButtonHover =
    theme === "dark" ? "hover:bg-[#B026FF]/10" : "hover:bg-[#B026FF]/10";

  const features = [
    {
      icon: MessageSquare,
      title: "Smart Auto-Replies",
      description:
        "Our AI bot replies to visitor questions in real-time using intelligent templates based on keywords and intent — from service inquiries to pricing and availability.",
      color: "cyan",
    },
    {
      icon: Users,
      title: "Lead Qualification & Conversion",
      description:
        "Automatically ask the right questions, collect contact details, and send qualified leads directly to your WhatsApp or CRM. No more missed opportunities.",
      color: "purple",
    },
    {
      icon: BarChart3,
      title: "Website-Friendly & Compliance Ready",
      description:
        "Fully responsive and lightweight. Follows best practices in data privacy, message rate-limiting, and user consent.",
      color: "pink",
    },
    {
      icon: Shield,
      title: "Instant Engagement, 24/7",
      description:
        "Whether it's midnight or a busy afternoon, your AI assistant is always online — ready to greet visitors, answer questions, and guide them to action.",
      color: "cyan",
    },
    {
      icon: Zap,
      title: "Appointment Booking",
      description:
        "While chatting with customer slightly push form to book appointment and send to owner number.",
      color: "purple",
    },
    {
      icon: MessageSquare,
      title: "Multi-Language Support",
      description: "User can chat any language our bot reply accordingly.",
      color: "pink",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Fashion Boutique",
      content:
        "“It answers customer questions instantly and sends their details to us — we never lose a lead now!”",
      rating: 5,
    },
    {
      name: "Mike Chen",
      company: "Tech Startup",
      content:
        "It handles FAQs better than a human. Visitors are impressed with fast, accurate replies.",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      company: "Food Blog",
      content:
        "Our bookings increased by 40% just by adding the bot to our website.",
      rating: 5,
    },
  ];

  const colorClasses = {
    cyan:
      theme === "dark"
        ? "from-[#00F0FF]/10 to-[#00F0FF]/5 border-[#00F0FF]/20 hover:border-[#00F0FF]/40"
        : "from-[#00F0FF]/20 to-[#00F0FF]/10 border-[#00F0FF]/30 hover:border-[#00F0FF]/60",
    purple:
      theme === "dark"
        ? "from-[#B026FF]/20 to-[#B026FF]/5 border-[#B026FF]/20 hover:border-[#B026FF]/40"
        : "from-[#B026FF]/20 to-[#B026FF]/10 border-[#B026FF]/30 hover:border-[#B026FF]/60",
    pink:
      theme === "dark"
        ? "from-[#FF2E9F]/20 to-[#FF2E9F]/5 border-[#FF2E9F]/20 hover:border-[#FF2E9F]/40"
        : "from-[#FF2E9F]/20 to-[#FF2E9F]/10 border-[#FF2E9F]/30 hover:border-[#FF2E9F]/60",
  };

  const iconColors = {
    cyan: "text-[#00F0FF]",
    purple: "text-[#B026FF]",
    pink: "text-[#FF2E9F]",
  };

  return (
    <div
      className={`min-h-screen max-w-7xl m-auto ${textPrimary} ${containerBg}`}
    >
      <BreadcrumbsDefault />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Card
                key={index}
                className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br ${
                  colorClasses[feature.color as keyof typeof colorClasses]
                } ${cardBg} border`}
              >
                <CardHeader>
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${iconBg} group-hover:scale-110 transition-transform`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        iconColors[feature.color as keyof typeof iconColors]
                      }`}
                    />
                  </div>
                  <CardTitle className={textPrimary}>{feature.title}</CardTitle>
                  <CardDescription
                    className={`${textSecondary} font-montserrat`}
                  >
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card
            className={`max-w-4xl mx-auto ${ctaCardBg} border ${ctaCardBorder} backdrop-blur-lg`}
          >
            <CardContent className="pt-12 pb-12">
              <h2
                className={`text-4xl font-bold mb-4 gradient-text-main ${textPrimary}`}
              >
                🚀 Ready to Convert Your Website Traffic Into Paying Clients?
              </h2>
              <p
                className={`${textSecondary} mb-8 text-lg font-montserrat max-w-2xl mx-auto`}
              >
                Thousands of local businesses are using AI-powered chatbots to
                automate support, boost engagement, and increase sales.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  className="btn-gradient-cyan text-lg px-8 hover:opacity-90 transition-opacity"
                  asChild
                >
                  <Link href="/insta/dashboard">
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`text-lg px-8 ${outlineButtonBorder} ${cardBg} ${outlineButtonText} ${outlineButtonHover}`}
                >
                  View Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Faq />
      </div>
    </div>
  );
}
