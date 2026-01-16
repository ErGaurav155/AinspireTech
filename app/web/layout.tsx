import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/web/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: " Web Chatbot Services - AinspireTech",
  description: " Professional web chatbot development and integration services",
  keywords: [
    "Web chatbots, chatbot development, web chatbot integration, AinspireTech web services",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin" />
        </div>
      }
    >
      <LayoutContent> {children}</LayoutContent>
    </Suspense>
  );
}

async function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="">
      <Navbar />
      {children}
      <Footer />
      <Toaster />
    </main>
  );
}
