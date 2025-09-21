"use client";

import { useState, useEffect } from "react";
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
    }, 7000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className=" text-white px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto py-10">
        {/* Carousel Content */}
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-12 items-center">
      {/* Left Column - Text Content */}
      <div className=" space-y-4 md:space-y-8">
        <div className="inline-flex items-center text-blue-400 border border-blue-400/30 rounded-full px-4 py-1 mb-4">
          <Zap className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">
            Meta-Approved Instagram Automation
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold leading-tight">
          Reply to Instagram
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
            Comments Automatically
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl font-montserrat">
          #1 Auto-Reply Platform for Creators and Brands. Never miss a customer
          comment again.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-col md:flex-row items-start md:items-center  mb-8">
          <div className="flex items-center space-x-2">
            <BadgeCheck className="h-5 w-5 text-[#00F0FF]" />
            <span className="text-sm text-gray-300">Meta Business Partner</span>
          </div>
          <div className=" flex items-center space-x-2 ">
            <BadgeCheck className="h-5 w-5 text-[#00F0FF]" />
            <span className="text-sm text-gray-300">
              300+ creators, brands and agencies!
            </span>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-1 md:space-y-3 mb-4 md:mb-8">
          {[
            "Instant automated replies to comments",
            "Customizable response templates",
            "Advanced spam detection",
            "Multi-account support",
            "Real-time analytics dashboard",
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center">
              <Check className="h-5 w-5 text-[#FF2E9F] mr-3" />
              <span className="text-gray-300 font-montserrat">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row  lg:flex-col xl:flex-row gap-4">
          <Button
            onClick={() => router.push("/insta/dashboard")}
            className="bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] text-black text-lg py-6 px-8 hover:opacity-90 transition-opacity"
          >
            Start Automating - It&apos;s Free!
          </Button>
          <Button
            onClick={() => router.push("/insta/pricing")}
            variant="outline"
            className="border-gray-600 text-gray-300 text-lg py-6 px-8 hover:bg-gray-800"
          >
            Watch Demo
          </Button>
        </div>

        <p className="text-sm text-gray-400 font-montserrat">
          No credit card required • 7-day free trial • Cancel anytime
        </p>
      </div>

      <div className="relative  m-auto w-full h-[50vh] lg:h-[90%] xl:h-[100%]">
        <Image
          src={Rimg2}
          alt="Curtain Collection"
          fill
          sizes="100%"
          className=" object-contain"
          loading="lazy"
        />
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] rounded-full opacity-20 blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#FF2E9F] to-[#B026FF] rounded-full opacity-20 blur-xl"></div>
      </div>
    </div>
  );
}

// Web Chatbot Section Component
function WebChatbotSection() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-12 items-center">
      {/* Left Column - Text Content */}
      <div className="space-y-4 md:space-y-8">
        <div className="inline-flex items-center text-blue-400 border border-blue-400/30 rounded-full px-4 py-1 mb-4">
          <Bot className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">AI-Powered Web Chatbot</span>
        </div>

        <h1 className="text-3xl md:text-4xl  font-bold leading-tight">
          Engage Website Visitors
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
            With Smart Chatbots
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl font-montserrat">
          AI-powered chatbots that understand customer queries and provide
          instant responses 24/7.
        </p>

        {/* Trust Badges */}

        <div className="flex items-center space-x-8 mb-8">
          <div className="flex items-center space-x-2">
            <BadgeCheck className="h-5 w-5 text-[#00F0FF]" />
            <span className="text-sm text-gray-300">AI-Powered Responses</span>
          </div>
          <div className=" flex items-center justify-center  gap-1 text-sm text-gray-400">
            <BadgeCheck className="h-5 w-5 text-[#00F0FF]" />
            <p> Used by 150+ businesses worldwide!</p>{" "}
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-1 md:space-y-3 mb-4 md:mb-8">
          {[
            "24/7 customer support automation",
            "AI-powered natural conversations",
            "Easy integration with your website",
            "Lead generation and qualification",
            "Multi-language support",
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center">
              <Check className="h-5 w-5 text-[#FF2E9F] mr-3" />
              <span className="text-gray-300 font-montserrat">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row  lg:flex-col xl:flex-row gap-4">
          <Button
            onClick={() => router.push("/web/UserDashboard")}
            className="bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] text-black text-lg py-6 px-8 hover:opacity-90 transition-opacity"
          >
            Start Automating - It&apos;s Free!
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/web/pricing")}
            className="border-gray-600  text-gray-300 text-lg py-6 px-8 hover:bg-gray-800"
          >
            Watch Demo
          </Button>
        </div>

        <p className="text-sm text-gray-400 font-montserrat">
          No coding required • 14-day free trial • Setup in minutes
        </p>
      </div>

      {/* Right Column - Chatbot Visual */}
      <div className="relative  m-auto w-full h-[50vh]  lg:h-[90%] xl:h-[100%]">
        {/* Chatbot Interface */}
        <Image
          src={Rimg1}
          alt="Curtain Collection"
          fill
          sizes="100%"
          className=" object-contain"
          loading="lazy"
        />

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] rounded-full opacity-20 blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#FF2E9F] to-[#B026FF] rounded-full opacity-20 blur-xl"></div>
      </div>
    </div>
  );
}
