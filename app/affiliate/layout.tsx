import type { Metadata } from "next";
import { Footer } from "@/components/shared/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

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
    <main className="">
      {children}
      <Footer />
      <Toaster />
    </main>
  );
}
