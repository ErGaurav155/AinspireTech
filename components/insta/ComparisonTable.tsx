// components/ComparisonTable.tsx

import { features } from "@/constant";
import Image from "next/image";
import React from "react";
import cup from "@/public/assets/img/pricecup.png";
const Check = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
);

const ComparisonTable: React.FC = () => {
  const renderFeatureValue = (
    value: string | boolean | React.ReactNode,
    tool: string
  ) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check
          className={`h-5 w-5 mx-auto ${
            tool === "comment2DM"
              ? "text-[#00F0FF]"
              : tool === "autoDM"
              ? "text-[#B026FF]"
              : tool === "linkplease"
              ? "text-[#FF2E9F]"
              : tool === "rapiddm"
              ? "text-[#00F0FF]"
              : tool === "zorcha"
              ? "text-[#B026FF]"
              : "text-[#FF2E9F]"
          }`}
        />
      ) : (
        <span className="text-gray-500">—</span>
      );
    }

    if (value === "Coming soon") {
      return (
        <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded-md text-xs">
          {value}
        </span>
      );
    }

    return <span className="text-gray-300">{value}</span>;
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        {/* <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            The Best Indian Automation Tool
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Same features just for 99 INR, switch now
          </p>

          <div className="flex flex-col items-center justify-center space-y-4 mb-8">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center mr-3">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <span className="text-lg font-medium text-white">
                Cheap & Best
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center mr-3">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <span className="text-lg font-medium text-white">
                99INR ($1.1) Per month
              </span>
            </div>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition-colors duration-300">
            Signup for free
          </button>
        </div> */}

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-[#333]">
                <th className="text-left py-4 px-6 font-semibold text-white">
                  Features
                </th>
                <th className="relative text-center py-4 px-6 font-semibold text-[#00F0FF] bg-gradient-to-r from-[#0ce05d]/80 to-[#054e29]">
                  AinspireTech
                  <Image
                    src={cup}
                    alt="pricing cup"
                    width={120}
                    height={120}
                    className="absolute -right-10 top-5 rotate-6 rounded-full "
                  />
                </th>
                <th className="text-center py-4 px-6 font-semibold text-[#B026FF]">
                  AutoDM
                </th>
                <th className="text-center py-4 px-6 font-semibold text-[#FF2E9F]">
                  Linkplease
                </th>
                <th className="text-center py-4 px-6 font-semibold text-[#00F0FF]">
                  Rapiddm
                </th>
                <th className="text-center py-4 px-6 font-semibold text-[#B026FF]">
                  Zorcha
                </th>
                <th className="text-center py-4 px-6 font-semibold text-[#FF2E9F]">
                  InstantDM
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {features.map((feature, index) => (
                <tr key={index} className="hover:bg-[#1a1a1a]/50">
                  <td className="py-4 px-6 font-medium text-gray-300 font-montserrat">
                    {feature.name}
                  </td>
                  <td className="py-4 px-6 text-center bg-gradient-to-r from-[#0ce05d]/80 to-[#054e29] font-montserrat">
                    {renderFeatureValue(feature.comment2DM, "comment2DM")}
                  </td>
                  <td className="py-4 px-6 text-center font-montserrat">
                    {renderFeatureValue(feature.autoDM, "autoDM")}
                  </td>
                  <td className="py-4 px-6 text-center font-montserrat">
                    {renderFeatureValue(feature.linkplease, "linkplease")}
                  </td>
                  <td className="py-4 px-6 text-center font-montserrat">
                    {renderFeatureValue(feature.rapiddm, "rapiddm")}
                  </td>
                  <td className="py-4 px-6 text-center font-montserrat">
                    {renderFeatureValue(feature.zorcha, "zorcha")}
                  </td>
                  <td className="py-4 px-6 text-center font-montserrat">
                    {renderFeatureValue(feature.instantDM, "instantDM")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
