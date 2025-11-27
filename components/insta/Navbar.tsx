"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Logo from "@/public/assets/img/logo.png";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-md bg-gray-200 dark:bg-gray-800">
        <div className="w-5 h-5" />
      </button>
    );
  }
  // Theme-based styles (only after mounted)
  const navBg = theme === "dark" ? "bg-[#0a0a0a]/80" : "bg-white/80";
  const borderColor = theme === "dark" ? "border-white/10" : "border-gray-200";
  const logoBg = theme === "dark" ? "bg-[#0A0A0A]" : "bg-white";
  const linkText =
    theme === "dark"
      ? "text-gray-300 hover:text-[#00F0FF]"
      : "text-n-5 hover:text-[#00F0FF]";
  const outlineButton =
    theme === "dark"
      ? "border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10"
      : "border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/5";
  const mobileMenuBg = theme === "dark" ? "border-white/10" : "border-gray-200";
  const mobileButton = theme === "dark" ? "text-white" : "text-gray-700";

  return (
    <nav
      className={`${navBg} backdrop-blur-md border-b ${borderColor} sticky top-0 z-50 transition-colors duration-300`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-7 w-7 md:w-10 md:h-10 mr-1 md:mr-3">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] animate-pulse"></div>
              <div
                className={`absolute inset-1 rounded-full ${logoBg} flex items-center justify-center transition-colors duration-300`}
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
              href="/insta/dashboard"
              className={`transition-colors font-medium ${linkText}`}
            >
              Dashboard
            </Link>
            <Link
              href="/insta/accounts"
              className={`transition-colors font-medium ${linkText}`}
            >
              Accounts
            </Link>
            <Link
              href="/insta/templates"
              className={`transition-colors font-medium ${linkText}`}
            >
              Templates
            </Link>
            <Link
              href="/insta/analytics"
              className={`transition-colors font-medium ${linkText}`}
            >
              Analytics
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <ThemeToggle />
            <SignedOut>
              <Button
                variant="outline"
                className={` hover:opacity-90 transition-opacity ${outlineButton} `}
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </SignedOut>
            <Button
              className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black hover:opacity-90 transition-opacity"
              asChild
            >
              <Link href="/insta/pricing">
                <Zap className="h-4 w-4 mr-2" />
                Get Pricing
              </Link>
            </Button>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center justify-center gap-2">
            <ThemeToggle />
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <Button
              variant="ghost"
              className={`md:hidden h-9 w-9 p-0 ${mobileButton}`}
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
          <div className={`md:hidden py-4 border-t ${mobileMenuBg}`}>
            <div className="flex flex-col space-y-3">
              <Link
                href="/insta/dashboard"
                className={`transition-colors font-medium px-2 py-1 ${linkText}`}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/insta/accounts"
                className={`transition-colors font-medium px-2 py-1 ${linkText}`}
                onClick={() => setIsOpen(false)}
              >
                Accounts
              </Link>
              <Link
                href="/insta/templates"
                className={`transition-colors font-medium px-2 py-1 ${linkText}`}
                onClick={() => setIsOpen(false)}
              >
                Templates
              </Link>
              <Link
                href="/insta/analytics"
                className={`transition-colors font-medium px-2 py-1 ${linkText}`}
                onClick={() => setIsOpen(false)}
              >
                Analytics
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                <SignedOut>
                  <Button
                    variant="outline"
                    className={`hover:opacity-90 transition-opacity ${outlineButton}`}
                    asChild
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </SignedOut>

                <Button
                  className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black hover:opacity-90 transition-opacity"
                  asChild
                >
                  <Link href="/insta/pricing">
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
