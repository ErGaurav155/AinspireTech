"use client";

import { useRouter } from "next/navigation";

import { Button } from "@material-tailwind/react";

const Service = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <h1 className="text-xl sm:text-3xl md:text-4xl  lg:text-6xl font-bold text-white leading-tight">
        Our Services
      </h1>
      <div className="flex flex-row flex-wrap  gap-4 items-center justify-center w-full h-full text-white">
        <div className="flex flex-col gap-4 flex-auto w-full md:w-1/3 lg:w-1/4 bg-gray-100  bg-opacity-90  rounded-md p-5">
          <h1 className="p-2  text-xl font-normal   text-black  bg-opacity-20">
            CHATBOT DEVELOPMENT
          </h1>
          <div className="flex flex-wrap  items-center justify-center h-auto rounded bg-gray-600 bg-opacity-50 p-5 gap-2">
            <Button
              size="md"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
               w-full  flex-auto bg-gray-200 text-black bg-opacity-30 text-xs font-normal md:text-sm md:font-semibold  text-center overflow-hidden px-1"
            >
              <span>GPT Development</span>
            </Button>
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
            w-full flex-auto  bg-gray-200 text-black   bg-opacity-30 text-xs font-normal md:text-sm md:font-bold   text-center overflow-hidden px-1"
            >
              <span>Secure Solutions</span>
            </Button>
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
              w-full flex-auto  bg-gray-200 text-black   bg-opacity-30 text-xs font-normal md:text-sm md:font-bold   text-center overflow-hidden px-1"
            >
              <span>Knowledge Response</span>
            </Button>
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
              w-full flex-auto  bg-gray-200 text-black   bg-opacity-30 text-xs font-normal md:text-sm md:font-bold   text-center overflow-hidden px-1"
            >
              <span>ML Model Tuning</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4 flex-auto w-full md:w-1/3 lg:w-1/4 bg-[#88e2bb]  bg-opacity-50  rounded-md p-5">
          <h1 className="p-2  text-xl font-normal   text-black  bg-opacity-20">
            AI AGENT DEVELOPMENT
          </h1>
          <div className="flex flex-wrap  items-center justify-center h-auto rounded bg-[#99d6bc] bg-opacity-50 p-5 gap-2">
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
              w-full flex-auto bg-[#caebdd] text-black  bg-opacity-50  text-xs font-normal md:text-sm md:font-bold   text-center overflow-hidden px-1"
            >
              <span>Workflow Automation</span>
            </Button>
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
               w-full flex-auto bg-[#caebdd] text-black   bg-opacity-50 text-xs font-normal md:text-sm md:font-bold   text-center overflow-hidden px-1"
            >
              <span>Natural Language to SQL</span>
            </Button>
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
               w-full flex-auto bg-[#caebdd] text-black   bg-opacity-50 text-xs font-normal md:text-sm md:font-bold  text-center overflow-hidden px-1"
            >
              <span>Complex Data Pipelines</span>
            </Button>
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
              w-full flex-auto bg-[#caebdd] text-black   bg-opacity-50 text-xs font-normal md:text-sm md:font-bold  text-center overflow-hidden px-1"
            >
              <span>Self-Adaptive Decision Systems</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4 flex-auto w-full md:w-1/3 lg:w-1/4 bg-gray-100 bg-opacity-90 rounded-md p-5">
          <h1 className="p-2  text-xl font-normal   text-black  bg-opacity-20">
            WEBSITE DEVELOPMENT
          </h1>
          <div className="flex flex-wrap  items-center justify-center h-auto rounded bg-gray-600 bg-opacity-30 p-5 gap-2">
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
               w-full flex-auto  bg-gray-200 text-black   bg-opacity-30 text-xs font-normal md:text-sm md:font-bold   text-center overflow-hidden px-1"
            >
              <span>Ui/Ux Userfriendly</span>
            </Button>
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
              w-full flex-auto  bg-gray-200 text-black   bg-opacity-30 text-xs font-normal md:text-sm md:font-bold   text-center overflow-hidden px-1"
            >
              <span>Media Responsive</span>
            </Button>
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
              w-full flex-auto  bg-gray-200 text-black   bg-opacity-30 text-xs font-normal md:text-sm md:font-bold    text-center overflow-hidden px-1"
            >
              <span>SEO Optimisation</span>
            </Button>
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/OurService")}
              className="
             w-full flex-auto  bg-gray-200 text-black   bg-opacity-30 text-xs font-normal md:text-sm md:font-bold   text-center overflow-hidden px-1"
            >
              <span>Online Marketing</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;
