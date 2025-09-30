"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users, BarChart3, Shield, Zap } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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

function WebFeaturesGrid() {
  // Enhanced animation variants matching FAQ section
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

  const iconVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      rotate: -180,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "backOut",
      },
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };

  const titleVariants = {
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

  const descriptionVariants = {
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
    <>
      <motion.div
        className="flex items-center justify-center text-[#00F0FF] mb-4"
        variants={titleVariants}
        whileInView="visible"
        viewport={{ once: false }}
        initial="hidden"
      >
        <span className="text-sm font-medium uppercase tracking-widest border border-[#00F0FF]/30 rounded-full px-4 py-1">
          CHATBOT FEATURE
        </span>
      </motion.div>
      <div className="text-center mb-12">
        <motion.h2
          className="text-3xl font-bold text-white mb-4 gradient-text-main"
          variants={titleVariants}
          whileInView="visible"
          viewport={{ once: false }}
          initial="hidden"
        >
          Why Choose AinspireTech AI Chatbot for Website
        </motion.h2>
        <motion.p
          className="text-xl text-gray-300 font-montserrat"
          variants={containerVariants}
          whileInView="visible"
          viewport={{ once: false }}
          initial="hidden"
        >
          Join thousands of creators who have transformed their Instagram
          engagement
        </motion.p>
      </div>
      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-50px" }}
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const colorKey = feature.color as keyof typeof colorClasses;

          return (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
              initial="hidden"
              className="h-full min-h-max"
            >
              <Card
                className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br  ${
                  colorClasses[feature.color as keyof typeof colorClasses]
                } bg-transparent border h-full`}
              >
                <CardHeader className="relative overflow-hidden p-6">
                  {/* Animated background effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    initial={{ x: -100 }}
                    whileHover={{
                      opacity: 1,
                      x: 200,
                      transition: { duration: 0.8 },
                    }}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 relative z-10 bg-black/20 backdrop-blur-sm`}
                    variants={iconVariants}
                    whileInView="visible"
                    viewport={{ once: false }}
                    initial="hidden"
                    whileHover="hover"
                  >
                    <Icon className={`h-6 w-6 ${iconColors[colorKey]}`} />
                  </motion.div>

                  {/* Title */}
                  <motion.div
                    variants={titleVariants}
                    whileInView="visible"
                    viewport={{ once: false }}
                    initial="hidden"
                  >
                    <CardTitle className="text-white mb-2 text-lg">
                      {feature.title}
                    </CardTitle>
                  </motion.div>

                  {/* Description */}
                  <motion.div
                    variants={descriptionVariants}
                    whileInView="visible"
                    viewport={{ once: false }}
                    initial="hidden"
                  >
                    <CardDescription className="text-gray-300 leading-relaxed font-montserrat">
                      {feature.description}
                    </CardDescription>
                  </motion.div>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}

export default WebFeaturesGrid;
