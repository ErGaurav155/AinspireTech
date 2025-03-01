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

  //   const handleClose = () => {
  //     setIsVisible(false);
  //   };

  //   if (!isVisible) {
  //     return null;
  //   }

  return (
    <div className="relative rounded-md mt-1 lg:mt-5 top-0 left-0 flex flex-col lg:flex-row  gap-2 justify-center items-center w-full bg-gradient-to-r from-green-800 to-green-500 text-white font-sans p-2 lg:p-3">
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-col sm:flex-row gap-1 md:gap-2 justify-center items-center w-full text-white font-sans">
          <div className="flex flex-col sm:flex-row  xl:flex-col items-center bg-yellow-900 p-2 rounded-md">
            <div className="text-md lg:text-lg font-bold text-nowrap">
              Massive Sale
            </div>
            <div className="text-md lg:text-base text-nowrap">
              {" "}
              up to 50% off
            </div>
          </div>
          <div className="flex gap-2 md:gap-4">
            <div className="flex flex-col items-center">
              <div className="bg-white text-black text-lg font-bold  px-2 rounded">
                {days}
              </div>
              <div className="text-sm">Days</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white text-black text-lg font-bold  px-2 rounded">
                {hours}
              </div>
              <div className="text-sm">Hrs</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white text-black text-lg font-bold  px-2 rounded">
                {minutes}
              </div>
              <div className="text-sm">Min</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white text-black text-lg font-bold  px-2 rounded">
                {seconds}
              </div>
              <div className="text-sm">Sec</div>
            </div>
          </div>
        </div>
        <a
          href="/pricing"
          className="p-2 text-center bg-gradient-to-r text-nowrap from-teal-300 to-blue-300 text-black text-sm font-semibold md:font-bold rounded uppercase hover:scale-105 transition-transform"
        >
          Purchase Now
        </a>
      </div>
      <Button className="text-black bg-white hover:bg-white rounded-md  w-full cursor-default max-h-min self-center overflow-hidden">
        <Link
          href={"/pricing"}
          className="flex animate-scroll-left whitespace-nowrap"
        >
          Get
          <span className="text-green-800 font-extrabold">
            &nbsp;One Month &nbsp;
          </span>
          Free For Yearly Subcription On all Products &nbsp;
          <RocketIcon color="green" />
        </Link>
      </Button>
      {/* <button
        onClick={handleClose}
        className="absolute lg:static top-1 right-2 p-1 self-center rounded-full bg-white bg-opacity-10 hover:bg-opacity-30 transition-all"
      >
        <XMarkIcon height={30} width={30} stroke="2" />
      </button> */}
    </div>
  );
};

export default DiscountBanner;
