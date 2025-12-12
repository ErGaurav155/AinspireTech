"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/public/assets/img/logo.png";
import { useTheme } from "next-themes";

import { Instagram, Menu, Network, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { ThemeToggle } from "../theme-toggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentTheme = resolvedTheme || theme || "light";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme-based styles
  const themeStyles = useMemo(() => {
    const isDark = currentTheme === "dark";
    return {
      navBg: isDark ? "bg-[#0a0a0a]/80" : "bg-white/50",
      navBorder: isDark ? "border-white/10" : "border-gray-200",
      textPrimary: isDark ? "text-gray-300" : "text-n-5",
      textHover: isDark ? "hover:text-[#00F0FF]" : "hover:text-[#00F0FF]",
      mobileBg: isDark ? "bg-[#0a0a0a]/80" : "bg-white/80",
      mobileBorder: isDark ? "border-white/10" : "border-gray-200",
      buttonOutline: isDark
        ? "border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10"
        : "border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/10",
      mobileButtonText: isDark ? "text-white" : "text-gray-900",
    };
  }, [currentTheme]);

  if (!mounted) {
    return (
      <div className=" bg-transparent  flex items-center justify-center h-full w-full">
        <div className="w-5 h-5  border-t-transparent  rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <nav
      className={`${themeStyles.navBg} backdrop-blur-md border-b ${themeStyles.navBorder} sticky top-0 z-50`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-7 w-7 md:w-10 md:h-10 mr-1 md:mr-3">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] animate-pulse"></div>
              <div
                className={`absolute inset-1 rounded-full ${
                  theme === "dark" ? "bg-[#0A0A0A]" : "bg-white"
                } flex items-center justify-center`}
              >
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
          <div className="hidden md:flex items-center space-x-2 lg:space-x-8 text-sm lg:text-lg">
            <Link
              href="/web/UserDashboard"
              className={`${themeStyles.textPrimary} ${themeStyles.textHover} transition-colors font-medium`}
            >
              Dashboard
            </Link>
            <Link
              href="/web/product"
              className={`${themeStyles.textPrimary} ${themeStyles.textHover} transition-colors font-medium`}
            >
              Categories
            </Link>
            <Link
              href="/web/feature"
              className={`${themeStyles.textPrimary} ${themeStyles.textHover} transition-colors font-medium`}
            >
              Feature
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4 ">
            <ThemeToggle />
            <SignedOut>
              <Button
                variant="outline"
                className={themeStyles.buttonOutline}
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </SignedOut>

            <Button
              className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black hover:opacity-90 transition-opacity"
              asChild
            >
              <Link href="/web/pricing">
                <Zap className="h-4 w-4 mr-2" />
                Get Pricing
              </Link>
            </Button>
            {/* <div className="flex justify-center p-1 gap-1 md:gap-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"> */}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            {/* </div> */}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center justify-center gap-2">
            {/* <div className="flex justify-center p-1 gap-1 md:gap-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"> */}
            <ThemeToggle />
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            {/* </div> */}
            <Button
              variant="ghost"
              className={`md:hidden h-9 w-9 p-0 ${themeStyles.mobileButtonText}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div
            className={`md:hidden py-4 border-t ${themeStyles.mobileBorder}`}
          >
            <div className="flex flex-col space-y-3">
              <Link
                href="/web/UserDashboard"
                className={`${themeStyles.textPrimary} ${themeStyles.textHover} transition-colors font-medium px-2 py-1`}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/web/product"
                className={`${themeStyles.textPrimary} ${themeStyles.textHover} transition-colors font-medium px-2 py-1`}
                onClick={() => setIsOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/web/feature"
                className={`${themeStyles.textPrimary} ${themeStyles.textHover} transition-colors font-medium px-2 py-1`}
                onClick={() => setIsOpen(false)}
              >
                Feature
              </Link>

              <div className="flex flex-col space-y-2 pt-2">
                <SignedOut>
                  <Button
                    variant="outline"
                    className={themeStyles.buttonOutline}
                    asChild
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </SignedOut>

                <Button
                  className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black hover:opacity-90 transition-opacity"
                  asChild
                >
                  <Link href="/web/pricing">
                    <Zap className="h-4 w-4 mr-2" />
                    Get Pricing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
