"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useTheme } from "next-themes";

export function BreadcrumbsDefault() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment);
  const { theme } = useTheme();
  // Theme-based styles
  const containerBg = theme === "dark" ? "bg-gray-900/50" : "bg-gray-100/80";
  const containerBorder =
    theme === "dark" ? "border-[#B026FF]/30" : "border-[#B026FF]/50";
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const gradientText =
    "bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]";

  return (
    <div className="w-full flex items-center justify-center py-4 px-4 relative z-10">
      <div
        className={`flex flex-wrap items-center gap-2 ${containerBg} backdrop-blur-md border ${containerBorder} rounded-full px-4 md:px-6 py-1 md:py-3`}
      >
        <Link
          href="/"
          className={`opacity-80 hover:opacity-100 text-sm md:text-base transition-opacity ${gradientText}`}
        >
          Home
        </Link>

        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/");
          const segmentName = segment.replace(/-/g, " ");
          const isLast = index === pathSegments.length - 1;

          return (
            <div key={href} className="flex items-center gap-2">
              <ChevronRightIcon
                className={`h-4 w-4 ${
                  theme === "dark" ? "text-[#B026FF]" : "text-[#B026FF]"
                }`}
              />
              <Link
                href={href}
                className={`text-sm md:text-base transition-all text-wrap ${
                  isLast
                    ? `${textPrimary} font-medium`
                    : `opacity-80 hover:opacity-100 ${gradientText}`
                }`}
              >
                {segmentName}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
