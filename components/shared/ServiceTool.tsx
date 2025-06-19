"use client";

import { topics } from "@/constant";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { useState } from "react";

interface SubTopic {
  name: string;
  description: string;
}

export default function ServicesTabs() {
  const [selectedSubTopic, setSelectedSubTopic] = useState<SubTopic>({
    name: "Workflow Automation",
    description:
      "In today's digital era, efficiency is the backbone of any successful business. At Morningside AI, we harness the power of Autonomous Agents to revolutionize your workflow processes. Our Workflow Automation solution goes beyond traditional task automation; it incorporates intelligent agents that can make decisions, adapt to varying circumstances, and consistently optimize operations.Through our deep understanding of AI and its potential, we design agents that can predictively automate tasks, reducing manual intervention and the chances for human error. Whether you're looking to streamline administrative processes, enhance data operations, or elevate customer interactions, our bespoke autonomous agents are built to integrate seamlessly into your environment.",
  });

  return (
    <Tabs defaultValue="tab-1" className="w-full relative z-10">
      <TabsList className="flex flex-wrap items-center justify-center w-full pb-15 bg-gray-900/50 backdrop-blur-md border border-[#B026FF]/30 rounded-xl">
        {topics.map((topic, index) => (
          <TabsTrigger
            className="p-1 transition-all duration-300 hover:scale-105 focus-visible:ring-0 focus-visible:ring-offset-0"
            key={index}
            value={`tab-${index}`}
          >
            <div
              className={`w-full rounded-lg p-3 ${
                index % 2 === 0
                  ? "bg-gradient-to-r from-[#00F0FF] to-[#B026FF]"
                  : "bg-gradient-to-r from-[#FF2E9F] to-[#B026FF]"
              }`}
            >
              <h1 className="text-sm lg:text-base font-bold text-black">
                {topic.title}
              </h1>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      {topics.map((topic, index) => (
        <TabsContent key={index} value={`tab-${index}`} className="mt-28">
          {topic.subTopics.length > 0 ? (
            <div className="space-y-8 p-2">
              <ul className="flex flex-wrap items-center justify-center gap-4">
                {topic.subTopics.map((subTopic, subIndex) => (
                  <li
                    key={subIndex}
                    className={`p-3 rounded-xl transition-all duration-300 cursor-pointer border ${
                      selectedSubTopic?.name === subTopic.name
                        ? "bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] text-black font-bold border-transparent scale-105"
                        : "bg-gray-900/50 backdrop-blur-md border-[#B026FF]/30 text-white hover:bg-gray-800"
                    }`}
                    onClick={() => setSelectedSubTopic(subTopic)}
                  >
                    <span className="text-sm md:text-base">
                      {subTopic.name}
                    </span>
                  </li>
                ))}
              </ul>

              {selectedSubTopic && (
                <div className="bg-gray-900/50 backdrop-blur-md border border-[#B026FF]/30 rounded-xl p-6 transition-all duration-300 ">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
                    {selectedSubTopic.name}
                  </h3>
                  <p className="text-gray-300">
                    {selectedSubTopic.description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-300 text-center py-8">
              No subtopics available for this section.
            </p>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
