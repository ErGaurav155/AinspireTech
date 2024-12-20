"use client";
import React, { useEffect, useState } from "react";
import { Navbar, Collapse, Button, IconButton } from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Logo from "/public/assets/img/file.png";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function NavBar() {
  const [openNav, setOpenNav] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Add or remove the rounded style based on scroll position
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 540) {
        setOpenNav(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-1 sm:mb-2 sm:mt-2 lg:mb-0  lg:mt-0 sm:flex-row items-center justify-center sm:gap-1 md:gap-2 lg:gap-6 border shadow-inner-glow rounded-md  text-white w-full ">
      <li className="flex-auto p-[1px]">
        <a
          href="/"
          className="    flex   hover:text-black hover:bg-gray-300 active:text-black active:bg-white font-thin  text-md md:font-light md:text-lg p-3 justify-center w-full  rounded-md"
        >
          Home
        </a>
      </li>

      <li className="flex-auto  p-[1px]">
        <a
          href="/OurService"
          className="    flex   hover:text-black hover:bg-gray-300 active:text-black active:bg-white  font-thin  text-md md:font-light md:text-lg p-3 justify-center w-full  rounded-md"
        >
          Services
        </a>
      </li>
      <li className="flex-auto  p-[1px]">
        <a
          href="/Aboutus"
          className="    flex  hover:text-black hover:bg-gray-300 active:text-black active:bg-white  font-thin  text-md md:font-light md:text-lg p-3 justify-center w-full rounded-md"
        >
          About us
        </a>
      </li>
      <li className="flex-auto  p-[1px]">
        <a
          href="/Review"
          className="    flex  hover:text-black hover:bg-gray-300 active:text-black active:bg-white font-thin  text-md md:font-light md:text-lg p-3 justify-center w-full  rounded-md "
        >
          Review
        </a>
      </li>
    </ul>
  );

  return (
    <Navbar
      className={`m-auto sticky top-0 z-10 px-0 transition-all duration-300  border-black bg-black  ${
        isScrolled ? "rounded-lg shadow-md" : "rounded-none"
      }`}
    >
      <div className="flex items-center w-full justify-between text-white">
        <Link
          href="/"
          className="w-1/2   sm:w-1/4  lg:w-2/5 cursor-pointer py-1.5 font-bold text-xl"
        >
          <Image
            alt="image"
            className="flex-1 object-contain "
            src={Logo}
            width={250}
            height={250}
            priority
          />
        </Link>
        <div className="hidden sm:flex  w-1/2  sm:w-3/4  lg:w-3/5 items-center gap-3 justify-between ">
          <div className="   w-9/12 ">{navList}</div>

          <Button
            size="lg"
            color="white"
            variant="gradient"
            onClick={() => router.push("/contactUs")}
            className="text-black 
              w-3/12 p-4 border text-center  border-white shadow-sm shadow-blue-gray-800"
          >
            Contact us
          </Button>
        </div>

        <IconButton
          variant="text"
          className="w-6/12  sm:hidden "
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        {navList}
        <Button
          size="lg"
          color="white"
          variant="gradient"
          onClick={() => router.push("/contactUs")}
          className="text-black 
              w-full border border-white shadow-sm shadow-blue-gray-800"
        >
          <span>Contact Us</span>
        </Button>
      </Collapse>
    </Navbar>
  );
}
