"use client";

import { useRouter } from "next/navigation";

import { Button } from "@material-tailwind/react";

// Define the array of products for each section
const sections = [
  {
    title: "CHATBOTS",
    background: "bg-gray-100",
    items: [
      { id: "chatbot-customer-support", name: "Customer Support" },
      { id: "chatbot-e-commerce", name: "E-Commerce" },
      { id: "chatbot-lead-generation", name: "Lead Generation" },
      { id: "chatbot-education", name: "Education" },
    ],
  },
  {
    title: "AI AGENTS",
    background: "bg-red-700",
    items: [
      { id: "ai-agent-customer-support", name: "Customer Support" },
      { id: "ai-agent-e-commerce", name: "E-Commerce" },
      { id: "ai-agent-lead-generation", name: "Lead Generation" },
      { id: "ai-agent-education", name: "Education" },
    ],
  },
  {
    title: "WEBSITE TEMPLATES",
    background: "bg-gray-100",
    items: [
      { id: "template-pathology", name: "Pathology & Medical" },
      { id: "template-e-commerce", name: "E-Commerce" },
      { id: "template-business", name: "Business" },
      { id: "template-saas", name: "SaaS" },
    ],
  },
];

const OutProduct = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white leading-tight">
        Buy Product
      </h1>
      <div className="flex flex-row flex-wrap gap-4 items-center justify-center w-full h-full text-white">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`flex flex-col gap-4 flex-auto w-full md:w-1/3 lg:w-1/4 ${section.background} bg-opacity-90 rounded-md p-5 transition-transform duration-300 hover:scale-105`}
          >
            <h1 className="p-2 text-xl font-normal text-black bg-opacity-20">
              {section.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center h-auto rounded bg-gray-600 bg-opacity-50 p-5 gap-2">
              {section.items.map((item) => (
                <Button
                  key={item.id}
                  size="md"
                  color="white"
                  variant="gradient"
                  onClick={() => router.push(`/product/${item.id}`)}
                  className="
                    w-full flex-auto bg-gray-200 text-black bg-opacity-60 text-xs font-normal md:text-sm md:font-semibold text-center overflow-hidden px-1"
                >
                  <span>{item.name}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutProduct;
