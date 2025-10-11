"use client";

import { MapPin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "/public/assets/img/logo.png";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Footer() {
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
  // Theme-based styles
  const footerBg = theme === "dark" ? "bg-[#0a0a0a]/10" : "bg-gray-50/80";

  const borderColor =
    theme === "dark" ? "border-[#00F0FF]/30" : "border-blue-300";

  const lightBorderColor =
    theme === "dark" ? "border-[#00F0FF]/10" : "border-gray-200";

  const logoBg = theme === "dark" ? "bg-[#0A0A0A]" : "bg-white";

  const linkText =
    theme === "dark"
      ? "text-gray-300 hover:text-[#00F0FF]"
      : "text-gray-600 hover:text-[#00F0FF]";

  const titleText = theme === "dark" ? "text-white" : "text-gray-900";

  const subtitleText = theme === "dark" ? "text-gray-300" : "text-gray-600";

  const inputBg = theme === "dark" ? "bg-[#0a0a0a]/60" : "bg-white/80";

  const inputBorder =
    theme === "dark" ? "border-[#00F0FF]/30" : "border-blue-300";

  const inputText = theme === "dark" ? "text-white" : "text-gray-900";

  const inputPlaceholder =
    theme === "dark" ? "placeholder-gray-500" : "placeholder-gray-400";

  const iconBg =
    theme === "dark"
      ? "bg-gradient-to-r from-[#00F0FF]/20 to-[#B026FF]/20"
      : "bg-gradient-to-r from-[#00F0FF]/10 to-[#B026FF]/10";

  const copyrightText = theme === "dark" ? "text-gray-400" : "text-gray-500";

  return (
    <footer className={`w-full border-t ${borderColor}`}>
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${footerBg} backdrop-blur-sm`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo and Navigation */}
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-6">
              <Link href="/" className="flex items-center">
                <div className="relative w-10 h-10 mr-3">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] animate-pulse"></div>
                  <div
                    className={`absolute inset-1 rounded-full ${logoBg} flex items-center justify-center`}
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
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
                  Ainpire<span className="text-[#B026FF]">Tech</span>
                </h1>
              </Link>
            </div>
            <ul className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
              {[
                { href: "/contactUs", label: "Contact Us" },
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "/TermsandCondition", label: "Terms & Conditions" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className={`font-normal transition-colors duration-300 ${linkText}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-start gap-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${iconBg}`}>
                <MapPin className="text-[#00F0FF] size-5" />
              </div>
              <div>
                <h3 className={`font-bold ${titleText}`}>Address</h3>
                <p className={subtitleText}>Nashik, IND</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${iconBg}`}>
                <Mail className="text-[#00F0FF] size-5" />
              </div>
              <div>
                <h3 className={`font-bold ${titleText}`}>Contact</h3>
                <a
                  href="mailto:gauravgkhaire@gmail.com"
                  className={`${subtitleText} hover:text-[#00F0FF] transition-colors duration-300 text-sm md:text-base`}
                >
                  gauravgkhaire@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className={`text-xl font-bold ${titleText} mb-4`}>
              Stay Updated
            </h3>
            <div className="relative w-full max-w-md">
              <input
                type="email"
                placeholder="Your email address"
                className={`w-full p-3 rounded-lg ${inputBg} backdrop-blur-sm border ${inputBorder} ${inputText} ${inputPlaceholder} focus:outline-none focus:ring-2 focus:ring-[#00F0FF]`}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-white px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
            <p className={`${subtitleText} text-sm mt-3`}>
              Get the latest updates and offers
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className={`mt-10 pt-6 border-t ${lightBorderColor} text-center`}>
          <p className={copyrightText}>
            © {new Date().getFullYear()} AInspireTech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
