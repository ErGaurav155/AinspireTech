"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Heart,
  Users,
  Zap,
  Rocket,
  Shield,
  Star,
  ArrowRight,
  Calendar,
  CheckCircle,
  Instagram,
  Play,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import instaPost from "@/public/assets/img/instappost.jpg";
import { useRouter } from "next/navigation";

// TypingAnimation Component
const TypingAnimation = ({
  text,
  speed = 30,
  className = "",
  onComplete,
  delay = 0,
}: {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  delay?: number;
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTyping = useCallback(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      if (onComplete) onComplete();
    }
  }, [currentIndex, onComplete, speed, text]);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        startTyping();
      }, delay);
      return () => clearTimeout(timer);
    } else {
      startTyping();
    }
  }, [delay, startTyping]);

  return (
    <span className={className}>
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};

export function BusinessMessagingTemplate() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

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

  return (
    <section className="w-full bg-transparent text-white py-20">
      <div className="flex flex-col gap-12 items-center max-w-7xl mx-auto px-4 ">
        {/* Left Column - Content */}
        <motion.div
          className="text-center mb-12"
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
              CUSTOMER GAIN{" "}
            </span>
          </motion.div>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4 gradient-text-main"
            variants={titleVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            Be where your customers are
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 font-montserrat"
            variants={textVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            Currently providing instagram,messenger automations and website
            chatbots.For other platforms will come soon.
          </motion.p>
        </motion.div>

        {/* Right Column - Instagram Demo Video */}
        <motion.div
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{
            duration: 1.2,
            type: "spring",
            stiffness: 50,
            damping: 15,
          }}
          className="relative  w-full max-w-5xl mx-auto"
        >
          {/* Main Video Container with Enhanced Animations */}
          <motion.div
            initial={{ scale: 0.8, rotate: -2 }}
            whileInView={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              scale: 1.02,
              rotate: 0,
              y: -5,
              transition: { duration: 0.3 },
            }}
            className="relative rounded-3xl overflow-hidden px-2 md:px-5 shadow-2xl shadow-[#00F0FF]/20"
          >
            {/* Video with 8px crop from top and bottom */}
            <motion.video
              ref={videoRef}
              src="/assets/MainVid.mp4"
              autoPlay
              loop
              muted
              playsInline
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="max-w-5xl h-auto w-full m-auto scale-[1.03] -translate-y-1"
              style={{
                clipPath: "inset(8px 0 8px 0)",
                marginTop: "-8px",
                marginBottom: "-8px",
              }}
            />

            {/* Animated Border Glow */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute inset-0 rounded-3xl  border-[0.5px] border-transparent bg-gradient-to-r from-[#00F0FF] via-[#B026FF] to-[#FF2E9F] opacity-30"
              style={{
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "2px",
              }}
            />

            {/* Floating Play Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 1,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.2 },
              }}
              className="hidden absolute top-4 right-2 w-16 h-16 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full md:flex items-center justify-center shadow-lg cursor-pointer"
              onClick={() => videoRef.current?.play()}
            >
              <Play className="h-5 w-5 text-white ml-0.5 fill-white" />
            </motion.div>

            {/* Instagram UI Mock Elements */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="  absolute bottom-4 left-4 right-4 flex justify-between items-center"
            >
              <div className="flex space-x-3">
                <Heart className="h-5 w-5 text-white" />
                <MessageCircle className="h-5 w-5 text-white" />
                <Instagram className="h-5 w-5 text-white" />
              </div>
              <ShoppingBag className="h-5 w-5 text-white" />
            </motion.div>
          </motion.div>

          {/* Enhanced Floating Decorations */}
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.7,
              type: "spring",
              stiffness: 150,
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0],
            }}
            className="absolute -top-5 right-5   w-10 h-10 bg-[#FF2E9F] rounded-full z-30 shadow-lg shadow-[#FF2E9F]/50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.9,
              type: "spring",
              stiffness: 150,
            }}
            animate={{
              y: [0, 10, 0],
              rotate: [0, -5, 0],
            }}
            className="absolute -bottom-6 -left-6 w-8 h-8 bg-[#00F0FF] rounded-full z-30 shadow-lg shadow-[#00F0FF]/50"
          />

          {/* Additional Floating Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 1.1,
              type: "spring",
              stiffness: 200,
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, 5, 0],
            }}
            className="absolute -top-4 left-8 w-6 h-6 bg-gradient-to-r from-[#B026FF] to-[#FF2E9F] rounded-full z-20 shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
