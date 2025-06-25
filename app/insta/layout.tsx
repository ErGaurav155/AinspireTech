import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/insta/Navbar";
import StarsBackground from "@/components/insta/StarsBackground";
import AIChatBot from "@/components/shared/ChatBot";
import { Footer } from "@/components/shared/Footer";

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

      <AIChatBot />
      <Footer />
      <Toaster />
    </main>
  );
}
