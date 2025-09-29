"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  MessageCircle,
  Instagram,
  Users,
  BookOpen,
  ShoppingCart,
  Video,
  Image,
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
      boxShadow: "0 20px 40px -10px rgba(37, 139, 148, 0.2)",
      transition: {
        duration: 0.3,
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
      videoPlaceholder: "https://example.com/support-demo.mp4",
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
      videoPlaceholder: "https://example.com/booking-demo.mp4",
      example: {
        question: "Can I book a meeting for next Tuesday?",
        answer:
          "I have 2 PM available next Tuesday. Would you prefer morning or afternoon?",
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
      videoPlaceholder: "https://example.com/leadgen-demo.mp4",
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
      videoPlaceholder: "https://example.com/reels-demo.mp4",
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
      videoPlaceholder: "https://example.com/posts-demo.mp4",
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
      videoPlaceholder: "https://example.com/stories-demo.mp4",
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
      videoPlaceholder: "https://example.com/dms-demo.mp4",
    },
  };

  const currentWebChat = webChatTypes[activeWebChatTab];
  const currentInsta = instaAutomationTypes[activeInstaTab];

  // Voice Agent UI Components
  const VoiceCallInterface = () => (
    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-500/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">AI Voice Agent</div>
            <div className="text-cyan-300 text-sm">Speaking...</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm">Live</span>
        </div>
      </div>

      {/* Voice Waves */}
      <div className="flex justify-center space-x-1 mb-6">
        {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((height, index) => (
          <div
            key={index}
            className="w-1 bg-gradient-to-t from-cyan-400 to-blue-400 rounded-full animate-pulse"
            style={{ height: `${height * 4}px` }}
          ></div>
        ))}
      </div>

      {/* Conversation */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-end">
          <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-2xl rounded-br-none p-4 max-w-xs">
            <div className="text-white text-sm">
              Hello! How can I help you today with your insurance policy?
            </div>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-gray-700/50 border border-gray-600/30 rounded-2xl rounded-bl-none p-4 max-w-xs">
            <div className="text-gray-300 text-sm">
              I need to check my claim status for policy number 12345
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-2xl rounded-br-none p-4 max-w-xs">
            <div className="text-white text-sm">
              I can help with that. Your claim is currently under review and
              should be processed within 2-3 business days.
            </div>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="flex justify-center space-x-4">
        <button className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors">
          <Phone className="h-5 w-5 text-red-400" />
        </button>
        <button className="w-12 h-12 bg-gray-600/50 border border-gray-500/30 rounded-full flex items-center justify-center hover:bg-gray-600/70 transition-colors">
          <Mic className="h-5 w-5 text-gray-300" />
        </button>
        <button className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center hover:bg-cyan-500/30 transition-colors">
          <Volume2 className="h-5 w-5 text-cyan-400" />
        </button>
      </div>
    </div>
  );

  const VoiceAnalytics = () => (
    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg p-4 border border-cyan-500/30">
      <h4 className="font-semibold text-white mb-3">Voice Analytics</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">98%</div>
          <div className="text-xs text-cyan-300">Accuracy</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">2.1s</div>
          <div className="text-xs text-blue-300">Avg Response</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">24/7</div>
          <div className="text-xs text-green-300">Availability</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">5</div>
          <div className="text-xs text-purple-300">Languages</div>
        </div>
      </div>
    </div>
  );

  // Instagram UI Components
  const InstagramPost = () => (
    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden max-w-sm mx-auto">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
          <div>
            <div className="w-20 h-3 bg-gray-200 rounded"></div>
            <div className="w-16 h-2 bg-gray-100 rounded mt-1"></div>
          </div>
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>

      {/* Post Image */}
      <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Instagram className="h-12 w-12 text-pink-500 opacity-20" />
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex justify-between p-3">
        <div className="flex space-x-4">
          <Heart className="h-6 w-6 text-gray-600" />
          <MessageCircle className="h-6 w-6 text-gray-600" />
          <Send className="h-6 w-6 text-gray-600" />
        </div>
        <BookOpen className="h-6 w-6 text-gray-600" />
      </div>

      {/* Likes */}
      <div className="px-3 pb-2">
        <div className="w-24 h-3 bg-gray-200 rounded"></div>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <div className="w-full h-3 bg-gray-200 rounded mb-1"></div>
        <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
      </div>

      {/* Comments */}
      <div className="px-3 pb-3 space-y-2">
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="w-16 h-3 bg-gray-200 rounded mb-1"></div>
            <div className="w-full h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="w-20 h-3 bg-gray-200 rounded mb-1"></div>
            <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const InstagramDMInterface = () => (
    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden max-w-sm mx-auto h-96 flex flex-col">
      {/* DM Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="flex space-x-2">
          <Video className="h-5 w-5 text-gray-600" />
          <Phone className="h-5 w-5 text-gray-600" />
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* Received Message */}
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="max-w-xs">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="w-32 h-3 bg-gray-300 rounded mb-1"></div>
              <div className="w-40 h-3 bg-gray-300 rounded"></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">2 min ago</div>
          </div>
        </div>

        {/* Sent Message */}
        <div className="flex space-x-2 justify-end">
          <div className="max-w-xs">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg p-3">
              <div className="w-28 h-3 bg-white/50 rounded mb-1"></div>
              <div className="w-36 h-3 bg-white/50 rounded"></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              Just now
            </div>
          </div>
          <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
        </div>

        {/* AI Auto-response */}
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
            <Zap className="h-3 w-3 text-white" />
          </div>
          <div className="max-w-xs">
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
              <div className="flex items-center space-x-1 mb-1">
                <div className="w-16 h-3 bg-cyan-200 rounded"></div>
                <div className="text-xs text-cyan-600">AI Response</div>
              </div>
              <div className="w-40 h-3 bg-cyan-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-100 rounded-full p-2">
            <div className="w-full h-4 bg-gray-300 rounded"></div>
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <Send className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  const InstagramAnalytics = () => (
    <div className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-lg p-4 border border-pink-500/30">
      <h4 className="font-semibold text-white mb-3">Automation Performance</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-pink-400">98%</div>
          <div className="text-xs text-pink-300">Response Rate</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">2.3s</div>
          <div className="text-xs text-purple-300">Avg Response Time</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">1.4K</div>
          <div className="text-xs text-cyan-300">Engagements Today</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">47%</div>
          <div className="text-xs text-green-300">Conversion Rate</div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.section
      className="w-full py-20 bg-transparent text-white backdrop-blur-sm"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-100px" }}
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-2xl flex items-center justify-center">
              <Volume2 className="h-8 w-8 text-white" />
            </div>
            <motion.h2
              className="text-4xl md:text-5xl font-bold gradient-text-main"
              variants={titleVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              AI Voice Agent
            </motion.h2>
          </motion.div>

          <motion.div
            className="flex justify-center mb-6"
            variants={textVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            <ArrowDown className="h-6 w-6 text-[#00F0FF] animate-bounce" />
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
          className="flex justify-center mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
        >
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-full p-1 flex backdrop-blur-sm">
            {[
              {
                id: "webchat",
                label: "Voice Agents",
                icon: <Mic className="h-5 w-5" />,
                gradient: "from-cyan-600 to-blue-600",
              },
              {
                id: "instagram",
                label: "Instagram Automation",
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
                variants={cardVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
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
            className="flex justify-center mb-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
          >
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-1 flex flex-col md:flex-row backdrop-blur-sm">
              {[
                {
                  id: "support",
                  label: "AI Support Agent",
                  icon: <Phone className="h-5 w-5" />,
                },
                {
                  id: "education",
                  label: "AI Booking Agent",
                  icon: <Calendar className="h-5 w-5" />,
                },
                {
                  id: "leadgen",
                  label: "AI Lead Qualification Agent",
                  icon: <Users className="h-5 w-5" />,
                },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveWebChatTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeWebChatTab === tab.id
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                      : "bg-[#1a1a1a] border border-gray-800 text-gray-300 hover:text-white"
                  }`}
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
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
            className="flex justify-center mb-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
          >
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-1 flex flex-col md:flex-row backdrop-blur-sm">
              {[
                {
                  id: "reels",
                  label: "Reels Auto",
                  icon: <Video className="h-4 w-4" />,
                },
                {
                  id: "posts",
                  label: "Posts Auto",
                  icon: <ImagePlus className="h-4 w-4" />,
                },
                {
                  id: "stories",
                  label: "Stories Auto",
                  icon: <Zap className="h-4 w-4" />,
                },
                {
                  id: "dms",
                  label: "DM Auto",
                  icon: <MessageCircle className="h-4 w-4" />,
                },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveInstaTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeInstaTab === tab.id
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
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
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
        >
          {activePlatform === "webchat" ? (
            <motion.div
              className="grid lg:grid-cols-3 gap-8 items-start"
              variants={cardVariants}
              whileHover="hover"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
              initial="hidden"
            >
              {/* Voice Agent UI Preview */}
              <motion.div
                className="lg:col-span-2 bg-[#0a0a0a]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center justify-between mb-6">
                  <motion.h3
                    className="text-xl font-bold text-white"
                    variants={titleVariants}
                  >
                    Voice Agent Interface
                  </motion.h3>
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <Volume2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Live Call</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div variants={cardVariants} whileHover="hover">
                    <VoiceCallInterface />
                    <div className="mt-3 text-center">
                      <div className="inline-flex items-center px-3 py-1 bg-cyan-500/20 rounded-full">
                        <Mic className="h-3 w-3 mr-1 text-cyan-400" />
                        <span className="text-xs text-cyan-400">
                          Active Conversation
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Voice Agent Details */}
              <motion.div
                className="bg-[#0a0a0a]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div
                  className="flex items-center gap-3 mb-6"
                  variants={containerVariants}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
                    {currentWebChat.icon}
                  </div>
                  <div>
                    <motion.h3
                      className="text-xl font-bold text-white"
                      variants={titleVariants}
                    >
                      {currentWebChat.title}
                    </motion.h3>
                    <motion.p
                      className="text-gray-400 text-sm"
                      variants={textVariants}
                    >
                      {currentWebChat.description}
                    </motion.p>
                  </div>
                </motion.div>

                {/* Features */}
                <motion.div className="mb-6" variants={containerVariants}>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Features
                  </h4>
                  {currentWebChat.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 mb-2"
                      variants={textVariants}
                    >
                      <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Analytics */}
                <motion.div variants={cardVariants}>
                  <VoiceAnalytics />
                </motion.div>

                {/* Conversation Example */}
                <motion.div
                  className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 mt-4"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">
                      Real-time Example
                    </span>
                  </div>
                  <motion.p
                    className="text-gray-300 text-sm mb-2"
                    variants={textVariants}
                  >
                    <strong>Customer:</strong> {currentWebChat.example.question}
                  </motion.p>
                  <motion.p
                    className="text-cyan-400 text-sm"
                    variants={textVariants}
                  >
                    <strong>AI Agent:</strong> {currentWebChat.example.answer}
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className="grid lg:grid-cols-3 gap-8 items-start"
              variants={cardVariants}
              whileHover="hover"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
              initial="hidden"
            >
              {/* Instagram UI Preview */}
              <motion.div
                className="lg:col-span-2 bg-[#0a0a0a]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center justify-between mb-6">
                  <motion.h3
                    className="text-xl font-bold text-white"
                    variants={titleVariants}
                  >
                    Instagram Automation Preview
                  </motion.h3>
                  <div className="flex items-center space-x-2 text-pink-400">
                    <Instagram className="h-5 w-5" />
                    <span className="text-sm font-medium">Live Preview</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div variants={cardVariants} whileHover="hover">
                    <InstagramPost />
                    <div className="mt-3 text-center">
                      <div className="inline-flex items-center px-3 py-1 bg-pink-500/20 rounded-full">
                        <Zap className="h-3 w-3 mr-1 text-pink-400" />
                        <span className="text-xs text-pink-400">
                          Auto-responding
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={cardVariants} whileHover="hover">
                    <InstagramDMInterface />
                    <div className="mt-3 text-center">
                      <div className="inline-flex items-center px-3 py-1 bg-cyan-500/20 rounded-full">
                        <MessageCircle className="h-3 w-3 mr-1 text-cyan-400" />
                        <span className="text-xs text-cyan-400">
                          AI DM Responses
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Automation Details */}
              <motion.div
                className="bg-[#0a0a0a]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div
                  className="flex items-center gap-3 mb-6"
                  variants={containerVariants}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center">
                    {currentInsta.icon}
                  </div>
                  <div>
                    <motion.h3
                      className="text-xl font-bold text-white"
                      variants={titleVariants}
                    >
                      {currentInsta.title}
                    </motion.h3>
                    <motion.p
                      className="text-gray-400 text-sm"
                      variants={textVariants}
                    >
                      {currentInsta.description}
                    </motion.p>
                  </div>
                </motion.div>

                {/* Features */}
                <motion.div className="mb-6" variants={containerVariants}>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Features
                  </h4>
                  {currentInsta.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 mb-2"
                      variants={textVariants}
                    >
                      <div className="w-2 h-2 bg-pink-500 rounded-full" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Analytics */}
                <motion.div variants={cardVariants}>
                  <InstagramAnalytics />
                </motion.div>

                {/* Automation Example */}
                <motion.div
                  className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 mt-4"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-pink-400" />
                    <span className="text-sm font-medium text-white">
                      Real-time Example
                    </span>
                  </div>
                  <motion.p
                    className="text-gray-300 text-sm mb-2"
                    variants={textVariants}
                  >
                    <strong>Trigger:</strong> New comment on your{" "}
                    {activeInstaTab}
                  </motion.p>
                  <motion.p
                    className="text-pink-400 text-sm"
                    variants={textVariants}
                  >
                    <strong>AI Action:</strong> Automated DM sent with
                    personalized response
                  </motion.p>
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
