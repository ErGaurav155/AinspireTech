"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { InboxArrowDownIcon } from "@heroicons/react/24/outline";

export function Footer() {
  return (
    <footer className=" w-full max-w-7xl m-auto    ">
      <div className=" mt-10     rounded-t-lg flex flex-row flex-wrap items-center justify-center gap-y-6 gap-x-12 bg-gray-900 text-center md:justify-between text-white p-4 md:p-10">
        <Image
          src="/assets/img/file.png"
          alt="logo"
          width={200}
          height={200}
          className=" rounded "
        />
        <ul className="flex flex-wrap items-center gap-y-2 gap-x-8">
          <li>
            <Link
              href="/Aboutus"
              color="white"
              className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              href="/contactUs"
              color="white"
              className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
            >
              Contact Us
            </Link>
          </li>

          <li>
            <Link
              href="/privacy-policy"
              color="white"
              className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
            >
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link
              href="/TermsandCondition"
              color="white"
              className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
            >
              Terms & Conditions
            </Link>
          </li>
        </ul>
        <div className=" flex  w-full items-center justify-end  gap-5 p-4  md:p-10 pr-5 md:pr-10  bg-gray-900 text-white">
          <div>
            <div className="flex items-center justify-center gap-3">
              <MapPin className="size-6" />
              <span className="font-bold text-base ">Address</span>
            </div>
            <div className="flex flex-col items-start justify-center ">
              <span className="text-sm md:text-md font-light">Nashik,IND</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-3">
              <InboxArrowDownIcon className="h-5 w-5" />
              <span className="font-bold text-base">Contact</span>
            </div>
            <div>
              <a
                href="mailto:gauravgkhaire@gmail.com"
                className="cursor-pointer hover:text-[#20704d]  font-thin  text-xs md:font-light md:text-base "
              >
                gauravgkhaire@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
