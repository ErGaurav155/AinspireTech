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
            src="https://ainspiretech.com/chatbotembed.js"
            data-chatbot-config='{"userId":"user_36I2SDrvJ4gvruVPDBJSlvhqQUB","isAuthorized":true,"filename":"https://res.cloudinary.com/dr6yywiz8/raw/upload/v1764680170/scraped-data/criconai.com_1764680165292","chatbotType":"chatbot-lead-generation","apiUrl":"https://ainspiretech.com","primaryColor":"#00F0FF","position":"bottom-right","welcomeMessage":"Hi! How can I Help?","chatbotName":"zilla"}'
          ></Script>
        </body>
      </html>
    </ClerkProvider>
  );
}
