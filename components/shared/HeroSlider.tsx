"use client";

import React from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { OurClient, OurClient2 } from "./corousel";
import { useRouter } from "next/navigation";

export const HeroSlider = () => {
  const router = useRouter();
  return (
    <section className="flex flex-col md:flex-row items-center justify-center gap-8 w-full py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="flex flex-col gap-5 items-center md:items-start justify-center w-full md:w-1/2">
        <div className="flex items-center justify-center gap-3 p-2 rounded-full bg-gradient-to-r from-[#00F0FF]/10 to-[#B026FF]/10 border border-[#00F0FF]/20 text-[#00F0FF] ">
          <StarIcon className="size-5" />
          <span>N°1 in AI SOLUTIONS</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-center md:text-left">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
            Smart Ai Solutions,
          </span>
          <br />
          <span className="text-white">Smarter Businesses.</span>
        </h1>

        <span className="text-gray-300 max-w-md text-center md:text-left">
          No delays, no surprises, no hidden fees. Cancel anytime.
        </span>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-2">
          <button
            className="px-6 py-3 text-center font-medium transition-all bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black rounded-full hover:opacity-90 shadow-lg shadow-[#00F0FF]/30"
            onClick={() => router.push("/web/product")}
          >
            Our Products
          </button>
          <button
            className="px-6 py-3 text-center font-medium transition-all bg-gradient-to-r from-[#B026FF] to-[#FF2E9F] text-black rounded-full hover:opacity-90 shadow-lg shadow-[#B026FF]/30"
            onClick={() => router.push("/OurService")}
          >
            Our Services
          </button>
        </div>

        <p className="text-gray-300 mt-4">Trusted by 1000+ Users</p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-2">
          <span className="text-gray-300">4.6 out of 5</span>
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] rounded-sm opacity-80"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6 text-white relative z-10"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2   relative">
        <div className="relative  z-10">
          <OurClient />
          <OurClient2 />
        </div>
      </div>
    </section>
  );
};
