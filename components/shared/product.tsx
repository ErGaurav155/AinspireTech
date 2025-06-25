"use client";

import { useRouter } from "next/navigation";

const sections = [
  {
    title: " WEBSITE CHATBOTS",
    items: [
      { id: "/web/product/chatbot-customer-support", name: "Customer Support" },
      { id: "/web/product/chatbot-e-commerce", name: "E-Commerce" },
      { id: "/web/product/chatbot-lead-generation", name: "Lead Generation" },
      { id: "/web/product/chatbot-education", name: "Education" },
    ],
  },
  {
    title: "INSTAGRAM CHATBOTS",
    items: [
      { id: "/insta", name: "Pathology & Medical" },
      { id: "/insta", name: "E-Commerce" },
      { id: "/insta", name: "Business" },
      { id: "/insta", name: "SaaS" },
    ],
  },
];

const OutProduct = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-10 px-4 sm:px-6 lg:px-8 relative z-10 ">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
        Buy Products
      </h1>

      <div className="max-w-7xl m-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {sections.map((section, sectionIndex) => {
            // Determine border colors based on index
            const borderColor =
              sectionIndex === 0
                ? "border-[#00F0FF]/20 hover:border-[#00F0FF]"
                : sectionIndex === 1
                ? "border-[#B026FF]/30 hover:border-[#B026FF]"
                : "border-[#FF2E9F]/20 hover:border-[#FF2E9F]";

            // Determine hover background gradient based on index
            const hoverBg =
              sectionIndex === 0
                ? "from-[#00F0FF]/10"
                : sectionIndex === 1
                ? "from-[#B026FF]/10"
                : "from-[#FF2E9F]/10";

            return (
              <div
                key={section.title}
                className={`relative group rounded-lg backdrop-blur-sm border transition-all duration-300 ${borderColor}`}
              >
                {/* Hover effect background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${hoverBg} to-transparent`}
                ></div>

                <div className="relative z-10 p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {section.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => router.push(`${item.id}`)}
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

export default OutProduct;
