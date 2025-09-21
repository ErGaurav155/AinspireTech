"use client";

import { useState } from "react";
import {
  Instagram,
  Users,
  Building2,
  Tag,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export function ClientShowcase() {
  const [activeTab, setActiveTab] = useState("creators");
  const creators = [
    "@madeline_devaux",
    "@snipestwins",
    "@im_lola__",
    "@getschooledinfashion",
    "@beautyxdanaplum",
    "@mytexashouse",
    "@rachaelsgoodeats",
    "@the_pastaqueen",
    "@linenoaksinteriors",
    "@eatingbirdfood",
    "@sammymontgoms",
    "@msgoldgirl",
    "@maciejade",
    "@the_broadmoor_house",
    "@justglow011",
    "@danielle.donohue",
    "@interiordesignerella",
    "@nicoles_outfit_inspirations",
    "@palmettoporchathome",
    "@everyday.holly",
    "@laurajaneillustrations",
    "@yvetteg23",
  ];
  const brands = [
    "@nbcselect",
    "@homebeautiful",
    "@elleaus",
    "@enews",
    "@kinedu",
    "@shop.ltk",
    "@fandango",
    "@dillards",
    "@recetasnestlecl",
    "@dkbooksus",
    "@patpat_clothing",
    "@solidstarts",
    "@randomhouse",
    "@bondisands",
    "@bhgaus",
  ];

  const niches = [
    { name: "Mavely Creators", count: "2.5K+" },
    { name: "Fashion Creators", count: "1.8K+" },
    { name: "Amazon Creators", count: "3.2K+" },
    { name: "LTK Creators", count: "2.1K+" },
    { name: "Food Creators", count: "1.5K+" },
    { name: "Beauty Creators", count: "2.3K+" },
    { name: "Travel Creators", count: "1.2K+" },
    { name: "DIY Home Creators", count: "1.7K+" },
    { name: "Designers", count: "900+" },
    { name: "Musicians", count: "600+" },
    { name: "Podcasters", count: "500+" },
    { name: "Photography", count: "1.1K+" },
    { name: "Health & Fitness Creators", count: "2.0K+" },
    { name: "Realtors", count: "800+" },
    { name: "Education Creators", count: "700+" },
    { name: "Non-Profit Organisations", count: "400+" },
  ];

  const pattern = [2, 3, 4, 5, 4, 3, 2];

  // Function to create rows with pattern
  const createRows = (items: any[]) => {
    const rows = [];
    let currentIndex = 0;
    let patternIndex = 0;

    while (currentIndex < items.length) {
      const columnCount = pattern[patternIndex % pattern.length];
      const rowItems = items.slice(currentIndex, currentIndex + columnCount);

      rows.push({
        columnCount,
        items: rowItems,
      });

      currentIndex += columnCount;
      patternIndex++;
    }

    return rows;
  };

  const creatorRows = createRows(creators);
  const brandRows = createRows(brands);
  const nicheRows = createRows(niches);

  return (
    <section className="w-full py-20 bg-transparent text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center text-[#00F0FF] border border-[#00F0FF]/30 rounded-full px-4 py-1 mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium uppercase tracking-widest">
              OUR COMMUNITY
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Who is Using{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
              LinkDM
            </span>
            ?
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-montserrat">
            Join thousands of creators, brands, and businesses that trust LinkDM
            to automate their engagement and grow their audience.
          </p>

          {/* Divider */}
          <div className="w-24 h-1 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full mx-auto mt-8"></div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-5 md:mb-12">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-full p-1 flex">
            {[
              {
                id: "creators",
                label: "Creators",
                icon: <Users className="h-5 w-5" />,
              },
              {
                id: "brands",
                label: "Brands",
                icon: <Building2 className="h-5 w-5" />,
              },
              {
                id: "niches",
                label: "Niches",
                icon: <Tag className="h-5 w-5" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-2 py-1 md:px-6 md:py-3 rounded-full transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {tab.icon}
                <span className="ml-1 md:ml-2 text-sm md:text-base font-medium">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {/* Creators Tab */}
          {activeTab === "creators" && (
            <div className="space-y-2 md:space-y-4 w-full">
              {creatorRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`flex flex-wrap items-center justify-center gap-2 md:gap-4 w-full`}
                >
                  {row.items.map((creator: string, index: number) => (
                    <div
                      key={index}
                      className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-2 hover:border-[#00F0FF]/50 transition-all duration-300 group flex items-center justify-center flex-shrink-0"
                    >
                      <div className="flex items-center justify-center">
                        <div className=" w-5 h-5 md:w-10 md:h-10 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full flex items-center justify-center p-2 mr-3">
                          <Instagram className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium group-hover:text-[#00F0FF] transition-colors">
                          {creator}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Brands Tab */}
          {activeTab === "brands" && (
            <div className="space-y-2 md:space-y-4 w-full">
              {brandRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`flex flex-wrap items-center justify-center  gap-2 md:gap-4 w-full`}
                >
                  {row.items.map((brand: string, index: number) => (
                    <div
                      key={index}
                      className="bg-[#1a1a1a] border border-gray-800 rounded-3xl overflow-hidden p-2 hover:border-[#00F0FF]/50 transition-all duration-300 group flex items-center justify-center flex-shrink-0"
                    >
                      <div className="flex items-center justify-center">
                        <div className=" w-5 h-5 md:w-10 md:h-10 bg-gradient-to-r from-[#FF2E9F] to-[#B026FF] rounded-full flex items-center justify-center p-2 mr-3">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium group-hover:text-[#FF2E9F] transition-colors">
                          {brand}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Niches Tab */}
          {activeTab === "niches" && (
            <div className="space-y-2 md:space-y-4 w-full">
              {nicheRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`flex flex-wrap items-center justify-center gap-2 md:gap-4 w-full`}
                >
                  {row.items.map(
                    (niche: { name: string; count: string }, index: number) => (
                      <div
                        key={index}
                        className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-2 md:p-4 hover:border-[#00F0FF]/50 transition-all duration-300 group flex items-center justify-between flex-shrink-0 min-w-[200px]"
                      >
                        <div className="flex items-center justify-center w-full">
                          <CheckCircle className="h-5 w-5 text-[#00F0FF] mr-3" />
                          <span className="text-sm font-medium group-hover:text-[#00F0FF] transition-colors">
                            {niche.name}
                          </span>
                        </div>
                        <span className="hidden sm:flex text-xs bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-transparent bg-clip-text font-bold">
                          {niche.count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] border border-[#00F0FF]/30 rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                50K+
              </div>
              <div className="text-gray-300 mt-2">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF2E9F] to-[#B026FF]">
                2M+
              </div>
              <div className="text-gray-300 mt-2">DMs Sent Daily</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
                95%
              </div>
              <div className="text-gray-300 mt-2">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#B026FF] to-[#FF2E9F]">
                24/7
              </div>
              <div className="text-gray-300 mt-2">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
