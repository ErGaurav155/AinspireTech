import { Footer } from "@/components/shared/Footer";
import { NavBar } from "@/components/shared/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Ai Services studio",
  description: "Web dev,ai agent,chatbots in best quality",
  keywords: ["Ai chatbots for local business,Local business ai solutions,"],
};
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
        </div>
      }
    >
      <LayoutContent> {children}</LayoutContent>
    </Suspense>
  );
}

async function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="no-scrollbar">
      <NavBar />
      {children}
      <Footer />
      <Toaster />
    </main>
  );
}
