"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Check, BadgeCheck, Bot } from "lucide-react";
import Image from "next/image";
import Rimg1 from "@/public/assets/img/chatbot.png";
import Rimg2 from "@/public/assets/img/headingimg.png";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [<InstagramSection key={1} />, <WebChatbotSection key={0} />];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="text-white px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto py-10">
        <div className="relative">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-opacity duration-500 ${
                currentSlide === index
                  ? "opacity-100"
                  : "opacity-0 absolute top-0 left-0 w-full"
              }`}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Instagram Section Component
function InstagramSection() {
  const router = useRouter();

  // Animation variants - EXACTLY like FAQ component
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

  const badgeVariants = {
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

  const featureVariants = {
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

  const buttonVariants = {
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
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
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
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-12 items-center">
        {/* Left Column - Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-100px" }}
        >
          <motion.div
            className="inline-flex items-center text-blue-400 border border-blue-400/30 rounded-full px-4 py-1 mb-4"
            variants={badgeVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            <Zap className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">
              Meta-Approved Instagram Automation
            </span>
          </motion.div>

          <motion.h1
            className="text-2xl md:text-4xl font-bold leading-tight mb-4"
            variants={titleVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            Reply to Instagram
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
              Comments Automatically
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-300 mb-8 max-w-2xl font-montserrat"
            variants={textVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            #1 Auto-Reply Platform for Creators and Brands. Never miss a
            customer comment again.
          </motion.p>

          {/* Trust Badges */}
          <motion.div
            className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-4"
            variants={containerVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            <motion.div
              className="flex items-center space-x-2"
              variants={badgeVariants}
            >
              <BadgeCheck className="h-5 w-5 text-[#00F0FF]" />
              <span className="text-sm text-gray-300">
                Meta Business Partner
              </span>
            </motion.div>
            <motion.div
              className="flex items-center space-x-2"
              variants={badgeVariants}
            >
              <BadgeCheck className="h-5 w-5 text-[#00F0FF]" />
              <span className="text-sm text-gray-300">
                300+ creators, brands and agencies!
              </span>
            </motion.div>
          </motion.div>

          {/* Feature List */}
          <motion.div
            className="space-y-1 md:space-y-3 mb-4 md:mb-8"
            variants={containerVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            {[
              "Instant automated replies to comments",
              "Customizable response templates",
              "Advanced spam detection",
              "Multi-account support",
              "Real-time analytics dashboard",
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="flex items-center"
                variants={featureVariants}
              >
                <Check className="h-5 w-5 text-[#FF2E9F] mr-3" />
                <span className="text-gray-300 font-montserrat">{feature}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-4 mb-4"
            variants={containerVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            <motion.div variants={buttonVariants} whileHover="hover">
              <Button
                onClick={() => router.push("/insta/dashboard")}
                className="bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] text-black text-lg py-6 px-8 w-full md:w-auto"
              >
                Start Automating - It&apos;s Free!
              </Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover">
              <Button
                onClick={() => router.push("/insta/pricing")}
                variant="outline"
                className="border-gray-600 text-gray-300 text-lg py-6 px-8 w-full md:w-auto hover:bg-gray-800"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          <motion.p
            className="text-sm text-gray-400 font-montserrat"
            variants={textVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            No credit card required • 7-day free trial • Cancel anytime
          </motion.p>
        </motion.div>

        {/* Right Column - Image */}
        <motion.div
          variants={imageVariants}
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
          initial="hidden"
          className="relative m-auto w-full h-[50vh] lg:h-[90%] xl:h-[100%]"
        >
          <Image
            src={Rimg2}
            alt="Instagram Automation"
            fill
            sizes="100%"
            className="object-contain"
            loading="lazy"
          />
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] rounded-full opacity-20 blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#FF2E9F] to-[#B026FF] rounded-full opacity-20 blur-xl" />
        </motion.div>
      </div>
    </div>
  );
}

// Web Chatbot Section Component
function WebChatbotSection() {
  const router = useRouter();

  // EXACT SAME animation variants as FAQ component
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

  const badgeVariants = {
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

  const featureVariants = {
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

  const buttonVariants = {
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
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
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
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-12 items-center">
        {/* Left Column - Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-100px" }}
        >
          <motion.div
            className="inline-flex items-center text-blue-400 border border-blue-400/30 rounded-full px-4 py-1 mb-4"
            variants={badgeVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            <Bot className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">AI-Powered Web Chatbot</span>
          </motion.div>

          <motion.h1
            className="text-3xl md:text-4xl font-bold leading-tight mb-4"
            variants={titleVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            Engage Website Visitors
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
              With Smart Chatbots
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-300 mb-8 max-w-2xl font-montserrat"
            variants={textVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            AI-powered chatbots that understand customer queries and provide
            instant responses 24/7.
          </motion.p>

          {/* Trust Badges */}
          <motion.div
            className="flex items-center space-x-8 mb-8 flex-wrap gap-4"
            variants={containerVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            <motion.div
              className="flex items-center space-x-2"
              variants={badgeVariants}
            >
              <BadgeCheck className="h-5 w-5 text-[#00F0FF]" />
              <span className="text-sm text-gray-300">
                AI-Powered Responses
              </span>
            </motion.div>
            <motion.div
              className="flex items-center justify-center gap-1 text-sm text-gray-400"
              variants={badgeVariants}
            >
              <BadgeCheck className="h-5 w-5 text-[#00F0FF]" />
              <p>Used by 150+ businesses worldwide!</p>
            </motion.div>
          </motion.div>

          {/* Feature List */}
          <motion.div
            className="space-y-1 md:space-y-3 mb-4 md:mb-8"
            variants={containerVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            {[
              "24/7 customer support automation",
              "AI-powered natural conversations",
              "Easy integration with your website",
              "Lead generation and qualification",
              "Multi-language support",
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="flex items-center"
                variants={featureVariants}
              >
                <Check className="h-5 w-5 text-[#FF2E9F] mr-3" />
                <span className="text-gray-300 font-montserrat">{feature}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-4 mb-4"
            variants={containerVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            <motion.div variants={buttonVariants} whileHover="hover">
              <Button
                onClick={() => router.push("/web/UserDashboard")}
                className="bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] text-black text-lg py-6 px-8 w-full md:w-auto"
              >
                Start Automating - It&apos;s Free!
              </Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover">
              <Button
                variant="outline"
                onClick={() => router.push("/web/pricing")}
                className="border-gray-600 text-gray-300 text-lg py-6 px-8 w-full md:w-auto hover:bg-gray-800"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          <motion.p
            className="text-sm text-gray-400 font-montserrat"
            variants={textVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            No coding required • 14-day free trial • Setup in minutes
          </motion.p>
        </motion.div>

        {/* Right Column - Image */}
        <motion.div
          variants={imageVariants}
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
          initial="hidden"
          className="relative m-auto w-full h-[50vh] lg:h-[90%] xl:h-[100%]"
        >
          <Image
            src={Rimg1}
            alt="AI Chatbot"
            fill
            sizes="100%"
            className="object-contain"
            loading="lazy"
          />

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] rounded-full opacity-20 blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#FF2E9F] to-[#B026FF] rounded-full opacity-20 blur-xl" />
        </motion.div>
      </div>
    </div>
  );
}
