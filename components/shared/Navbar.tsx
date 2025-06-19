"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "/public/assets/img/logo.png";
import { SignedIn, SignedOut, useAuth, UserButton } from "@clerk/nextjs";
import { getOwner } from "@/lib/action/appointment.actions";
import { ArrowRight } from "lucide-react";

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOwn, setIsOwn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("home");

  const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isOwner = async () => {
      const ownerId = await getOwner();
      setIsOwn(userId === ownerId);
    };
    if (userId) isOwner();
  }, [router, userId]);

  const navItems = [
    { id: "services", label: "Services", href: "/OurService" },
    { id: "products", label: "Products", href: "/product" },
    { id: "about", label: "AboutUs", href: "/Aboutus" },
    { id: "review", label: "Review", href: "/Review" },
  ];

  const handleNavClick = (id: string) => {
    setActiveNavItem(id);
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50  border-b border-[#00F0FF]/20 transition-all duration-300 ${
        isScrolled ? "rounded-lg shadow-md" : "rounded-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between gap-2 items-center bg-[#0a0a0a] backdrop-blur-sm">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
          onClick={() => handleNavClick("home")}
        >
          <div className="relative h-7 w-7 md:w-10 md:h-10 mr-1 md:mr-3">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] animate-pulse"></div>
            <div className="absolute inset-1 rounded-full bg-[#0A0A0A] flex items-center justify-center">
              <Image
                alt="Logo"
                src={Logo}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-lg lg:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
            Ainpire<span className="text-[#B026FF]">Tech</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex justify-evenly items-center space-x-3 lg:space-x-8 text-sm lg:text-base">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`nav-link relative group cursor-pointer ${
                activeNavItem === item.id ? "text-[#00F0FF]" : "text-white"
              }`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="hover:text-[#00F0FF] transition-colors">
                {item.label}
              </span>
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-[#00F0FF] transition-all duration-300 ${
                  activeNavItem === item.id
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          <SignedIn>
            {isOwn ? (
              <button
                onClick={() => router.push("/admin")}
                className="hidden md:flex px-4 py-2 !rounded-button bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
              >
                <span className="mr-2">Dashboard</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => router.push("/UserDashboard")}
                className="hidden md:flex px-4 py-2 !rounded-button bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
              >
                <span className="mr-2">Dashboard</span>
                <ArrowRight size={16} />
              </button>
            )}
            <div className="hidden md:block">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <button
              onClick={() => router.push("/contactUs")}
              className="hidden md:flex px-4 py-2 !rounded-button bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
            >
              Contact Us
            </button>
            <button
              onClick={() => router.push("/sign-in")}
              className="hidden md:flex px-4 py-2 !rounded-button bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
            >
              Login
            </button>
          </SignedOut>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl text-[#00F0FF] cursor-pointer !rounded-button whitespace-nowrap"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-96" : "max-h-0"
        } bg-[#0a0a0a]/80 backdrop-blur-sm`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col items-center justify-center max-w-max space-y-4 ">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`text-white hover:text-[#00F0FF] transition-colors cursor-pointer ${
                activeNavItem === item.id ? "text-[#00F0FF]" : ""
              }`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </Link>
          ))}

          <SignedIn>
            <div className="flex flex-col gap-4">
              {isOwn ? (
                <button
                  onClick={() => {
                    router.push("/admin");
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-2 !rounded-button bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                >
                  Admin Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    router.push("/UserDashboard");
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-2 !rounded-button bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                >
                  User Dashboard
                </button>
              )}
              <div className="flex justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </SignedIn>

          <SignedOut>
            <button
              onClick={() => {
                router.push("/contactUs");
                setIsMenuOpen(false);
              }}
              className="px-4 py-2 !rounded-button bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
            >
              Contact Us
            </button>
            <button
              onClick={() => {
                router.push("/sign-in");
                setIsMenuOpen(false);
              }}
              className="px-4 py-2 !rounded-button bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 w-full transition-opacity whitespace-nowrap cursor-pointer"
            >
              Login
            </button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
