"use client";

import { useRouter } from "next/navigation";
import { Button } from "@material-tailwind/react";

// Define services dynamically
const services = [
  {
    title: "CHATBOT DEVELOPMENT",
    background: "bg-red-700",
    cardBackground: "bg-gray-600 bg-opacity-50",
    buttonBackground: "bg-gray-200 bg-opacity-50",
    items: [
      { id: "gpt-development", name: "GPT Development" },
      { id: "secure-solutions", name: "Secure Solutions" },
      { id: "knowledge-response", name: "Knowledge Response" },
      { id: "ml-model-tuning", name: "ML Model Tuning" },
    ],
  },
  {
    title: "AI AGENT DEVELOPMENT",
    background: "bg-gray-100 bg-opacity-90",
    cardBackground: "bg-gray-600 bg-opacity-50",
    buttonBackground: "bg-gray-200 bg-opacity-50",
    items: [
      { id: "workflow-automation", name: "Workflow Automation" },
      { id: "natural-language-sql", name: "Natural Language to SQL" },
      { id: "complex-data-pipelines", name: "Complex Data Pipelines" },
      { id: "self-adaptive-systems", name: "Self-Adaptive Decision Systems" },
    ],
  },
  {
    title: "WEBSITE DEVELOPMENT",
    background: "bg-red-700",
    cardBackground: "bg-gray-600 bg-opacity-30",
    buttonBackground: "bg-gray-200 bg-opacity-50",
    items: [
      { id: "ui-ux-friendly", name: "Ui/Ux User-friendly" },
      { id: "media-responsive", name: "Media Responsive" },
      { id: "seo-optimisation", name: "SEO Optimisation" },
      { id: "online-marketing", name: "Online Marketing" },
    ],
  },
];

const Service = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white leading-tight">
        Our Services
      </h1>
      <div className="flex flex-row flex-wrap gap-4 items-center justify-center w-full h-full text-white">
        {services.map((section) => (
          <div
            key={section.title}
            className={`flex flex-col gap-4 flex-auto w-full md:w-1/3 lg:w-1/4 ${section.background} rounded-md p-5 transition-transform duration-300 hover:scale-105`}
          >
            <h1 className="p-2 text-xl font-normal text-black bg-opacity-20">
              {section.title}
            </h1>
            <div
              className={`flex flex-wrap items-center justify-center h-auto rounded ${section.cardBackground} p-5 gap-2`}
            >
              {section.items.map((item) => (
                <Button
                  key={item.id}
                  size="md"
                  color="white"
                  variant="gradient"
                  onClick={() => router.push(`/OurService`)}
                  className={`w-full flex-auto ${section.buttonBackground} text-black text-xs font-normal md:text-sm md:font-semibold text-center overflow-hidden px-1`}
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

export default Service;
