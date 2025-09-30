"use client";

import { MapPin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "/public/assets/img/logo.png";

export function Footer() {
  return (
    <footer className="w-full   border-t border-[#00F0FF]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#0a0a0a]/10 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo and Navigation */}
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-6">
              <Link href="/" className="flex items-center">
                <div className="relative w-10 h-10 mr-3">
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
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
                  Ainpire<span className="text-[#B026FF]">Tech</span>
                </h1>
              </Link>
            </div>
            <ul className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
              {[
                { href: "/Aboutus", label: "About Us" },
                { href: "/contactUs", label: "Contact Us" },
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "/TermsandCondition", label: "Terms & Conditions" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="font-normal text-gray-300 hover:text-[#00F0FF] transition-colors duration-300"
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
              <div className="p-2 rounded-full bg-gradient-to-r from-[#00F0FF]/20 to-[#B026FF]/20">
                <MapPin className="text-[#00F0FF] size-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Address</h3>
                <p className="text-gray-300">Nashik, IND</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-[#00F0FF]/20 to-[#B026FF]/20">
                <Mail className="text-[#00F0FF] size-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Contact</h3>
                <a
                  href="mailto:gauravgkhaire@gmail.com"
                  className="text-gray-300 hover:text-[#00F0FF] transition-colors duration-300 text-sm md:text-base"
                >
                  gauravgkhaire@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold text-white mb-4">Stay Updated</h3>
            <div className="relative w-full max-w-md">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full p-3 rounded-lg bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#00F0FF]/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Get the latest updates and offers
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-[#00F0FF]/10 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} AInspireTech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
