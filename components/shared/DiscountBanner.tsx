"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RocketIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/solid";

const DiscountBanner = () => {
  const [days, setDays] = useState("00");
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const initialCountdownDate = new Date("2024-07-13T13:00:00").getTime();

  const getNextCountdownDate = useCallback(() => {
    const now = new Date().getTime();
    if (now > initialCountdownDate) {
      const daysSinceInitial = Math.floor(
        (now - initialCountdownDate) / (1000 * 60 * 60 * 24)
      );
      const nextCountdownDate =
        initialCountdownDate +
        (daysSinceInitial + 2 - (daysSinceInitial % 2)) * 24 * 60 * 60 * 1000;
      return nextCountdownDate;
    } else {
      return initialCountdownDate;
    }
  }, [initialCountdownDate]);

  const [countdownDate, setCountdownDate] = useState(getNextCountdownDate);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      if (distance < 0) {
        const newCountdownDate = getNextCountdownDate();
        setCountdownDate(newCountdownDate);
        setIsVisible(true);
      } else {
        setDays(
          Math.floor(distance / (1000 * 60 * 60 * 24))
            .toString()
            .padStart(2, "0")
        );
        setHours(
          Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            .toString()
            .padStart(2, "0")
        );
        setMinutes(
          Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            .toString()
            .padStart(2, "0")
        );
        setSeconds(
          Math.floor((distance % (1000 * 60)) / 1000)
            .toString()
            .padStart(2, "0")
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownDate, getNextCountdownDate]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative z-50 backdrop-blur-lg rounded-xl mt-5 top-0 left-0 flex flex-col gap-3 justify-center items-center w-full border border-[#00F0FF]/30 bg-gradient-to-r from-[#0a0a0a]/90 to-[#1a1a1a]/90 text-white font-sans py-2 md:py-5 px-6 shadow-2xl shadow-[#00F0FF]/10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full opacity-10 blur-xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-[#FF2E9F] to-[#B026FF] rounded-full opacity-10 blur-xl animate-pulse delay-1000"></div>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-[#1a1a1a]/80 border border-[#333] hover:bg-[#FF2E9F]/20 hover:border-[#FF2E9F]/50 transition-all duration-300 group"
      >
        <XMarkIcon
          height={18}
          width={18}
          className="text-[#FF2E9F] group-hover:scale-110 transition-transform"
        />
      </button>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-6 justify-center items-center w-full relative z-10">
        {/* Sale Badge */}
        <div className="relative bg-gradient-to-r from-[#B026FF] to-[#FF2E9F] p-3 px-5 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
          <div className="absolute -top-2 -right-2">
            <SparklesIcon className="h-5 w-5 text-yellow-300 animate-pulse" />
          </div>
          <div className=" text-base md:text-lg font-bold tracking-wide">
            !!! 75% DISCOUNT !!!
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex gap-3 md:gap-4">
          {[
            { value: days, label: "DAYS" },
            { value: hours, label: "HRS" },
            { value: minutes, label: "MIN" },
            { value: seconds, label: "SEC" },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-[#0a0a0a] border border-[#00F0FF]/30 text-xl font-bold p-1 md:py-2 md:px-4 rounded-lg shadow-inner">
                {item.value}
              </div>
              <div className="text-xs text-gray-300 mt-1.5 tracking-wide">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          href="/web/pricing"
          className="relative overflow-hidden group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-lg group-hover:from-[#B026FF] group-hover:to-[#FF2E9F] transition-all duration-500"></div>
          <div className="relative bg-gradient-to-r from-[#00F0FF] to-[#B026FF] group-hover:from-[#B026FF] group-hover:to-[#FF2E9F] text-black font-bold py-3 px-6 rounded-lg transform group-hover:scale-105 transition-all duration-300 uppercase tracking-wide text-sm">
            Purchase Now
          </div>
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-white animate-bounce" />
            </div>
          )}
        </Link>
      </div>

      {/* Scrolling Banner */}
      <Link
        href={"/insta/pricing"}
        className="md:mt-3 w-full overflow-hidden bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] border border-[#00F0FF]/20 rounded-lg relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF]/10 to-transparent group-hover:via-[#B026FF]/20 transition-all duration-1000"></div>
        <div className="flex animate-scroll-left whitespace-nowrap py-1 md:py-3 relative z-10">
          <span className="font-semibold">
            🚀 Get{" "}
            <span className="text-[#00F0FF] font-bold">One Month Free</span> For
            Yearly Subscription
          </span>
          <span className="mx-3 text-[#B026FF]">•</span>
          <span>On all AI Products</span>
          <span className="mx-3 text-[#B026FF]">•</span>
          <RocketIcon className="ml-2 text-[#B026FF] animate-bounce" />
          <span className="mx-3 text-[#B026FF]">•</span>
          <span>Limited Time Offer</span>
        </div>
      </Link>

      {/* Decorative Dots */}
      <div className="absolute -bottom-2 left-4 flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 bg-[#00F0FF] rounded-full opacity-60"
          ></div>
        ))}
      </div>
      <div className="absolute -top-2 right-4 flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 bg-[#FF2E9F] rounded-full opacity-60"
          ></div>
        ))}
      </div>
    </div>
  );
};

export default DiscountBanner;
