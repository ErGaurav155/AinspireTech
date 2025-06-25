import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  Instagram,
  Check,
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

export default function Home() {
  const features = [
    {
      icon: MessageSquare,
      title: "Smart Auto-Replies",
      description:
        "Create intelligent response templates that trigger based on specific keywords and phrases in comments.",
      color: "cyan",
    },
    {
      icon: Users,
      title: "Multi-Account Management",
      description:
        "Manage multiple Instagram accounts from a single dashboard with individual settings and templates.",
      color: "purple",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description:
        "Track reply performance, engagement rates, and optimize your automated responses for better results.",
      color: "pink",
    },
    {
      icon: Shield,
      title: "Safe & Compliant",
      description:
        "Built with Instagram's guidelines in mind, featuring rate limiting and respectful automation practices.",
      color: "cyan",
    },
    {
      icon: Zap,
      title: "Real-time Monitoring",
      description:
        "Monitor comments in real-time and respond instantly with your pre-configured templates and settings.",
      color: "purple",
    },
    {
      icon: MessageSquare,
      title: "Custom Templates",
      description:
        "Design personalized response templates with variables, emojis, and dynamic content for authentic engagement.",
      color: "pink",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Fashion Boutique",
      content:
        "Our engagement increased by 300% after implementing InstaReply Pro. Never miss a customer comment again!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      company: "Tech Startup",
      content:
        "The automation is so natural, our followers can't tell it's not us responding personally.",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      company: "Food Blog",
      content:
        "ROI was positive within the first week. The system pays for itself with increased engagement.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen  text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Instagram className="h-20 w-20 text-[#00F0FF]" />
              <div className="absolute -top-2 -right-2 h-8 w-8 bg-[#FF2E9F] rounded-full flex items-center justify-center animate-pulse">
                <Zap className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center bg-blue-100/10 text-blue-400 border border-blue-400/30 rounded-full px-4 py-2 mb-6">
            <Zap className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              AI-Powered Instagram Automation
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text-main">
            InstaReply Pro
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-mono">
            Transform your Instagram engagement with intelligent auto-reply
            management. Create custom response templates, monitor comments, and
            never miss an opportunity to connect.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="btn-gradient-cyan text-lg px-8 hover:opacity-90 transition-opacity"
              asChild
            >
              <Link href="/insta/dashboard">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-transparent border-[#B026FF]/30 text-[#B026FF] hover:bg-[#B026FF]/10"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              cyan: "from-[#00F0FF]/10 to-[#00F0FF]/5 border-[#00F0FF]/20 hover:border-[#00F0FF]/40",
              purple:
                "from-[#B026FF]/20 to-[#B026FF]/5 border-[#B026FF]/20 hover:border-[#B026FF]/40",
              pink: "from-[#FF2E9F]/20 to-[#FF2E9F]/5 border-[#FF2E9F]/20 hover:border-[#FF2E9F]/40",
            };
            const iconColors = {
              cyan: "text-[#00F0FF]",
              purple: "text-[#B026FF]",
              pink: "text-[#FF2E9F]",
            };

            return (
              <Card
                key={index}
                className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br ${
                  colorClasses[feature.color as keyof typeof colorClasses]
                } bg-transparent border`}
              >
                <CardHeader>
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4  bg-gradient-to-br from-white/10 to-white/5 group-hover:scale-110 transition-transform`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        iconColors[feature.color as keyof typeof iconColors]
                      }`}
                    />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-300 font-mono">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Testimonials */}
        <section className="py-16 backdrop-blur-sm">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 gradient-text-main">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-300 font-mono">
              Join thousands of creators who have transformed their Instagram
              engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-[#0a0a0a]/60 border border-white/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 font-mono">
                    {testimonial.content}
                  </p>
                  <div>
                    <p className="font-semibold text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]/90 border border-white/10 backdrop-blur-lg">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-4xl font-bold mb-4 gradient-text-main">
                Ready to Transform Your Instagram Engagement?
              </h2>
              <p className="text-gray-300 mb-8 text-lg font-mono max-w-2xl mx-auto">
                Join thousands of creators and businesses who have automated
                their Instagram responses and increased their engagement rates
                by up to 300%.
              </p>
              <div className="flex gap-4 justify-center">
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
                  className="text-lg px-8 border-[#B026FF]/30 bg-transparent text-[#B026FF] hover:bg-[#B026FF]/10"
                >
                  View Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
