"use client";

import { useRouter } from "next/navigation";

const services = [
  {
    title: "CHATBOT DEVELOPMENT",
    items: [
      { id: "gpt-development", name: "GPT Development" },
      { id: "secure-solutions", name: "Secure Solutions" },
      { id: "knowledge-response", name: "Knowledge Response" },
      { id: "ml-model-tuning", name: "ML Model Tuning" },
    ],
  },
  {
    title: "AI AGENT DEVELOPMENT",
    items: [
      { id: "workflow-automation", name: "Workflow Automation" },
      { id: "natural-language-sql", name: "Natural Language to SQL" },
      { id: "complex-data-pipelines", name: "Complex Data Pipelines" },
      { id: "self-adaptive-systems", name: "Self-Adaptive Decision Systems" },
    ],
  },
  {
    title: "WEBSITE DEVELOPMENT",
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
    <div className="flex flex-col items-center justify-center gap-10 py-16 px-4 sm:px-6 lg:px-8 relative z-10 ">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
        Our Services
      </h1>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            // Determine border colors based on index
            const borderColor =
              index === 0
                ? "border-[#00F0FF]/20 hover:border-[#00F0FF]"
                : index === 1
                ? "border-[#B026FF]/30 hover:border-[#B026FF]"
                : "border-[#FF2E9F]/20 hover:border-[#FF2E9F]";

            // Determine hover background gradient based on index
            const hoverBg =
              index === 0
                ? "from-[#00F0FF]/10"
                : index === 1
                ? "from-[#B026FF]/10"
                : "from-[#FF2E9F]/10";

            return (
              <div
                key={service.title}
                className={`relative group rounded-lg backdrop-blur-sm border transition-all duration-300 ${borderColor}`}
              >
                {/* Hover effect background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${hoverBg} to-transparent`}
                ></div>

                <div className="relative z-10 p-6">
                  <h3 className="text-xl font-bold mb-6 text-white">
                    {service.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {service.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/OurService`)}
                        className="w-full text-xs md:text-sm font-medium bg-gray-900/60 backdrop-blur-sm border border-[#00F0FF]/30 text-white py-3 rounded-lg hover:bg-gradient-to-br hover:from-[#00F0FF]/10 hover:to-transparent transition-all duration-300"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Service;
