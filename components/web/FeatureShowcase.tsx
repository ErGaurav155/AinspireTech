"use client";

import { useState } from "react";
import {
  MessageCircle,
  Play,
  AtSign,
  Facebook,
  Inbox,
  Calendar,
  BarChart3,
  Workflow,
  MessageSquare,
  Users,
  Zap,
  Rewind,
  Megaphone,
  Mail,
  BookOpen,
  Gift,
  Shield,
  Infinity,
  Cpu,
  Clock,
  Gauge,
  InstagramIcon,
} from "lucide-react";

export function FeatureShowcase() {
  const [activeCategory, setActiveCategory] = useState("all");

  const features = [
    {
      icon: <InstagramIcon className="h-6 w-6" />,
      title: "Post AutoDM",
      description: "Automatically reply to Instagram Post comments with a DM",
      category: "automation",
    },
    {
      icon: <Play className="h-6 w-6" />,
      title: "Reels AutoDM",
      description: "Automatically reply to Instagram Reel comments with a DM",
      category: "automation",
    },
    {
      icon: <Facebook className="h-6 w-6" />,
      title: "Facebook AutoDM",
      description: "Auto-reply to Facebook comments with a DM",
      category: "automation",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Story AutoDM",
      description: "Automatically respond to story replies with a DM",
      category: "automation",
    },
    {
      icon: <AtSign className="h-6 w-6" />,
      title: "Story Mentions",
      description: "Automatically reply to story @mentions with a DM",
      category: "automation",
    },
    {
      icon: <Inbox className="h-6 w-6" />,
      title: "Inbox Starters",
      description: "Display up to 4 conversation starters in your inbox",
      category: "engagement",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Next Post",
      description: "Draft your next linked post in advance",
      category: "planning",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Click Analytics",
      description: "Track link click analytics on DMs sent",
      category: "analytics",
    },
    {
      icon: <Workflow className="h-6 w-6" />,
      title: "Flow Automation",
      description: "Schedule a sequence of DMs and reminders after engagement",
      category: "automation",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Comment Auto-Reply",
      description:
        "Automatically reply to comments with a comment once a DM has been sent",
      category: "automation",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "White Label",
      description: "Remove LinkDM branding from DMs sent",
      category: "branding",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multiple Accounts",
      description: "Connect up to 3 Instagram Accounts to your LinkDM Profile",
      category: "management",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Increased DM Send Limit",
      description: "Send up to 25,000 DMs per account/per month",
      category: "limits",
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "Universal Triggers",
      description: "Setup global triggers to use across multiple placements",
      category: "automation",
    },
    {
      icon: <Rewind className="h-6 w-6" />,
      title: "Rewind",
      description: "Backsend DMs to eligible comments",
      category: "automation",
    },
    {
      icon: <Megaphone className="h-6 w-6" />,
      title: "Advertising AutoDM",
      description: "Auto-reply to comments on your sponsored content",
      category: "automation",
    },
    {
      icon: <Inbox className="h-6 w-6" />,
      title: "Inbox Automation",
      description: "Automatically reply to Inbox messages",
      category: "automation",
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: "Referral Program",
      description: "Access our referral program and start earning",
      category: "growth",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Lead Generation",
      description: "Capture email addresses directly in chat",
      category: "growth",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "DM Planner",
      description: "Draft DMs for scheduled posts in advance",
      category: "planning",
    },
    {
      icon: <Infinity className="h-6 w-6" />,
      title: "DM Send Limit+",
      description: "Send up to 300,000 DMs per account/per month",
      category: "limits",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Accounts+",
      description: "Connect up to 5 Instagram accounts to your LinkDM profile",
      category: "management",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "DM Queue",
      description: "Never miss sending a DM with the advance queue system",
      category: "automation",
    },
    {
      icon: <Gauge className="h-6 w-6" />,
      title: "Slow Down Mode",
      description:
        "When your Reels are blowing up, Let us slow down your automation",
      category: "automation",
    },
  ];

  const categories = [
    { id: "all", name: "All Features", count: features.length },
    {
      id: "automation",
      name: "Automation",
      count: features.filter((f) => f.category === "automation").length,
    },
    {
      id: "analytics",
      name: "Analytics",
      count: features.filter((f) => f.category === "analytics").length,
    },
    {
      id: "planning",
      name: "Planning",
      count: features.filter((f) => f.category === "planning").length,
    },
    {
      id: "management",
      name: "Account Management",
      count: features.filter((f) => f.category === "management").length,
    },
    {
      id: "growth",
      name: "Growth",
      count: features.filter((f) => f.category === "growth").length,
    },
    {
      id: "limits",
      name: "Limits",
      count: features.filter((f) => f.category === "limits").length,
    },
    {
      id: "branding",
      name: "Branding",
      count: features.filter((f) => f.category === "branding").length,
    },
    {
      id: "engagement",
      name: "Engagement",
      count: features.filter((f) => f.category === "engagement").length,
    },
  ];

  const filteredFeatures =
    activeCategory === "all"
      ? features
      : features.filter((feature) => feature.category === activeCategory);

  return (
    <section className="w-full py-20 bg-transparent text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
            Unlock The Full Potential
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 font-montserrat">
            Dive deep into AinspireTech capabilities with these standout
            features, each designed to enhance your experience and streamline
            your tasks. Discover what sets us apart.
          </p>

          {/* Divider */}
          <div className="w-24 h-1 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full mx-auto mb-12"></div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-1 md:gap-4 mb-4 md:mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-2 py-1 md:px-6 md:py-3 rounded-full border transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black border-transparent"
                  : "border-[#00F0FF]/30 text-gray-300 hover:border-[#00F0FF] hover:text-white"
              }`}
            >
              <span className="text-xs md:text-base font-thin md:font-medium">
                {category.name}
              </span>
              <span className="ml-1 md:ml-2 text-sm opacity-80">
                ({category.count})
              </span>
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto">
          {filteredFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-transparent border border-gray-800 rounded-2xl p-4 hover:border-[#00F0FF]/50 hover:transform hover:scale-105 transition-all duration-300 group relative overflow-hidden flex flex-col items-start justify-center gap-2"
            >
              <div className="flex items-start justify-center gap-2">
                {/* Background Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/5 to-[#B026FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Icon */}
                <div className="relative z-10 w-14 h-14 px-3 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">{feature.icon}</div>
                </div>
                <div className="">
                  {/* Title */}
                  <h3 className="text-lg font-medium  text-white group-hover:text-[#00F0FF] transition-colors duration-300 relative z-10">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 text-sm  relative z-10 font-montserrat">
                    {feature.description}
                  </p>
                </div>{" "}
                {/* Category Badge */}
                {/* Learn More Link */}
              </div>
              <div className="w-full flex items-center justify-between ">
                <button className="inline-flex items-center text-[#00F0FF] hover:text-[#B026FF] transition-colors duration-300 relative z-10">
                  <span className="text-sm font-medium">Learn more</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <div className="">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 capitalize">
                    {feature.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
