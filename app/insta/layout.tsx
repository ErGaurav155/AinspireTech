import type { Metadata } from "next";
import Navbar from "@/components/insta/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "InstaReply Pro - Instagram Auto-Reply Management",
  description:
    "Professional Instagram comment automation and reply management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="">
      <Navbar />
      <main>{children}</main>

      <Footer />
      <Toaster />
    </main>
  );
}
