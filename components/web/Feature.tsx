"use client";

import {
  MessageCircle,
  Play,
  AtSign,
  Heart,
  Users,
  Clock,
  ShoppingBag,
  Instagram,
} from "lucide-react";
import Image from "next/image";
import featureImg from "@/public/assets/img/featureImg.png";
import featureImg2 from "@/public/assets/img/featureImg2.png";

export function FeatureSection() {
  const features = [
    {
      icon: <Play className="h-6 w-6" />,
      title: "Auto-Reply to Instagram Reel Comments",
      url: featureImg,
      description:
        "Reply to Instagram reel comments automatically with a DM sent straight to the users inbox. Add trigger keywords or respond to all comments.",
      post: {
        username: "myveganishindustries",
        hours: "2,091 hours",
        followers: "190k followers",
        following: "1,906 following",
        caption: "GILL takes us to meet my profile\nView my Shop",
        brand: "Abercrombie",
      },
    },
    {
      icon: <Instagram className="h-6 w-6" />,
      title: "Auto-Reply to Instagram Post Comments",
      url: featureImg2,

      description:
        "Reply to Instagram post comments automatically with a DM sent straight to the users inbox.",
      post: {
        username: "fashionblogger",
        hours: "1,542 hours",
        followers: "245k followers",
        following: "892 following",
        caption: "Spring collection is live!\nShop the look",
        brand: "REDENT & FAVOURITE",
      },
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Auto-Respond to Instagram Story Replies",
      url: featureImg,

      description:
        "Automatically respond to story replies with a DM sent directly to the users inbox. Add trigger keywords or respond to all comments.",
      post: {
        username: "travelwanderer",
        hours: "3,128 hours",
        followers: "178k followers",
        following: "1,245 following",
        caption: "Loved my stay here! Thanks @brandonne!\nBook your stay",
        brand: "Travel & Leisure",
      },
    },
    {
      icon: <AtSign className="h-6 w-6" />,
      title: "Auto-Reply to Instagram Story Mentions",
      url: featureImg2,

      description:
        "Automatically respond to story @mentions with a message sent directly to the users inbox.",
      post: {
        username: "fitnessjourney",
        hours: "956 hours",
        followers: "132k followers",
        following: "567 following",
        caption: "Check out my workout routine!\nGet the program",
        brand: "Fitness Pro",
      },
    },
  ];

  return (
    <section className="w-full  bg-transparent text-white">
      <div className=" mx-auto ">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center text-[#00F0FF] border border-[#00F0FF]/30 rounded-full px-4 py-1 mb-4">
            <span className="text-sm font-medium uppercase tracking-widest">
              FEATURE FOCUS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Feature Breakdown
          </h2>
          <p className="text-lg p-2 text-gray-300 max-w-3xl mx-auto font-montserrat">
            Dive into the specifics of each feature, understanding its
            functionality and how it can elevate your Instagram strategy.
          </p>
        </div>

        {/* Features Grid */}
        <div className="flex flex-col-reverse gap-2 sm:gap-8 md:gap-12 max-w-7xl mx-auto items-center justify-center h-full">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex  ${
                index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
              } flex-col items-center justify-center`}
            >
              {/* Instagram Post Visual */}
              <div className="relative  m-auto w-full h-[50vh]  ">
                {/* Profile Header */}
                <Image
                  src={feature.url}
                  alt="Curtain Collection"
                  fill
                  sizes="100%"
                  className=" object-contain"
                  loading="lazy"
                />
              </div>

              {/* Feature Description */}
              <div className="container h-[50vh] flex flex-col items-start justify-center">
                {/* Icon */}
                <div className="flex  w-full flex-row items-center justify-between gap-5">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-xl flex items-center justify-center mb-6">
                    <div className="text-white p-3">{feature.icon}</div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-4 text-white">
                    {feature.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed mb-6 font-montserrat">
                  {feature.description}
                </p>

                {/* Divider */}
                <div className="w-20 h-1 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full mb-6"></div>

                {/* CTA Button */}
                <button className="inline-flex items-center text-[#00F0FF] hover:text-[#B026FF] transition-colors duration-300">
                  <span className="text-sm font-medium">Learn More</span>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
