import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import { cn } from "@/lib/utils";

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const orbitron = Orbitron({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AinspireTech",
  description: "Ai-Agent,Web-Dev and Chatbot Agency",
  keywords: ["a i", "a i chatbot"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#624cf5" },
      }}
    >
      <html suppressHydrationWarning lang="en">
        <body className={orbitron.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
