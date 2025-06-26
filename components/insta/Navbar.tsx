"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Logo from "/public/assets/img/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
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
          {/* <Link
            href="/"
            className="flex items-center space-x-1 lg:space-x-2 group"
          >
            <div className="relative">
              <Instagram className="h-8 w-8 text-[#00F0FF] group-hover:text-[#B026FF] transition-colors" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#FF2E9F] rounded-full animate-pulse" />
            </div>
            <span className="text-lg lg:text-xl font-bold gradient-text-main">
              InstaBot
            </span>
          </Link> */}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-8 text-sm lg:text-lg">
            <Link
              href="/insta/dashboard"
              className="text-gray-300 hover:text-[#00F0FF] transition-colors font-normal"
            >
              Dashboard
            </Link>
            <Link
              href="/insta/accounts"
              className="text-gray-300 hover:text-[#00F0FF] transition-colors font-medium"
            >
              Accounts
            </Link>
            <Link
              href="/insta/templates"
              className="text-gray-300 hover:text-[#00F0FF] transition-colors font-medium"
            >
              Templates
            </Link>
            <Link
              href="/insta/analytics"
              className="text-gray-300 hover:text-[#00F0FF] transition-colors font-medium"
            >
              Analytics
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <SignedOut>
              <Button
                variant="outline"
                className="border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10"
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </SignedOut>
            <Button
              className="btn-gradient-cyan hover:opacity-90 transition-opacity"
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

          <div className=" flex md:hidden items-center justify-center gap-2">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <Button
              variant="ghost"
              className="md:hidden h-9 w-9 p-0 text-white"
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
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-3">
              <Link
                href="/insta/dashboard"
                className="text-gray-300 hover:text-[#00F0FF] transition-colors font-medium px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/insta/accounts"
                className="text-gray-300 hover:text-[#00F0FF] transition-colors font-medium px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Accounts
              </Link>
              <Link
                href="/insta/templates"
                className="text-gray-300 hover:text-[#00F0FF] transition-colors font-medium px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Templates
              </Link>
              <Link
                href="/insta/analytics"
                className="text-gray-300 hover:text-[#00F0FF] transition-colors font-medium px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Analytics
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                <SignedOut>
                  <Button
                    variant="outline"
                    className="border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10"
                    asChild
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </SignedOut>

                <Button
                  className="btn-gradient-cyan hover:opacity-90 transition-opacity"
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
