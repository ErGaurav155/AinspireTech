"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

export function BreadcrumbsDefault() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment);

  return (
    <div className="w-full flex  items-center justify-center py-4 px-4 relative z-10">
      <div className="flex flex-wrap items-center gap-2 bg-gray-900/50 backdrop-blur-md border border-[#B026FF]/30 rounded-full px-4 md:px-6 py-1 md:py-3">
        <Link
          href="/"
          className="opacity-80 hover:opacity-100 text-sm md:text-base transition-opacity bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]"
        >
          Home
        </Link>

        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/");
          const segmentName = segment.replace(/-/g, " ");
          const isLast = index === pathSegments.length - 1;

          return (
            <div key={href} className="flex items-center gap-2">
              <ChevronRightIcon className="h-4 w-4 text-[#B026FF]" />
              <Link
                href={href}
                className={`text-sm md:text-base transition-all text-wrap ${
                  isLast
                    ? "text-white font-medium"
                    : "opacity-80 hover:opacity-100 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]"
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
