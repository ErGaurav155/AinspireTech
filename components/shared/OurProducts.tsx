"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FeaImg1 from "@/public/assets/img/headingimg.png";
// import FeaImg3 from "@/public/assets/img/featureImg3.png";
import FeaImg4 from "@/public/assets/img/featureImg4.png";
import FeaBot1 from "@/public/assets/Feature/FeatChatbot1.png";
import FeaBot2 from "@/public/assets/Feature/FeatChatbot2.png";
import FeaBot3 from "@/public/assets/Feature/FeatChatbot3.png";

import InstaFea5 from "@/public/assets/Feature/InstaFeature5.png";
import InstaFea1 from "@/public/assets/Feature/InstaFeature1.png";
import InstaFea2 from "@/public/assets/Feature/InstaFeature2.png";
import InstaFea3 from "@/public/assets/Feature/InstaFeature3.png";
import InstaFea4 from "@/public/assets/Feature/InstaFeature4.png";

import {
  MessageCircle,
  Instagram,
  Users,
  BookOpen,
  Video,
  Zap,
  Phone,
  Mic,
  ImagePlus,
  ChevronDown,
  Network,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";

export function AIVoiceAgentShowcase() {
  const [activePlatform, setActivePlatform] = useState<"web" | "insta">("web");
  const [openWebDropdown, setOpenWebDropdown] = useState<string | null>(
    "support"
  );
  const [openInstaDropdown, setOpenInstaDropdown] = useState<string | null>(
    "reels"
  );
  const [agent, setImage] = useState(FeaBot3);
  const [instaImage, setInstaImage] = useState(InstaFea2);
  const [instaImage1, setInstaImage1] = useState(FeaImg4);
  const { theme } = useTheme();

  // Theme-based styles
  const sectionBg = theme === "dark" ? "bg-transparent" : "bg-transparent";
  const tabBg = theme === "dark" ? "bg-[#1a1a1a]" : "bg-gray-100";
  const tabBorder = theme === "dark" ? "border-gray-800" : "border-gray-300";
  const tabText = theme === "dark" ? "text-gray-300" : "text-n-5";
  const activeTabBg = "bg-gradient-to-r from-cyan-600 to-blue-600 text-white";
  const activeInstaTabBg =
    "bg-gradient-to-r from-pink-600 to-purple-600 text-white";

  const dropdownBg = theme === "dark" ? "bg-[#0a0a0a]/60" : "bg-white/80";
  const dropdownBorder =
    theme === "dark" ? "border-white/10" : "border-gray-200";
  const titleText = theme === "dark" ? "text-white" : "text-gray-900";
  const descriptionText = theme === "dark" ? "text-white" : "text-n-5";

  const webChatTypes = {
    support: {
      title: "AI Support Agent",
      description: "Streamline support with Human like conversations",
      icon: <Phone className="h-5 w-5" />,
      features: [
        "24/7 voice-based customer support",
        "Natural language processing",
        "Multi-language voice recognition",
        "Seamless handoff to human agents",
      ],
      image: FeaBot3,
    },
    education: {
      title: "AI Education Agent",
      description: "Automate education learning",
      icon: <BookOpen className="h-5 w-5" />,
      features: [
        "Learn what you want",
        "Clarify your doubts",
        "Solve mcq test",
      ],
      image: FeaBot1,
    },
    leadgen: {
      title: "AI Lead Qualification Agent",
      description:
        "Qualify leads through intelligent human like chat conversations",
      icon: <Users className="h-5 w-5" />,
      features: [
        "chat-based lead scoring",
        "Automated qualification questions",
        "Lead routing intelligence",
        "Conversation analytics",
      ],
      image: FeaBot2,
    },
  };

  const instaAutomationTypes = {
    reels: {
      title: "Reels Automation",
      description: "Auto-engage with Instagram Reel comments",
      icon: <Video className="h-5 w-5" />,
      features: [
        "Auto-reply to Reel comments with DMs",
        "Keyword-based triggering",
        "Sentiment analysis",
        "Response templates",
      ],
      image: InstaFea2,
      image1: FeaImg4,
    },
    posts: {
      title: "Posts Automation",
      description: "Automate engagement with Instagram posts",
      icon: <ImagePlus className="h-5 w-5" />,
      features: [
        "Comment response automation",
        "@mention handling",
        "Content moderation",
        "Engagement analytics",
      ],
      image: InstaFea5,
      image1: FeaImg1,
    },
    stories: {
      title: "Stories Automation",
      description: "Auto-respond to story interactions",
      icon: <Zap className="h-5 w-5" />,
      features: [
        "Story reply automation",
        "Poll and question responses",
        "DM automation for engagement",
        "Interactive story features",
      ],
      image: InstaFea1,
      image1: FeaImg4,
    },
    dms: {
      title: "DM Automation",
      description: "Automate direct message responses",
      icon: <MessageCircle className="h-5 w-5" />,
      features: [
        "Instant DM response system",
        "FAQ automation",
        "Lead qualification",
        "24/7 message handling",
      ],
      image: InstaFea3,
      image1: InstaFea4,
    },
  };

  const toggleWebDropdown = (key: string) => {
    setOpenWebDropdown(openWebDropdown === key ? null : key);
  };

  const toggleInstaDropdown = (key: string) => {
    setOpenInstaDropdown(openInstaDropdown === key ? null : key);
  };

  return (
    <section
      className={`w-full py-20 ${sectionBg} text-foreground max-w-7xl mx-auto`}
    >
      <div className=" mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center ${
              theme === "dark"
                ? "text-blue-400 border-blue-400/50"
                : "text-blue-600 border-blue-600/50"
            } border rounded-full px-4 py-1 mb-4`}
          >
            <span className="text-sm font-medium">PRODUCT SHOWCASE</span>
          </div>
          <h2 className="text-3xl font-bold gradient-text-main mb-4">
            OUR PRODUCTS
          </h2>
          <p
            className={`text-xl ${descriptionText} max-w-2xl mx-auto font-montserrat`}
          >
            Elevate customer experience with natural voice conversations across
            all platforms
          </p>
        </div>

        {/* Platform Tabs */}
        <div className="flex justify-center mb-8">
          <div
            className={`${tabBg} border ${tabBorder} rounded-full p-1 flex backdrop-blur-sm`}
          >
            {[
              {
                id: "web",
                label: "Web",
                icon: <Network className="h-5 w-5" />,
              },
              {
                id: "insta",
                label: "insta",
                icon: <Instagram className="h-5 w-5" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePlatform(tab.id as any)}
                className={`flex items-center px-6 py-3 rounded-full transition-all duration-300 ${
                  activePlatform === tab.id
                    ? tab.id === "web"
                      ? activeTabBg
                      : activeInstaTabBg
                    : `${tabText} hover:text-white hover:bg-gray-700/50`
                }`}
              >
                {tab.icon}
                <span className="ml-2 text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto">
          {/* Web Platform Content */}
          <AnimatePresence mode="wait">
            {activePlatform === "web" && (
              <div className="flex items-center justify-between gap-6 w-full h-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 flex-1"
                >
                  {Object.entries(webChatTypes).map(([key, agent]) => (
                    <motion.div
                      key={key}
                      className={`${dropdownBg} border ${dropdownBorder} rounded-xl overflow-hidden backdrop-blur-sm`}
                    >
                      {/* Dropdown Button */}
                      <button
                        onClick={() => {
                          toggleWebDropdown(key);
                          setImage(agent.image);
                        }}
                        className="w-full flex items-center justify-between p-6 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              openWebDropdown === key
                                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                                : "bg-gray-500/20 text-gray-600"
                            }`}
                          >
                            {agent.icon}
                          </div>
                          <div>
                            <h3
                              className={`text-lg font-semibold ${titleText}`}
                            >
                              {agent.title}
                            </h3>
                            <p
                              className={`text-sm ${descriptionText} font-montserrat`}
                            >
                              {agent.description}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            openWebDropdown === key ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown Content */}
                      <AnimatePresence>
                        {openWebDropdown === key && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 border-t border-gray-700/50 pt-4">
                              <div className="flex flex-col lg:flex-row gap-6">
                                {/* Features - Always shown */}
                                <div className="flex-auto">
                                  <h4
                                    className={`font-semibold ${titleText} mb-3`}
                                  >
                                    Features
                                  </h4>
                                  <div className="space-y-2">
                                    {agent.features.map((feature, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-3"
                                      >
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0" />
                                        <span
                                          className={`text-sm ${descriptionText} font-montserrat`}
                                        >
                                          {feature}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Mobile Image - Only shown in dropdown on mobile */}

                                <div className="flex flex-1 md:hidden  items-center justify-center">
                                  <div className="relative h-[24rem]  w-auto aspect-[4/6]  rounded-lg overflow-hidden">
                                    <Image
                                      src={agent.image}
                                      alt={agent.title}
                                      fill
                                      className="object-contain  "
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
                <div className="hidden md:flex flex-1  items-center justify-center">
                  <div className="relative h-[32rem]  w-auto aspect-[4/6]  rounded-lg overflow-hidden">
                    <Image
                      src={agent}
                      alt="mainImage"
                      fill
                      className="object-contain  "
                    />
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Instagram Platform Content */}
          <AnimatePresence mode="wait">
            {activePlatform === "insta" && (
              <div className="flex items-center justify-between gap-6 w-full ">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 flex-1 lg:flex-[35%]"
                >
                  {Object.entries(instaAutomationTypes).map(
                    ([key, automation]) => (
                      <motion.div
                        key={key}
                        className={`${dropdownBg} border ${dropdownBorder} rounded-xl overflow-hidden backdrop-blur-sm`}
                      >
                        {/* Dropdown Button */}
                        <button
                          onClick={() => {
                            toggleInstaDropdown(key);
                            setInstaImage(automation.image);
                            setInstaImage1(automation.image1);
                          }}
                          className="w-full flex items-center justify-between p-6 text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                openInstaDropdown === key
                                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                                  : "bg-gray-500/20 text-gray-600"
                              }`}
                            >
                              {automation.icon}
                            </div>
                            <div>
                              <h3
                                className={`text-lg font-semibold ${titleText}`}
                              >
                                {automation.title}
                              </h3>
                              <p
                                className={`text-sm ${descriptionText} font-montserrat`}
                              >
                                {automation.description}
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${
                              openInstaDropdown === key ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Dropdown Content */}
                        <AnimatePresence>
                          {openInstaDropdown === key && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 border-t border-gray-700/50 pt-4">
                                <div className="flex flex-col lg:flex-row gap-6">
                                  {/* Features - Always shown */}
                                  <div className="flex-1">
                                    <h4
                                      className={`font-semibold ${titleText} mb-3`}
                                    >
                                      Features
                                    </h4>
                                    <div className="space-y-2">
                                      {automation.features.map(
                                        (feature, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center gap-3"
                                          >
                                            <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0" />
                                            <span
                                              className={`text-sm ${descriptionText} font-montserrat`}
                                            >
                                              {feature}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  {/* Mobile Images - Only shown in dropdown on mobile */}
                                  <div className="md:hidden">
                                    <div className="grid sm:grid-cols-2 gap-2">
                                      {/* <div className="relative  h-auto aspect-[4/6] rounded-lg overflow-hidden">
                                        <Image
                                          src={automation.image1}
                                          alt={automation.title}
                                          fill
                                          className="object-contain"
                                        />
                                      </div> */}
                                      {/* <div className="relative h-auto aspect-[4/6] rounded-lg overflow-hidden">
                                        <Image
                                          src={automation.image}
                                          alt={automation.title}
                                          fill
                                          className="object-contain"
                                        />
                                      </div> */}
                                      <div className="flex flex-1 md:hidden  items-center justify-center">
                                        <div className="relative h-[24rem]  w-auto aspect-[4/6]  rounded-lg overflow-hidden">
                                          <Image
                                            src={automation.image1}
                                            alt={automation.title}
                                            fill
                                            className="object-contain  "
                                          />
                                        </div>
                                      </div>
                                      <div className="flex flex-1 md:hidden  items-center justify-center">
                                        <div className="relative h-[24rem]  w-auto aspect-[4/6]  rounded-lg overflow-hidden">
                                          <Image
                                            src={automation.image}
                                            alt={automation.title}
                                            fill
                                            className="object-contain  "
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  )}
                </motion.div>
                <div className="hidden md:block flex-1 lg:flex-[65%] w-full">
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-2 w-full">
                    <div className="relative  h-[20rem] lg:h-auto  w-auto lg:w-full aspect-[4/6] rounded-lg overflow-hidden">
                      <Image
                        src={instaImage1}
                        alt="Instagram Feature"
                        fill
                        className="object-contain "
                      />
                    </div>
                    <div className="relative h-[20rem] lg:h-auto  w-auto lg:w-full aspect-[4/6]  rounded-lg overflow-hidden">
                      <Image
                        src={instaImage}
                        alt="Instagram Feature"
                        fill
                        className="object-contain "
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
