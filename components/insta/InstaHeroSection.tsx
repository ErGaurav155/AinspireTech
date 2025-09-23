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

// Instagram Post Component - Frame 003
const InstagramPostDemo = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    // Step 1: Show post header and content
    {
      elements: (
        <div className="bg-gray-800 rounded-lg p-3 mb-3">
          <p className="text-white text-sm mb-2 leading-relaxed">
            <span className="text-white text-sm"># fitness.star</span>
          </p>
          <div className="h-32 bg-gradient-to-br from-purple-900 to-gray-800 rounded-lg mb-2 flex items-center justify-center">
            <div className="text-gray-400 text-xs">---</div>
          </div>
        </div>
      ),
    },
    // Step 2: Show Jessica's comment
    {
      elements: (
        <div className="bg-gray-900 rounded-lg p-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-white text-sm">
                Jessica Peel
              </span>
              <span className="text-gray-400 text-xs ml-2">2h</span>
              <p className="text-gray-300 text-sm mt-1">
                I will be watching 💬️
              </p>
            </div>
            <span className="text-blue-400 text-xs">Reply</span>
          </div>
        </div>
      ),
    },
    // Step 3: Show The Star's reply to Jessica
    {
      elements: (
        <div className="bg-gray-900 rounded-lg p-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-white text-sm">
                Jessica Peel
              </span>
              <span className="text-gray-400 text-xs ml-2">2h</span>
              <p className="text-gray-300 text-sm mt-1">
                I will be watching 💬️
              </p>
            </div>
            <span className="text-blue-400 text-xs">Reply</span>
          </div>
          <div className="mt-2 pl-4 border-l-2 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-white text-sm">
                  The Star
                </span>
                <span className="text-gray-400 text-xs ml-2">2h</span>
                <p className="text-gray-300 text-sm mt-1">
                  @Jess... Check your DM!
                </p>
              </div>
              <span className="text-blue-400 text-xs">Reply</span>
            </div>
          </div>
        </div>
      ),
    },
    // Step 4: Show Noa's comment
    {
      elements: (
        <div className="space-y-2">
          <div className="bg-gray-900 rounded-lg p-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-white text-sm">
                  Jessica Peel
                </span>
                <span className="text-gray-400 text-xs ml-2">2h</span>
                <p className="text-gray-300 text-sm mt-1">
                  I will be watching 💬️
                </p>
              </div>
              <span className="text-blue-400 text-xs">Reply</span>
            </div>
            <div className="mt-2 pl-4 border-l-2 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-white text-sm">
                    The Star
                  </span>
                  <span className="text-gray-400 text-xs ml-2">2h</span>
                  <p className="text-gray-300 text-sm mt-1">
                    @Jess... Check your DM!
                  </p>
                </div>
                <span className="text-blue-400 text-xs">Reply</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-white text-sm">
                  Noa Baumbakh
                </span>
                <span className="text-gray-400 text-xs ml-2">3h</span>
                <p className="text-gray-300 text-sm mt-1">
                  Cant wait for it 💬️
                </p>
              </div>
              <span className="text-blue-400 text-xs">Reply</span>
            </div>
          </div>
        </div>
      ),
    },
    // Step 5: Show The Star's reply to Noa
    {
      elements: (
        <div className="space-y-2">
          <div className="bg-gray-900 rounded-lg p-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-white text-sm">
                  Jessica Peel
                </span>
                <span className="text-gray-400 text-xs ml-2">2h</span>
                <p className="text-gray-300 text-sm mt-1">
                  I will be watching 💬️
                </p>
              </div>
              <span className="text-blue-400 text-xs">Reply</span>
            </div>
            <div className="mt-2 pl-4 border-l-2 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-white text-sm">
                    The Star
                  </span>
                  <span className="text-gray-400 text-xs ml-2">2h</span>
                  <p className="text-gray-300 text-sm mt-1">
                    @Jess... Check your DM!
                  </p>
                </div>
                <span className="text-blue-400 text-xs">Reply</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-white text-sm">
                  Noa Baumbakh
                </span>
                <span className="text-gray-400 text-xs ml-2">3h</span>
                <p className="text-gray-300 text-sm mt-1">
                  Cant wait for it 💬️
                </p>
              </div>
              <span className="text-blue-400 text-xs">Reply</span>
            </div>
            <div className="mt-2 pl-4 border-l-2 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-white text-sm">
                    The Star
                  </span>
                  <span className="text-gray-400 text-xs ml-2">3h</span>
                  <p className="text-gray-300 text-sm mt-1">
                    @Noa... Lets get it started
                  </p>
                </div>
                <span className="text-blue-400 text-xs">Reply</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Step 6: Show Mila's comment and reply
    {
      elements: (
        <div className="space-y-2">
          <div className="bg-gray-900 rounded-lg p-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-white text-sm">
                  Jessica Peel
                </span>
                <span className="text-gray-400 text-xs ml-2">2h</span>
                <p className="text-gray-300 text-sm mt-1">
                  I will be watching 💬️
                </p>
              </div>
              <span className="text-blue-400 text-xs">Reply</span>
            </div>
            <div className="mt-2 pl-4 border-l-2 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-white text-sm">
                    The Star
                  </span>
                  <span className="text-gray-400 text-xs ml-2">2h</span>
                  <p className="text-gray-300 text-sm mt-1">
                    @Jess... Check your DM!
                  </p>
                </div>
                <span className="text-blue-400 text-xs">Reply</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-white text-sm">
                  Noa Baumbakh
                </span>
                <span className="text-gray-400 text-xs ml-2">3h</span>
                <p className="text-gray-300 text-sm mt-1">
                  Cant wait for it 💬️
                </p>
              </div>
              <span className="text-blue-400 text-xs">Reply</span>
            </div>
            <div className="mt-2 pl-4 border-l-2 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-white text-sm">
                    The Star
                  </span>
                  <span className="text-gray-400 text-xs ml-2">3h</span>
                  <p className="text-gray-300 text-sm mt-1">
                    @Noa... Lets get it started
                  </p>
                </div>
                <span className="text-blue-400 text-xs">Reply</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-white text-sm">
                  Mila Carpenter
                </span>
                <span className="text-gray-400 text-xs ml-2">5h</span>
                <p className="text-gray-300 text-sm mt-1">Love it 💬️</p>
              </div>
              <span className="text-blue-400 text-xs">Reply</span>
            </div>
            <div className="mt-2 pl-4 border-l-2 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-white text-sm">
                    The Star
                  </span>
                  <span className="text-gray-400 text-xs ml-2">5h</span>
                  <p className="text-gray-300 text-sm mt-1">
                    @Mila... You are in!
                  </p>
                </div>
                <span className="text-blue-400 text-xs">Reply</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setTimeout(() => onComplete(), 2000);
        }
      },
      currentStep === 0 ? 1000 : 1500
    );

    return () => clearTimeout(timer);
  }, [currentStep, onComplete, steps.length]);

  return (
    <div className="bg-transparent border border-gray-800 rounded-2xl p-4 shadow-2xl w-full max-w-sm mx-auto font-sans">
      {/* Instagram Post Header */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-gradient-to-r from-[#FFD600] via-[#FF0069] to-[#833AB4] rounded-full flex items-center justify-center">
          <Instagram className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-sm">fitness.star</div>
          <div className="text-xs text-gray-400">Sponsored</div>
        </div>
      </div>

      {/* Animated Steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {steps[currentStep].elements}
        </motion.div>
      </AnimatePresence>

      <div className="text-center mt-3">
        <span className="text-[#00F0FF] text-xs font-medium">
          Auto-reply on every comment 1/2
        </span>
      </div>
    </div>
  );
};

// Instagram DM Flow Component - Frame 009
const InstagramDMFlow = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    // Step 1: Initial messages
    {
      elements: (
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-blue-600 rounded-lg p-3 max-w-[80%]"
          >
            <p className="text-white text-sm">
              <TypingAnimation
                text="Hey Eve! Ready to move your muscles?"
                speed={40}
                className="text-white text-sm"
              />
            </p>
          </motion.div>
        </div>
      ),
    },
    // Step 2: User response
    {
      elements: (
        <div className="space-y-3">
          <div className="bg-blue-600 rounded-lg p-3 max-w-[80%]">
            <p className="text-white text-sm">
              Hey Eve! Ready to move your muscles?
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-700 rounded-lg p-3 max-w-[80%] ml-auto"
          >
            <p className="text-white text-sm">
              <TypingAnimation
                text="Can not wait"
                speed={40}
                className="text-white text-sm"
              />
            </p>
          </motion.div>
        </div>
      ),
    },
    // Step 3: Follow request
    {
      elements: (
        <div className="space-y-3">
          <div className="bg-blue-600 rounded-lg p-3 max-w-[80%]">
            <p className="text-white text-sm">
              Hey Eve! Ready to move your muscles?
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 max-w-[80%] ml-auto">
            <p className="text-white text-sm">Cant wait</p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-blue-600 rounded-lg p-3 max-w-[80%]"
          >
            <p className="text-white text-sm">
              <TypingAnimation
                text="Oops, seems like you don't follow me. Please follow so you can get the video!"
                speed={40}
                className="text-white text-sm"
              />
            </p>
          </motion.div>
        </div>
      ),
    },
    // Step 4: User followed
    {
      elements: (
        <div className="space-y-3">
          <div className="bg-blue-600 rounded-lg p-3 max-w-[80%]">
            <p className="text-white text-sm">
              Hey Eve! Ready to move your muscles?
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 max-w-[80%] ml-auto">
            <p className="text-white text-sm">Cat wait</p>
          </div>
          <div className="bg-blue-600 rounded-lg p-3 max-w-[80%]">
            <p className="text-white text-sm">
              Oops, seems like you dont follow me. Please follow so you can get
              the video!
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-700 rounded-lg p-3 max-w-[80%] ml-auto"
          >
            <p className="text-white text-sm">
              <TypingAnimation
                text="Followed"
                speed={40}
                className="text-white text-sm"
              />
            </p>
          </motion.div>
        </div>
      ),
    },
    // Step 5: Success message
    {
      elements: (
        <div className="space-y-3">
          <div className="bg-blue-600 rounded-lg p-3 max-w-[80%]">
            <p className="text-white text-sm">
              Hey Eve! Ready to move your muscles?
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 max-w-[80%] ml-auto">
            <p className="text-white text-sm">Cant wait</p>
          </div>
          <div className="bg-blue-600 rounded-lg p-3 max-w-[80%]">
            <p className="text-white text-sm">
              Oops, seems like you dont follow me. Please follow so you can get
              the video!
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 max-w-[80%] ml-auto">
            <p className="text-white text-sm">Followed</p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-blue-600 rounded-lg p-3 max-w-[80%]"
          >
            <p className="text-white text-sm">
              <TypingAnimation
                text="Yay! Let's go! Here's your link:"
                speed={40}
                className="text-white text-sm"
              />
            </p>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold py-2 px-4 rounded-full mt-2 flex items-center"
            >
              <ShoppingBag className="h-3 w-3 mr-1" />
              Start the workout
            </motion.button>
          </motion.div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setTimeout(() => onComplete(), 3000);
        }
      },
      currentStep === 0 ? 1000 : 2000
    );

    return () => clearTimeout(timer);
  }, [currentStep, onComplete, steps.length]);

  return (
    <div className="bg-transparent border border-gray-800 rounded-2xl p-4 shadow-2xl w-full max-w-sm mx-auto font-sans">
      {/* DM Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-[#FFD600] via-[#FF0069] to-[#833AB4] rounded-full flex items-center justify-center">
          <Instagram className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-white">fitness.star</div>
          <div className="text-xs text-gray-400">Instagram Direct</div>
        </div>
      </div>

      {/* Animated Steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {steps[currentStep].elements}
        </motion.div>
      </AnimatePresence>

      <div className="text-center mt-3">
        <span className="text-[#00F0FF] text-xs font-medium">
          Convert audience into subscribers 2/2
        </span>
      </div>
    </div>
  );
};

// Demo Carousel Component
const InstagramDemoCarousel = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const demos = [
    {
      component: InstagramPostDemo,
      title: "Auto-Reply to Comments",
      description:
        "Automatically respond to Instagram comments with personalized DMs",
    },
    {
      component: InstagramDMFlow,
      title: "Convert to Subscribers",
      description: "Turn commenters into followers and customers",
    },
  ];

  const handleDemoComplete = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveDemo((prev) => (prev + 1) % demos.length);
      setIsAnimating(false);
    }, 2000);
  };

  const CurrentDemoComponent = demos[activeDemo].component;

  return (
    <div className="relative font-montserrat">
      {/* Demo Indicator */}
      <div className="flex justify-center mb-6 space-x-2">
        {demos.map((_, index) => (
          <button
            key={index}
            onClick={() => !isAnimating && setActiveDemo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeDemo
                ? "bg-[#00F0FF] w-8"
                : "bg-gray-600 hover:bg-gray-400"
            } ${isAnimating ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        ))}
      </div>

      <motion.div
        key={activeDemo}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <CurrentDemoComponent onComplete={handleDemoComplete} />
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] rounded-full opacity-20 blur-xl"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#FF2E9F] to-[#B026FF] rounded-full opacity-20 blur-xl"></div>
    </div>
  );
};

export function InstagramAutomationHero() {
  const FeatureItem = ({
    icon,
    text,
    delay,
  }: {
    icon: React.ReactNode;
    text: string;
    delay: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ x: 5 }}
      className="flex items-center group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-12 h-12 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-2xl flex items-center justify-center mr-4 shadow-lg"
      >
        {icon}
      </motion.div>
      <span className="text-gray-300 group-hover:text-white transition-colors duration-300 font-medium">
        {text}
      </span>
    </motion.div>
  );

  return (
    <section className="w-full bg-transparent text-white pb-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center bg-gradient-to-r from-[#00F0FF]/10 to-[#B026FF]/10 backdrop-blur-sm border border-[#00F0FF]/30 rounded-full px-6 py-3"
              >
                <Zap className="h-5 w-5 text-[#00F0FF] mr-2" />
                <span className="text-sm font-medium uppercase tracking-widest text-[#00F0FF]">
                  INSTAGRAM AUTOMATION
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
              >
                Turn Comments Into
                <br />
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] via-[#B026FF] to-[#FF2E9F]"
                >
                  Paying Customers
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg lg:text-xl text-gray-300 leading-relaxed font-montserrat"
              >
                Automatically reply to Instagram comments with personalized DMs
                that convert followers into subscribers and customers. No coding
                required.
              </motion.p>
            </div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-montserrat"
            >
              {[
                {
                  icon: <MessageCircle className="h-5 w-5" />,
                  text: "Auto-reply to comments",
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  text: "Grow followers automatically",
                },
                {
                  icon: <ShoppingBag className="h-5 w-5" />,
                  text: "Drive sales with DMs",
                },
                {
                  icon: <CheckCircle className="h-5 w-5" />,
                  text: "No coding required",
                },
              ].map((feature, index) => (
                <FeatureItem
                  key={index}
                  icon={feature.icon}
                  text={feature.text}
                  delay={0.7 + index * 0.1}
                />
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] text-black font-bold py-2 px-2 lg:py-3 lg:px-4 rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-[#00F0FF] text-[#00F0FF] font-semibold py-2 px-2 lg:py-3 lg:px-4 rounded-2xl hover:bg-[#00F0FF]/10 transition-all duration-300 flex items-center justify-center"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Demo
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex flex-wrap items-center gap-6 text-sm text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Instagram Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span>5,000+ Creators</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>4.8/5 Rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Instagram Demo Carousel */}
          <InstagramDemoCarousel />
        </div>
      </div>
    </section>
  );
}
