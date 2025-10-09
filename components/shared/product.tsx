"use client";

import { Sparkles, Play } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

const ProductShowcase = () => {
  const { theme } = useTheme();

  // Theme-based styles
  const containerBg = theme === "dark" ? "bg-transparent" : "bg-transparent";

  const cardBg =
    theme === "dark"
      ? "bg-gradient-to-br from-[#8923a3]/10 to-[#00F0FF]/5 backdrop-blur-sm border border-white/10"
      : "bg-gradient-to-br from-[#8923a3]/5 to-[#00F0FF]/10 backdrop-blur-sm border border-gray-200";

  const backgroundAnimation =
    theme === "dark"
      ? "bg-gradient-to-r from-[#00F0FF]/5 via-[#B026FF]/5 to-[#FF2E9F]/5"
      : "bg-gradient-to-r from-[#00F0FF]/10 via-[#B026FF]/10 to-[#FF2E9F]/10";

  const titleColor = theme === "dark" ? "text-white" : "text-gray-900";

  const descriptionColor = theme === "dark" ? "text-gray-300" : "text-gray-600";

  const outlineButtonBg =
    theme === "dark"
      ? "border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
      : "border-gray-300 text-gray-700 hover:bg-gray-100 backdrop-blur-sm";

  return (
    <div
      className={`w-full ${containerBg} text-foreground relative overflow-hidden`}
    >
      <div className="relative max-w-4xl w-full m-auto z-10 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Bottom CTA Section */}
        <div className="text-center">
          <div
            className={`relative overflow-hidden rounded-3xl ${cardBg} p-8 md:p-12`}
          >
            {/* Background animation */}
            <div className={`absolute inset-0 ${backgroundAnimation}`} />

            <div className="relative z-10">
              <h3
                className={`text-3xl md:text-4xl font-bold ${titleColor} mb-4 font-montserrat`}
              >
                Ready to Transform Your Business?
              </h3>

              <p
                className={`${descriptionColor} mb-8 text-lg leading-relaxed font-montserrat`}
              >
                Join thousands of businesses already using our AI solutions to
                automate customer engagement and boost conversions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/web"
                  className="bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] hover:shadow-xl text-white font-semibold px-8 py-6 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Link>

                <Link
                  href="/insta"
                  className={`${outlineButtonBg} px-8 py-6 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105`}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Purchase Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
