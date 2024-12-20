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
    <Breadcrumbs className="mt-4 flex items-center justify-center w-full bg-white bg-opacity-90 ">
      {/* Always include Home as the first breadcrumb */}
      <Link
        href="/"
        className="opacity-60 hover:opacity-100  text-xl font-thin"
      >
        Home
      </Link>

      {/* Create breadcrumb links for other segments */}
      {pathSegments.map((segment, index) => {
        // Build the URL for each breadcrumb
        const href = "/" + pathSegments.slice(0, index + 1).join("/");

        // Format the segment for display
        const segmentName = segment.replace(/-/g, " ");

        return (
          <Link className="text-xl font-thin" key={href} href={href}>
            {segmentName}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
