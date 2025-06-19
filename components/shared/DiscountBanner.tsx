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
  const [isVisible, setIsVisible] = useState(true);

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
    <div className="relative  z-10 backdrop-blur-lg  rounded-md mt-5 top-0 left-0 flex flex-col gap-2 justify-center items-center w-full border border-[#333] text-white font-sans py-4 px-4">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 rounded-full bg-[#1a1a1a]/50 border border-[#333] hover:bg-[#1a1a1a] transition-all"
      >
        <XMarkIcon height={20} width={20} className="text-[#FF2E9F]" />
      </button>

      <div className="flex flex-col md:flex-row gap-3 md:gap-6 justify-center items-center w-full">
        <div className="bg-gradient-to-r from-[#B026FF] to-[#FF2E9F] p-2 px-4 rounded-md">
          <div className="text-lg font-bold">Massive Sale</div>
          <div className="text-sm text-center">UP TO 75% OFF</div>
        </div>

        <div className="flex gap-2 md:gap-4">
          <div className="flex flex-col items-center">
            <div className="bg-[#0a0a0a] border border-[#333] text-lg font-bold py-1 px-3 rounded">
              {days}
            </div>
            <div className="text-xs text-gray-400 mt-1">DAYS</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#0a0a0a] border border-[#333] text-lg font-bold py-1 px-3 rounded">
              {hours}
            </div>
            <div className="text-xs text-gray-400 mt-1">HRS</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#0a0a0a] border border-[#333] text-lg font-bold py-1 px-3 rounded">
              {minutes}
            </div>
            <div className="text-xs text-gray-400 mt-1">MIN</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#0a0a0a] border border-[#333] text-lg font-bold py-1 px-3 rounded">
              {seconds}
            </div>
            <div className="text-xs text-gray-400 mt-1">SEC</div>
          </div>
        </div>

        <Link
          href="/credits"
          className="p-2 px-4 text-center bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black text-sm font-bold rounded-md uppercase hover:opacity-90 transition-opacity"
        >
          Purchase Now
        </Link>
      </div>

      <Link
        href={"/credits"}
        className="mt-3 w-full overflow-hidden bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] border border-[#333] rounded-md"
      >
        <div className="flex animate-scroll-left whitespace-nowrap py-2">
          <span className="font-bold">
            Get <span className="text-[#00F0FF]">One Month Free</span> For
            Yearly Subscription
          </span>
          <span className="mx-2">|</span>
          <span>On all AI Products</span>
          <RocketIcon className="ml-2 text-[#B026FF]" />
        </div>
      </Link>
    </div>
  );
};

export default DiscountBanner;
