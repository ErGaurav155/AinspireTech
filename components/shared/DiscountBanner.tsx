"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RocketIcon } from "lucide-react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/solid";

const DiscountBanner = () => {
  const [days, setDays] = useState("00");
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  //   const [isVisible, setIsVisible] = useState(true);

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
        // setIsVisible(true);
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

  return (
    <div className="relative  z-10 backdrop-blur-lg rounded-md mt-1 lg:mt-5 top-0 left-0 flex flex-col lg:flex-row gap-2 justify-center items-center w-full  text-white font-sans p-2 lg:p-3  border border-[#00F0FF]/30 shadow-[0_0_10px_5px_rgba(0,240,255,0.2)]">
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-col sm:flex-row gap-1 md:gap-2 justify-center items-center w-full text-white">
          <div className="flex flex-col sm:flex-row items-center  p-2 rounded-md border border-[#00F0FF]/30">
            <div className="text-md lg:text-lg font-bold text-nowrap">
              Massive Sale
            </div>
            <div className="text-md lg:text-base text-nowrap">
              up to 50% off
            </div>
          </div>
          <div className="flex gap-2 md:gap-4">
            {[
              { value: days, label: "Days" },
              { value: hours, label: "Hrs" },
              { value: minutes, label: "Min" },
              { value: seconds, label: "Sec" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#00F0FF]/30 text-white text-lg font-bold px-2 py-1 rounded-md">
                  {item.value}
                </div>
                <div className="text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        <Link
          href="/pricing"
          className="p-2 ml-2 text-center bg-gradient-to-r text-nowrap from-[#00F0FF] to-[#B026FF] text-black text-sm font-semibold md:font-bold rounded-md uppercase hover:opacity-90 transition-opacity shadow-md shadow-[#00F0FF]/40"
        >
          Purchase Now
        </Link>
      </div>
      <div className="bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#00F0FF]/30 rounded-md w-full max-h-min self-center overflow-hidden">
        <Link
          href={"/pricing"}
          className="flex animate-scroll-left whitespace-nowrap p-2"
        >
          <span className="font-bold">
            Get <span className="text-[#00F0FF]">One Month Free</span> For
            Yearly Subscription
          </span>
          <span className="mx-2">|</span>
          <span>On all AI Products</span>
          <RocketIcon className="ml-2 text-[#B026FF]" />
        </Link>
      </div>
    </div>
  );
};

export default DiscountBanner;
