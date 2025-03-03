"use client";
import React, { useEffect, useState } from "react";
import { Navbar, Collapse, Button, IconButton } from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Logo from "/public/assets/img/file.png";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignedIn, SignedOut, useAuth, UserButton } from "@clerk/nextjs";
import { getOwner } from "@/lib/action/appointment.actions";

export function NavBar() {
  const [openNav, setOpenNav] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOwn, setIsOwn] = useState(false);

  const router = useRouter();
  const { userId } = useAuth();

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
  useEffect(() => {
    const isOwner = async () => {
      const ownerId = await getOwner();
      if (userId !== ownerId) {
        setIsOwn(false);
      } else {
        setIsOwn(true);
      }
    };
    isOwner();
  }, [router, userId]);
  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-1 sm:mb-2 sm:mt-2 lg:mb-0  lg:mt-0 md:flex-row items-center justify-center sm:gap-1 md:gap-2 lg:gap-6 border shadow-inner-glow rounded-md  text-white w-full ">
      <li className="flex-auto p-[1px]">
        <a
          href="/"
          className="    flex   hover:text-black hover:bg-gray-300 active:text-black active:bg-white font-thin  text-md md:font-light md:text-lg p-1 justify-center w-full  rounded-md"
        >
          Home
        </a>
      </li>

      <li className="flex-auto  p-[1px]">
        <a
          href="/OurService"
          className="    flex   hover:text-black hover:bg-gray-300 active:text-black active:bg-white  font-thin  text-md md:font-light md:text-lg p-1 justify-center w-full  rounded-md"
        >
          Services
        </a>
      </li>
      <li className="flex-auto  p-[1px]">
        <a
          href="/product"
          className="    flex   hover:text-black hover:bg-gray-300 active:text-black active:bg-white  font-thin  text-md md:font-light md:text-lg p-1 justify-center w-full  rounded-md"
        >
          Products
        </a>
      </li>
      <li className="flex-auto  p-[1px]">
        <a
          href="/Aboutus"
          className="    flex  hover:text-black hover:bg-gray-300 active:text-black active:bg-white  font-thin  text-md md:font-light md:text-lg p-1 justify-center w-full rounded-md"
        >
          AboutUs
        </a>
      </li>
      <li className="flex-auto  p-[1px]">
        <a
          href="/Review"
          className="    flex  hover:text-black hover:bg-gray-300 active:text-black active:bg-white font-thin  text-md md:font-light md:text-lg p-1 justify-center w-full  rounded-md "
        >
          Review
        </a>
      </li>
    </ul>
  );

  return (
    <Navbar
      className={`m-auto  sticky top-0 z-10 px-0 transition-all duration-300  border-black bg-black  ${
        isScrolled ? "rounded-lg shadow-md" : "rounded-none"
      }`}
    >
      <div className="flex items-center w-full justify-between text-white">
        <Link
          href="/"
          className="w-1/2   md:w-1/6  cursor-pointer py-1.5 font-bold text-xl"
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
        <div className="hidden md:flex   w-1/2  md:w-5/6  items-center gap-3 justify-end ">
          <div className="  w-9/12  lg:w-8/12">{navList}</div>

          <SignedIn>
            {isOwn ? (
              <Button
                size="lg"
                color="white"
                variant="gradient"
                onClick={() => router.push("/admin")}
                className="text-black 
                w-2/12 py-2 px-1 border text-center  border-white shadow-sm shadow-blue-gray-800"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                size="lg"
                color="white"
                variant="gradient"
                onClick={() => router.push("/UserDashboard")}
                className="text-black 
            w-2/12 py-2 px-1 border text-center  border-white shadow-sm shadow-blue-gray-800"
              >
                Dashboard
              </Button>
            )}
            <div className="">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/contactUs")}
              className="text-black 
              w-2/12 py-2 px-1 border text-center  border-white shadow-sm shadow-blue-gray-800"
            >
              ContactUs
            </Button>
            <Button
              size="lg"
              color="white"
              variant="gradient"
              onClick={() => router.push("/sign-up")}
              className="text-black 
           
               w-2/12  py-2 px-1 border text-center  border-white shadow-sm shadow-blue-gray-800 "
            >
              Login
            </Button>
          </SignedOut>
        </div>

        <IconButton
          variant="text"
          className="w-6/12 text-white md:hidden "
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

        <SignedIn>
          <div className="flex items-center justify-center gap-2">
            {isOwn ? (
              <Button
                size="lg"
                color="white"
                variant="gradient"
                onClick={() => router.push("/admin")}
                className="text-black 
               w-full py-2 px-1 border text-center  border-white shadow-sm shadow-blue-gray-800"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                size="lg"
                color="white"
                variant="gradient"
                onClick={() => router.push("/UserDashboard")}
                className="text-black 
            w-full py-2 px-1 border text-center  border-white shadow-sm shadow-blue-gray-800"
              >
                Dashboard
              </Button>
            )}
            <div className="flex items-center justify-center bg-white rounded p-[3px]">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </SignedIn>
        <SignedOut>
          <Button
            fullWidth
            size="lg"
            color="white"
            variant="gradient"
            onClick={() => router.push("/contactUs")}
            className="text-black 
               py-2 px-1 border text-center  border-white shadow-sm shadow-blue-gray-800"
          >
            ContactUs
          </Button>
          <Button
            fullWidth
            size="lg"
            color="white"
            variant="gradient"
            onClick={() => router.push("/sign-up")}
            className="text-black 
              
                py-2 mt-1 px-1 border text-center  border-white shadow-sm shadow-blue-gray-800 "
          >
            Login
          </Button>
        </SignedOut>
      </Collapse>
    </Navbar>
  );
}
