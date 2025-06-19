"use client";

import { useState, useEffect, useRef } from "react";
import { CalculatorIcon, FaceSmileIcon } from "@heroicons/react/24/solid";
import { BotIcon, Users2Icon } from "lucide-react";

const AnimatedCounter = ({
  target,
  isVisible,
}: {
  target: number;
  isVisible: boolean;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const increment = target / (duration / 10);

    const interval = setInterval(() => {
      setCount((prev) => {
        const nextValue = prev + increment;
        if (nextValue >= target) {
          clearInterval(interval);
          return target;
        }
        return nextValue;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [isVisible, target]);

  return (
    <span className="counter text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] font-bold text-4xl">
      {Math.floor(count)}+
    </span>
  );
};

const FunFacts = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentRef = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const facts = [
    {
      icon: <BotIcon className="h-10 w-10" />,
      target: 720,
      label: "Build Website + Chatbot",
    },
    {
      icon: <Users2Icon className="h-10 w-10" />,
      target: 10,
      label: "Specialist Team Member",
    },
    {
      icon: <FaceSmileIcon className="h-10 w-10" />,
      target: 705,
      label: "Happy Customer",
    },
    {
      icon: <CalculatorIcon className="h-10 w-10" />,
      target: 10,
      label: "Years of Experience",
    },
  ];

  return (
    <div ref={sectionRef} className="w-full relative  z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {facts.map((fact, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center text-center bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#00F0FF]/20 rounded-xl p-6 hover:border-[#B026FF] transition-all duration-300 hover:shadow-[0_0_15px_5px_rgba(176,38,255,0.3)]"
            >
              <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-[#00F0FF]/10 to-[#B026FF]/10 border border-[#00F0FF]/20 mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full text-[#B026FF] bg-[#0a0a0a]">
                  {fact.icon}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <AnimatedCounter target={fact.target} isVisible={isVisible} />
                <p className="text-gray-300 text-base mt-2">{fact.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FunFacts;
