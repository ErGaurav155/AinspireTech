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
    <Tabs defaultValue="tab-1">
      <TabsList className="flex flex-row flex-wrap   items-center justify-center w-full h-full text-white bg-black">
        {topics.map((topic, index) => (
          <TabsTrigger
            className="   transition-transform duration-300 hover:scale-105 active:scale-105 "
            key={index}
            value={`tab-${index}`}
          >
            <div
              className={`w-full rounded-md p-3   ${
                index % 2 === 0 ? "bg-red-800 " : "bg-[#55edab] "
              }`}
            >
              <h1 className="text-sm lg:text-lg font-normal  text-black  ">
                {topic.title}
              </h1>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
      {topics.map((topic, index) => (
        <TabsContent key={index} defaultValue="tab-1" value={`tab-${index}`}>
          {topic.subTopics.length > 0 ? (
            <div>
              <ul className="flex items-center justify-center flex-wrap gap-3 bg-black text-white cursor-pointer mt-9">
                {topic.subTopics.map((subTopic, subIndex) => (
                  <li
                    key={subIndex}
                    className={`border p-2 md:p-3 rounded-md text-sm font-normal  ${
                      selectedSubTopic?.name === subTopic.name
                        ? "bg-white text-black"
                        : ""
                    }`}
                    onClick={() => setSelectedSubTopic(subTopic)}
                  >
                    {subTopic.name}
                  </li>
                ))}
              </ul>
              {selectedSubTopic && (
                <div style={{ marginTop: "20px" }}>
                  <h3 className=" h3-bold text-white">
                    {selectedSubTopic.name}
                  </h3>
                  <p className=" pt-2 p-16-regular text-white">
                    {selectedSubTopic.description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p>No subtopics available for this section.</p>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
