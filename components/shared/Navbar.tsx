"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/assets/img/logo.png";
import { SignedIn, SignedOut, useAuth, UserButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { getUserById } from "@/lib/action/user.actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
type Checked = DropdownMenuCheckboxItemProps["checked"];

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOwn, setIsOwn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("home");
  const [showInstaBar, setShowInstaBar] = useState<Checked>(false);
  const [showWebBar, setShowWebBar] = useState<Checked>(false);
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme || "light";

  const themeStyles = useMemo(() => {
    const isDark = currentTheme === "dark";
    return {
      cardBg: isDark ? "bg-transparent" : "bg-white/50",
      textPrimary: isDark ? "text-gray-300" : "text-n-5",
    };
  }, [currentTheme]);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isOwner = async () => {
      if (!userId) return;

      try {
        const userInfo = await getUserById(userId);
        const response = await fetch(
          `/api/admin/verify-owner?email=${userInfo.email}`
        );
        const ownerId = await response.json();
        setIsOwn(ownerId.isOwner);
      } catch (error) {
        console.error("Error checking owner status:", error);
      }
    };
    if (!isLoaded) {
      return; // Wait for auth to load
    }
    if (userId) {
      isOwner();
    }
  }, [userId, isLoaded]);

  const navItems = [
    { id: "insta", label: "Insta", href: "/insta" },
    { id: "web", label: "Web", href: "/web" },
    { id: "review", label: "Review", href: "/Review" },
  ];

  const handleNavClick = (id: string) => {
    setActiveNavItem(id);
    setIsMenuOpen(false);
  };
  if (!isLoaded) {
    return (
      <div className={`min-h-screen  flex items-center justify-center `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <header
      className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b transition-all duration-300 ${
        themeStyles.cardBg
      } ${isScrolled ? "rounded-lg shadow-md" : "rounded-none"}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between gap-2 items-center">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
          onClick={() => handleNavClick("home")}
        >
          <div className="relative h-7 w-7 md:w-10 md:h-10 mr-1 md:mr-3">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] animate-pulse"></div>
            <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
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
              className={`nav-link font-medium relative group  cursor-pointer ${
                activeNavItem === item.id
                  ? "text-[#00F0FF]"
                  : `${themeStyles.textPrimary}`
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

        {/* Auth Buttons & Theme Toggle */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Theme Toggle */}

          <SignedIn>
            {isOwn ? (
              <>
                <ThemeToggle />

                <button
                  onClick={() => router.push("/admin")}
                  className="hidden md:flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                >
                  <span className="mr-2">Dashboard</span>
                  <ArrowRight className="hidden lg:flex" size={16} />
                </button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer">
                      Dashboards
                      <ArrowRight className="hidden lg:flex" size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuCheckboxItem
                      checked={showInstaBar}
                      onClick={() => router.push("/insta/dashboard")}
                      onCheckedChange={setShowInstaBar}
                    >
                      Insta Automation
                      <ArrowRight className="hidden lg:flex" size={16} />
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={showWebBar}
                      onCheckedChange={setShowWebBar}
                      onClick={() => router.push("/web/UserDashboard")}
                    >
                      Web Chatbots
                      <ArrowRight className="hidden lg:flex" size={16} />
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  onClick={() => router.push("/affiliate")}
                  className="hidden md:flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                >
                  <span className="mr-2">Affiliate</span>
                  <ArrowRight className="hidden lg:flex" size={16} />
                </button>
              </>
            )}
            <div className="block">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <ThemeToggle />

            <button
              onClick={() => router.push("/contactUs")}
              className="hidden md:flex px-4 py-2 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
            >
              Contact Us
            </button>
            <button
              onClick={() => router.push("/sign-in")}
              className="hidden md:flex px-4 py-2 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
            >
              Login
            </button>
          </SignedOut>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl text-[#00F0FF] cursor-pointer rounded-full whitespace-nowrap"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-96" : "max-h-0"
        } bg-background/80 backdrop-blur-sm`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col items-center justify-center max-w-max space-y-4">
          {/* Theme Toggle in Mobile Menu */}

          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`text-foreground font-medium  hover:text-[#00F0FF] transition-colors cursor-pointer ${
                activeNavItem === item.id
                  ? "text-[#00F0FF]"
                  : ` ${themeStyles.textPrimary}`
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
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                >
                  Admin Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      router.push("/web/UserDashboard");
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                  >
                    Web Chatbots
                  </button>
                  <button
                    onClick={() => {
                      router.push("/insta/dashboard");
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                  >
                    Insta Automation
                  </button>
                  <button
                    onClick={() => router.push("/affiliate")}
                    className=" items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                  >
                    <span className="mr-2">Affiliate</span>
                  </button>
                </>
              )}
            </div>
          </SignedIn>

          <SignedOut>
            <button
              onClick={() => {
                router.push("/contactUs");
                setIsMenuOpen(false);
              }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
            >
              Contact Us
            </button>
            <button
              onClick={() => {
                router.push("/sign-in");
                setIsMenuOpen(false);
              }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-medium hover:opacity-90 w-full transition-opacity whitespace-nowrap cursor-pointer"
            >
              Login
            </button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
