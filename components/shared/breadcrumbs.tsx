"use client";

import { Breadcrumbs } from "@material-tailwind/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BreadcrumbsDefault() {
  // Get the current path
  const pathname = usePathname();

  // Split the path into segments
  const pathSegments = pathname.split("/").filter((segment) => segment);

  return (
    <Breadcrumbs className="mt-4 flex items-center justify-center text-wrap w-full bg-white bg-opacity-90 ">
      <Link
        href="/"
        className="opacity-60 hover:opacity-100 text-wrap text-sm md:text-xl font-thin"
      >
        Home
      </Link>

      {pathSegments.map((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/");

        const segmentName = segment.replace(/-/g, " ");

        return (
          <Link
            className="text-sm md:text-xl font-thin text-wrap w-full"
            key={href}
            href={href}
          >
            {segmentName}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
