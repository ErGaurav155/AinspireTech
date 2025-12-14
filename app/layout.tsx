import type { Metadata } from "next";
import { Orbitron, Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import StarsBackground from "@/components/insta/StarsBackground";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

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
        variables: {
          colorPrimary: "#624cf5",
          fontFamily: "Montserrat, sans-serif",
        },
      }}
    >
      <html suppressHydrationWarning lang="en">
        <body
          className={cn(
            orbitron.variable,
            montserrat.variable,
            "font-orbitron min-h-screen bg-background  text-foreground transition-colors duration-300"
          )}
        >
          <ThemeProvider>
            <StarsBackground />
            <div className="relative z-10">{children}</div>
          </ThemeProvider>

          <Script
            src="/mcqchatbotembed.js"
            data-mcq-chatbot='{"userId":"user_32gfPkz04sXmH5xzFQKyZvqib4Q","isAuthorized":true,"filename":"https://res.cloudinary.com/dr6yywiz8/raw/upload/v1764154827/scraped-data/ainspiretech.com_1764154824955","chatbotType":"chatbot-education","apiUrl":"https://ainspiretech.com","primaryColor":"#00F0FF","position":"bottom-right","welcomeMessage":"Hi,How May i help you?","chatbotName":"AI Assistance"}'
          ></Script>
          <Script
            src="https://ainspiretech.com/chatbotembed.js"
            data-chatbot-config='{
  "userId":"user_328V3WlNVA2BBN4beOvOAS9FxHV",
  "isAuthorized":true,
  "filename":"undefined",
  "chatbotType":"chatbot-lead-generation",
  "apiUrl":"https://ainspiretech.com",
  "primaryColor":"#00F0FF",
  "position":"bottom-right",
  "welcomeMessage":"Hi,How May i help you?",
  "chatbotName":"AI Assistance"
}'
          ></Script>
        </body>
      </html>
    </ClerkProvider>
  );
}
