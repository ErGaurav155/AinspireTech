import {
  ChartBarIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import React from "react";

const Features = () => {
  const features = [
    {
      icon: <ChartBarIcon className="size-10" />,
      title: "Research & Planning",
      description: "Strategic analysis and roadmap development",
    },
    {
      icon: <CodeBracketIcon className="size-10" />,
      title: "Design & Development",
      description: "Creative solutions with cutting-edge technology",
    },
    {
      icon: <RocketLaunchIcon className="size-10" />,
      title: "Launch & Optimize",
      description: "Seamless deployment and continuous improvement",
    },
  ];

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Section Title */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
          We Are Always Ready to Help You & Your Business
        </h2>
        <div className="flex justify-center my-6">
          <div className="w-20 h-1 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full"></div>
        </div>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Advanced Cutting edge tech For You
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="text-center relative p-6 bg-[#0a0a0a] backdrop-blur-sm border border-[#00F0FF]/30 rounded-xl hover:border-[#B026FF] transition-all duration-300 group"
          >
            {/* Icon Container */}
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#00F0FF]/20 to-[#B026FF]/20 border border-[#00F0FF]/30 group-hover:from-[#B026FF]/30 group-hover:to-[#FF2E9F]/30 transition-all">
              <div className="flex items-center justify-center w-16 h-16 rounded-full text-[#FF2E9F] bg-[#0a0a0a]">
                {feature.icon}
              </div>
            </div>

            <h3 className="text-xl font-bold mt-2 text-white">
              {feature.title}
            </h3>
            <p className="text-gray-300 mt-2">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
