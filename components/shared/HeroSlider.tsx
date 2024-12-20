import React from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { OurClient, OurClient2 } from "./corousel";

export const HeroSlider = () => {
  return (
    <section className=" flex flex-col md:flex-row items-center justify-center gap-2   w-full">
      <div className="flex flex-col gap-3 items-center md:items-start justify-center w-full md:w-1/2">
        <div className="flex items-center justify-center gap-3 p-2 shadow-inner   rounded-3xl text- text-[#55edab] bg-[#55edab]  bg-opacity-20">
          <StarIcon color="#55edab" className="size-5" />

          <span>N°1 in AI SOLUTIONS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl  lg:text-6xl font-bold text-[#55edab]  leading-tight">
          Smart Ai Solutions, <br />
          <span className=" text-white">Smarter Businesses.</span>
        </h1>

        <span className="text-white">
          No delays, no surprises, no hidden fees. Cancel anytime.
        </span>
        <div className="flex gap-2 items-center justify-center">
          <div className="p-1 border border-opacity-10 border-[#55edab] shadow-inner shadow-[#38bd83]   rounded-full">
            <div className="p-2 border border-opacity-10 border-[#55edab] shadow-inner shadow-[#38bd83]  rounded-full">
              <button className="p-1   md:py-2 md:px-6   text-center font-medium transition bg-[#55edab] text-black rounded-full ring-2   ring-[#55edab] hover:ring-[#38bd83]    shadow-lg shadow-[#38bd83]-500/50 ">
                Lets Talk
              </button>
            </div>
          </div>
          <div className="p-1 border border-opacity-10 border-[#55edab] shadow shadow-[#38bd83]   rounded-full">
            <div className="p-1 border border-opacity-10 border-[#55edab] shadow shadow-[#38bd83]  rounded-full">
              <button className="p-1   md:py-2 md:px-6   text-center font-medium transition bg-[#55edab] text-black rounded-full ring-2   ring-[#55edab] hover:ring-[#38bd83]    shadow shadow-[#38bd83]-500/50 ">
                Our Services
              </button>
            </div>
          </div>
        </div>
        <p className="text-white">Trusted by 1000+ Users</p>
        <div className=" flex flex-col md:flex-row items-center justify-center gap-2 text-white">
          <span>4.6 out of 5</span>
          <div className="flex items-center justify-center gap-1">
            <div className="bg-[#55edab] ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6 text-white"
                stroke="black"
                strokeWidth="0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="bg-[#55edab] ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6 text-white"
                stroke="black"
                strokeWidth="0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="bg-[#55edab] ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6  text-white"
                stroke="black"
                strokeWidth="0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="bg-[#55edab] ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6 text-white"
                stroke="black"
                strokeWidth="0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="relative w-full ">
              <div className="relative z-5 flex items-center justify-center h-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="black"
                  strokeWidth="0.5"
                  className="w-6 h-6 text-white "
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="absolute inset-0 w-1/2 h-full bg-[#55edab]"></div>

              <div className="absolute inset-0 left-1/2 w-1/2 h-full bg-gray-500"></div>
            </div>
          </div>
          <div className="flex items-center justify-center pl-3 gap-1 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              strokeWidth="2"
              className="w-8 h-8 text-[#55edab]  "
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
            Trustpilot
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2  relative">
        <div className="absolute top-0 left-0 w-full h-full shadow-left-right-blur  rounded-md z-10"></div>

        <OurClient />
        <OurClient2 />
      </div>
    </section>
  );
};
