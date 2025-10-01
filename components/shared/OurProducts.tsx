"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FeaImg1 from "@/public/assets/img/headingimg.png";
import FeaImg2 from "@/public/assets/img/featureImg2.png";
import FeaImg3 from "@/public/assets/img/FeatureImg3.png";
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
  Play,
  MessageCircle,
  Instagram,
  Users,
  BookOpen,
  ShoppingCart,
  Video,
  Zap,
  Phone,
  Mic,
  Volume2,
  ArrowDown,
  ImagePlus,
  Heart,
  Send,
  User,
  Clock,
  BarChart3,
} from "lucide-react";
import Image from "next/image";

export function AIVoiceAgentShowcase() {
  const [activePlatform, setActivePlatform] = useState<"webchat" | "instagram">(
    "webchat"
  );
  const [activeWebChatTab, setActiveWebChatTab] = useState<
    "support" | "education" | "leadgen"
  >("support");
  const [activeInstaTab, setActiveInstaTab] = useState<
    "reels" | "posts" | "stories" | "dms"
  >("reels");

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
      rotateX: -10,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      borderColor: "rgba(37, 139, 148, 0.4)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 1.1,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  const webChatTypes = {
    support: {
      title: "AI Support Agent",
      description: "Streamline support with natural voice conversations",
      icon: <Phone className="h-6 w-6" />,
      features: [
        "24/7 voice-based customer support",
        "Natural language processing",
        "Multi-language voice recognition",
        "Seamless handoff to human agents",
      ],
      image: FeaBot3,
      example: {
        question: "How to change the nominee on the web portal?",
        answer:
          "To change your nominee, please visit My Policy portal and select Nominee change. Attach the proof to initiate request.",
      },
    },
    education: {
      title: "AI Education Agent",
      description: "Automate education learning",
      icon: <Calendar className="h-6 w-6" />,
      features: [
        "Learn what you want",
        "Clarify your doubts",
        "Solve mcq test",
      ],
      image: FeaBot1,
      example: {
        question: "Can you explain machine learning concepts?",
        answer:
          "Machine learning is a subset of AI that enables systems to learn and improve from experience without explicit programming.",
      },
    },
    leadgen: {
      title: "AI Lead Qualification Agent",
      description: "Qualify leads through intelligent voice conversations",
      icon: <Users className="h-6 w-6" />,
      features: [
        "Voice-based lead scoring",
        "Automated qualification questions",
        "Lead routing intelligence",
        "Conversation analytics",
      ],
      image: FeaBot2,
      example: {
        question: "What's your company size and budget?",
        answer:
          "We're a team of 50 with a monthly budget of $5K for marketing tools.",
      },
    },
  };

  const instaAutomationTypes = {
    reels: {
      title: "Reels Automation",
      description: "Auto-engage with Instagram Reel comments",
      icon: <Video className="h-6 w-6" />,
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
      icon: <ImagePlus className="h-6 w-6" />,
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
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Story reply automation",
        "Poll and question responses",
        "DM automation for engagement",
        "Interactive story features",
      ],
      image: InstaFea1,
      image1: FeaImg3,
    },
    dms: {
      title: "DM Automation",
      description: "Automate direct message responses",
      icon: <MessageCircle className="h-6 w-6" />,
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

  const currentWebChat = webChatTypes[activeWebChatTab];
  const currentInsta = instaAutomationTypes[activeInstaTab];

  const VoiceAnalytics = () => (
    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg p-2 lg:p-4 border border-cyan-500/30">
      <h4 className="font-normal text-base text-white mb-3">Voice Analytics</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/30 rounded-lg p-3 text-center overflow-hidden">
          <div className="text-lg md:text-xl lg:text-2xl font-semibold lg:font-bold text-cyan-400">
            98%
          </div>
          <div className="text-xs text-cyan-300">Accuracy</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center overflow-hidden">
          <div className="text-lg md:text-xl lg:text-2xl font-semibold lg:font-bold text-blue-400">
            2.1s
          </div>
          <div className="text-xs text-blue-300">Avg Response</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center overflow-hidden">
          <div className="text-lg md:text-xl lg:text-2xl font-semibold lg:font-bold text-green-400">
            24/7
          </div>
          <div className="text-xs text-green-300">Availability</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center overflow-hidden">
          <div className="text-lg md:text-xl lg:text-2xl font-semibold lg:font-bold text-purple-400">
            5
          </div>
          <div className="text-xs text-purple-300">Languages</div>
        </div>
      </div>
    </div>
  );

  const InstagramAnalytics = () => (
    <div className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-lg p-2 border border-pink-500/30">
      <h4 className="font-normal text-base text-white mb-3">
        Automation Performance
      </h4>
      <div className="grid grid-cols-2 gap-1 md:gap-3">
        <div className="bg-black/30 rounded-lg p-3 text-center overflow-hidden">
          <div className="text-lg md:text-xl lg:text-2xl font-semibold lg:font-bold text-pink-400">
            98%
          </div>
          <div className="text-xs text-pink-300">Response Rate</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center overflow-hidden">
          <div className="text-lg md:text-xl lg:text-2xl font-semibold lg:font-bold text-purple-400">
            2.3s
          </div>
          <div className="text-xs text-purple-300">Avg Response Time</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center overflow-hidden">
          <div className="text-lg md:text-xl lg:text-2xl font-semibold lg:font-bold text-cyan-400">
            1.4K
          </div>
          <div className="text-xs text-cyan-300">Engagements Today</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center overflow-hidden">
          <div className="text-lg md:text-xl lg:text-2xl font-semibold lg:font-bold text-green-400">
            47%
          </div>
          <div className="text-xs text-green-300">Conversion Rate</div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.section
      className="w-full py-20 bg-transparent text-white max-w-7xl"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }}
    >
      <div className=" mx-auto ">
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-100px" }}
        >
          <motion.div
            className="flex items-center justify-center text-[#00F0FF] mb-4"
            variants={titleVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            <span className="text-sm font-medium uppercase tracking-widest border border-[#00F0FF]/30 rounded-full px-4 py-1">
              PRODUCT SHOWCASE
            </span>
          </motion.div>
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
          >
            <motion.h2
              className="text-3xl font-bold gradient-text-main"
              variants={titleVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              OUR PRODUCTS
            </motion.h2>
          </motion.div>

          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto font-montserrat"
            variants={textVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            Elevate customer experience with natural voice conversations across
            all platforms
          </motion.p>
        </motion.div>

        {/* Platform Selection Tabs */}
        <motion.div
          className="flex justify-center mb-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
        >
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-full p-1 flex backdrop-blur-sm">
            {[
              {
                id: "webchat",
                label: "Web",
                icon: <Mic className="h-5 w-5" />,
                gradient: "from-cyan-600 to-blue-600",
              },
              {
                id: "instagram",
                label: "Insta",
                icon: <Instagram className="h-5 w-5" />,
                gradient: "from-pink-600 to-purple-600",
              },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActivePlatform(tab.id as any)}
                className={`flex items-center px-6 py-3 rounded-full transition-all duration-300 ${
                  activePlatform === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white`
                    : "text-gray-300 hover:text-white"
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {tab.icon}
                <span className="ml-2 text-sm md:text-base font-light md:font-medium">
                  {tab.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Voice Agent Types */}
        {activePlatform === "webchat" && (
          <motion.div
            className="flex justify-center mb-4 p-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
          >
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-1 flex flex-row items-center sm:w-auto  justify-between sm:gap-3 sm:justify-center w-full icbackdrop-blur-sm">
              {[
                {
                  id: "support",
                  label: "Support",
                  icon: <Phone className="h-5 w-5" />,
                },
                {
                  id: "education",
                  label: "Education",
                  icon: <Calendar className="h-5 w-5" />,
                },
                {
                  id: "leadgen",
                  label: "Lead",
                  icon: <Users className="h-5 w-5" />,
                },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveWebChatTab(tab.id as any)}
                  className={`flex items-center px-0 md:px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeWebChatTab === tab.id
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                      : "bg-[#1a1a1a] text-gray-300 hover:text-white"
                  }`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {tab.icon}
                  <span className="ml-2 text-sm font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Instagram Automation Tabs */}
        {activePlatform === "instagram" && (
          <motion.div
            className="flex justify-center mb-4 px-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
          >
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-1 flex flex-row backdrop-blur-sm w-full sm:w-auto items-center justify-between sm:gap-3 sm:justify-center">
              {[
                {
                  id: "reels",
                  label: "Reels",
                  icon: <Video className="h-4 w-4" />,
                },
                {
                  id: "posts",
                  label: "Posts",
                  icon: <ImagePlus className="h-4 w-4" />,
                },
                {
                  id: "stories",
                  label: "Stories",
                  icon: <Zap className="h-4 w-4" />,
                },
                {
                  id: "dms",
                  label: "DM",
                  icon: <MessageCircle className="h-4 w-4" />,
                },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveInstaTab(tab.id as any)}
                  className={`flex items-center px-0 md:px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeInstaTab === tab.id
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {tab.icon}
                  <span className="ml-2 text-sm font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          className="w-full mx-auto p-4 md:p-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
        >
          {activePlatform === "webchat" ? (
            <motion.div
              className="flex flex-col md:flex-row-reverse items-start justify-between w-full gap-4 "
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
            >
              {/* Voice Agent UI Preview */}
              <motion.div
                className="md:flex-1 w-full   rounded-2xl p-0 bg-transparent"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div
                  className="relative  h-[28rem] min-h-max  rounded-lg overflow-hidden  mx-auto  w-full"
                  variants={imageVariants}
                  whileHover="hover"
                >
                  <Image
                    src={currentWebChat.image}
                    alt={currentWebChat.title}
                    fill
                    className="object-contain rounded-lg"
                    loading="lazy"
                  />
                </motion.div>
              </motion.div>

              {/* Voice Agent Details */}
              <motion.div
                className="md:flex-1 self-center bg-[#0a0a0a]/10 border border-white/10 rounded-2xl p-1 md:p-3 backdrop-blur-sm"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div
                  className="flex items-center gap-1 md:gap-3 mb-6"
                  variants={containerVariants}
                >
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center p-2 ">
                    {currentWebChat.icon}
                  </div>
                  <div>
                    <motion.h3
                      className=" text-base lg:text-lg font-semibold text-white"
                      variants={titleVariants}
                    >
                      {currentWebChat.title}
                    </motion.h3>
                    <motion.p
                      className="text-gray-400 text-xs md:text-sm"
                      variants={textVariants}
                    >
                      {currentWebChat.description}
                    </motion.p>
                  </div>
                </motion.div>

                {/* Features */}
                <motion.div className="mb-6" variants={containerVariants}>
                  <h4 className="text-base lg:text-lg font-semibold text-white mb-1 lg:mb-3">
                    Features
                  </h4>
                  {currentWebChat.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 mb-2"
                      variants={textVariants}
                    >
                      <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                      <span className="text-gray-300 text-xs lg:text-sm font-light lg:font-normal">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Analytics */}
                <motion.div variants={cardVariants}>
                  <VoiceAnalytics />
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col lg:flex-row-reverse  items-start justify-between gap-4 w-full"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
            >
              {/* Instagram UI Preview */}
              <motion.div
                className="md:flex-[65%] h-full  rounded-2xl p-1 md:p-3 bg-transparent w-full"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div
                  className="relative flex flex-col sm:flex-row gap-6 sm:gap-3 lg:gap-6 items-center justify-between h-[28rem] min-h-max  overflow-hidden  mx-auto  w-full"
                  variants={imageVariants}
                  whileHover="hover"
                >
                  <motion.div
                    className="relative  h-[28rem] min-h-max  rounded-lg overflow-hidden  mx-auto  w-full"
                    variants={imageVariants}
                    whileHover="hover"
                  >
                    <Image
                      src={currentInsta.image1}
                      alt={currentInsta.title}
                      fill
                      className="object-contain"
                      loading="lazy"
                    />
                  </motion.div>{" "}
                  <motion.div
                    className="relative  h-[28rem] min-h-max  rounded-lg  overflow-hidden  mx-auto  w-full"
                    variants={imageVariants}
                    whileHover="hover"
                  >
                    <Image
                      src={currentInsta.image}
                      alt={currentInsta.title}
                      fill
                      className="object-contain"
                      loading="lazy"
                    />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Automation Details */}
              <motion.div
                className="md:flex-[35%] w-full h-full bg-[#0a0a0a]/60 border border-white/10 rounded-2xl p-2 md:p-3 backdrop-blur-sm"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div
                  className="flex items-center gap-3 mb-6"
                  variants={containerVariants}
                >
                  <div className="w-8 h-8 lg:w-12 lg:h-12 p-2 lg:p-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center">
                    {currentInsta.icon}
                  </div>
                  <div>
                    <motion.h3
                      className="text-base lg:text-xl font-semibold text-white"
                      variants={titleVariants}
                    >
                      {currentInsta.title}
                    </motion.h3>
                    <motion.p
                      className="text-gray-400 text-xs md:text-sm"
                      variants={textVariants}
                    >
                      {currentInsta.description}
                    </motion.p>
                  </div>
                </motion.div>

                {/* Features */}
                <motion.div className="mb-6" variants={containerVariants}>
                  <h4 className="text-base lg:text-lg font-semibold text-white mb-1 md:mb-3">
                    Features
                  </h4>
                  {currentInsta.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 mb-2"
                      variants={textVariants}
                    >
                      <div className="w-2 h-2 bg-pink-500 rounded-full" />
                      <span className="text-gray-300 text-xs font-light lg:font-normal lg:text-sm">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Analytics */}
                <motion.div variants={cardVariants}>
                  <InstagramAnalytics />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}

// Calendar icon component
const Calendar = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
