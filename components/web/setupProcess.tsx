"use client";

import {
  Globe,
  Search,
  MessageCircle,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

export function SetupProcess() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      number: 1,
      icon: <Globe className="h-6 w-6" />,
      title: "Provide Your Website Domain",
      subtitle: "Setup",
      description:
        "Simply input your website's domain or subdomain. Ainspiretech chatbot will crawl all publicly accessible pages to create a comprehensive knowledge base for your AI chatbot for website.",
      details: {
        type: "WEB",
        website: "Enter the URL of the website you want to build a chatbot for",
        url: "https://ainspiretech.com",
        language: "English",
        languageDescription: "Select language of source website",
        button: "Build Item",
      },
    },
    {
      number: 2,
      icon: <Search className="h-6 w-6" />,
      title: "Analyze & Index Content for AI Chatbot",
      subtitle: "Process",
      description:
        "Ainspiretech chatbots learn from every page—understanding text, images, charts, and tables—ensuring your AI chatbot for website captures all key information. Once complete, your chatbot is ready to engage.",
    },
    {
      number: 3,
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Start Chatting with AI Chatbot on Website",
      subtitle: "Launch",
      description:
        "Deploy the AI chatbot for your website to answer questions in natural languages. From products to services and policies, it provides full customer support with instant, AI-powered responses and links to relevant pages.",
      chatPreview: "Hello, I am Ainspiretech AI. How can I help you today?",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const buttonHoverVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  const iconGlowVariants = {
    hover: {
      scale: 1.1,
      boxShadow: "0 0 20px rgba(0, 240, 255, 0.5)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.section
      className="w-full py-20 bg-transparent text-white"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="container mx-auto px-4 w-full">
        <motion.div
          className="flex items-center justify-center text-[#00F0FF] mb-4"
          variants={titleVariants}
          whileInView="visible"
          viewport={{ once: false }}
          initial="hidden"
        >
          <span className="text-sm font-medium uppercase tracking-widest border border-[#00F0FF]/30 rounded-full px-4 py-1">
            SETUP PROCEDURE
          </span>
        </motion.div>
        {/* Header */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-4 gradient-text-main text-center">
            How to Add AI Chatbot to Your Website
          </h2>
          {/* Divider */}
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full mx-auto mb-12"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>

        <Tabs
          defaultValue="step1"
          className="space-y-6 max-w-7xl w-full mx-auto flex flex-wrap flex-col items-center justify-center"
        >
          <motion.div variants={itemVariants}>
            <TabsList className="bg-[#0a0a0a]/10 backdrop-blur-sm border min-h-max flex flex-wrap items-center justify-center max-w-max gap-1 md:gap-3 text-white w-full grid-cols-3 border-gray-900">
              {steps.map((step) => (
                <motion.div
                  key={step.number}
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonHoverVariants}
                >
                  <TabsTrigger
                    value={`step${step.number}`}
                    className="data-[state=active]:text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00F0FF] data-[state=active]:to-[#B026FF] flex items-center space-x-0 md:space-x-2 px-1 py-2 md:px-4 md:py-3"
                    onClick={() => setActiveStep(step.number)}
                  >
                    <motion.div
                      className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                      whileHover="hover"
                      variants={iconGlowVariants}
                    >
                      <span className="text-sm font-bold">{step.number}</span>
                    </motion.div>
                    <span>{step.subtitle}</span>
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            {steps.map((step) => (
              <TabsContent
                key={step.number}
                value={`step${step.number}`}
                className="space-y-6"
                asChild
              >
                <motion.div
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="max-w-4xl mx-auto">
                    <motion.div
                      className="bg-[#0a0a0a]/10 backdrop-blur-sm border border-gray-800 rounded-2xl p-2 md:p-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      {/* Step Header */}
                      <motion.div
                        className="flex items-center space-x-3 mb-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <motion.div
                          className="w-12 h-12 p-2 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-xl flex items-center justify-center"
                          whileHover={{
                            rotate: [0, -5, 5, 0],
                            transition: { duration: 0.4 },
                          }}
                        >
                          {step.icon}
                        </motion.div>
                        <div>
                          <div className="text-sm text-[#00F0FF] font-semibold uppercase tracking-wide">
                            Step {step.number} • {step.subtitle}
                          </div>
                          <h3 className="text-2xl font-bold text-white">
                            {step.title}
                          </h3>
                        </div>
                      </motion.div>

                      {/* Description */}
                      <motion.p
                        className="text-gray-300 leading-relaxed font-montserrat mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {step.description}
                      </motion.p>

                      {/* Step-specific Content */}
                      <AnimatePresence mode="wait">
                        {step.number === 1 && (
                          <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                          >
                            {/* File Type Selection */}
                            <motion.div
                              className="flex space-x-4"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <motion.div
                                className="flex items-center space-x-2"
                                variants={itemVariants}
                              >
                                <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                                <span className="text-gray-300">FILES</span>
                              </motion.div>
                              <motion.div
                                className="flex items-center space-x-2"
                                variants={itemVariants}
                              >
                                <motion.div
                                  className="w-4 h-4 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded flex items-center justify-center"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <CheckCircle className="h-3 w-3 text-white" />
                                </motion.div>
                                <span className="text-white font-semibold">
                                  WEB
                                </span>
                              </motion.div>
                            </motion.div>

                            {/* Website Input */}
                            <motion.div
                              className="space-y-3"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                              transition={{ staggerChildren: 0.1 }}
                            >
                              <motion.label
                                className="block text-sm font-semibold text-white"
                                variants={itemVariants}
                              >
                                Website
                              </motion.label>
                              <motion.p
                                className="text-sm text-gray-400"
                                variants={itemVariants}
                              >
                                Enter the URL of the website you want to build a
                                chatbot for
                              </motion.p>

                              <motion.div
                                className="space-y-2"
                                variants={itemVariants}
                              >
                                <label className="block text-sm font-medium text-gray-300">
                                  Url
                                </label>
                                <motion.div
                                  className="bg-[#0a0a0a] border border-gray-700 rounded-lg p-3"
                                  whileHover={{ borderColor: "#00F0FF" }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <span className="text-[#00F0FF]">
                                    https://bootet.ai
                                  </span>
                                </motion.div>
                              </motion.div>

                              <motion.div
                                className="space-y-2"
                                variants={itemVariants}
                              >
                                <label className="block text-sm font-medium text-gray-300">
                                  Language
                                </label>
                                <motion.div
                                  className="bg-[#0a0a0a] border border-gray-700 rounded-lg p-3"
                                  whileHover={{ borderColor: "#00F0FF" }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <span className="text-white">English</span>
                                </motion.div>
                                <p className="text-sm text-gray-400">
                                  Select language of source website
                                </p>
                              </motion.div>

                              <motion.button
                                className="w-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity duration-300"
                                variants={buttonHoverVariants}
                                whileHover="hover"
                                whileTap="tap"
                              >
                                Build Item
                              </motion.button>
                            </motion.div>
                          </motion.div>
                        )}

                        {step.number === 2 && (
                          <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                          >
                            <motion.div
                              className="bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] border border-[#00F0FF]/30 rounded-lg p-6"
                              whileHover={{
                                borderColor: "#00F0FF",
                                transition: { duration: 0.3 },
                              }}
                            >
                              <div className="flex items-center space-x-3 mb-4">
                                <motion.div
                                  animate={{
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                  }}
                                >
                                  <Zap className="h-6 w-6 text-[#00F0FF]" />
                                </motion.div>
                                <h4 className="text-lg font-bold text-white">
                                  Crawling & Indexing Process
                                </h4>
                              </div>
                              <div className="space-y-2">
                                {[
                                  "Scanning website structure",
                                  "Extracting text content",
                                  "Analyzing images and tables",
                                  "Building knowledge base",
                                ].map((item, index) => (
                                  <motion.div
                                    key={item}
                                    className="flex items-center space-x-2 text-sm text-gray-300"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.4,
                                      delay: 0.5 + index * 0.1,
                                    }}
                                  >
                                    <motion.div
                                      className="w-2 h-2 bg-[#00F0FF] rounded-full"
                                      animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.5, 1, 0.5],
                                      }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: index * 0.3,
                                      }}
                                    />
                                    <span>{item}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          </motion.div>
                        )}

                        {step.number === 3 && (
                          <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                          >
                            {/* Chat Preview */}
                            <motion.div
                              className="bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] border border-[#00F0FF]/30 rounded-lg p-4"
                              whileHover={{ borderColor: "#00F0FF" }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex items-center space-x-3 mb-3">
                                <motion.div
                                  className="w-8 h-8 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full flex items-center justify-center"
                                  animate={{
                                    scale: [1, 1.05, 1],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                  }}
                                >
                                  <MessageCircle className="h-4 w-4 text-white" />
                                </motion.div>
                                <div>
                                  <div className="font-bold text-white">
                                    DenserAI
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Online
                                  </div>
                                </div>
                              </div>
                              <motion.div
                                className="bg-gray-800 rounded-lg p-3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                              >
                                <p className="text-white">{step.chatPreview}</p>
                              </motion.div>
                            </motion.div>

                            {[
                              "Instant AI-powered responses",
                              "Links to relevant pages",
                              "24/7 customer support",
                            ].map((item, index) => (
                              <motion.div
                                key={item}
                                className="flex items-center space-x-2 text-sm text-gray-300"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.4,
                                  delay: 0.7 + index * 0.1,
                                }}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.2 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <CheckCircle className="h-4 w-4 text-[#00F0FF]" />
                                </motion.div>
                                <span>{item}</span>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </div>
    </motion.section>
  );
}
