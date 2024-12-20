import {
  ChartBarIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import React from "react";

const Features = () => {
  return (
    <div className="container mx-auto">
      {/* Section Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          We Are Always Ready to Help You & Your Business
        </h2>
        <Image
          src="/assets/img/section-img.png"
          alt="Section decoration"
          className="mx-auto my-4"
          width={50}
          height={50}
        />
        <p className=" text-white">Advanced Cutting edge tech For You.</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2  md:gap-8">
        {/* Feature 1 */}
        <div className="text-center relative p-5">
          <div className="relative">
            <div className="flex items-center justify-center w-15 h-15 md:w-24 md:h-24 mx-auto border rounded-full border-none shadow-sm shadow-[#55edab] hover:text-[#55edab] text-white  transition-all">
              <ChartBarIcon className=" size-10 md:size-15 " />
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-5 md:mt-10 text-white">
            Research & Planning
          </h3>
          <div className="hidden md:block absolute border-b-2 border-dotted border-[#55edab] w-20 lg:w-28 top-20 right-[-4rem]"></div>
        </div>

        {/* Feature 2 */}
        <div className="text-center relative p-5">
          <div className="relative">
            <div className="flex items-center justify-center w-15 h-15 md:w-24 md:h-24 mx-auto border rounded-full border-none shadow-sm shadow-[#55edab] hover:text-[#55edab] text-white  transition-all">
              <CodeBracketIcon className="size-10 md:size-15" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-5 md:mt-10 text-white">
            Design & Development
          </h3>

          <div className="hidden md:block absolute border-b-2 border-dotted border-[#55edab] w-20 lg:w-28 top-20 right-[-4rem]"></div>
        </div>

        {/* Feature 3 */}
        <div className="text-center relative p-5">
          <div className="relative">
            <div className="flex items-center justify-center w-15 h-15 md:w-24 md:h-24 mx-auto border rounded-full border-none shadow-sm shadow-[#55edab] hover:text-[#55edab] text-white  transition-all">
              <RocketLaunchIcon className="size-10 md:size-15" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-5 md:mt-10 text-white">
            Launch & Optimize
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Features;
