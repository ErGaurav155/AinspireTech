import { NavBar } from "@/components/shared/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Ai Services studio",
  description: "Web dev,ai agent,chatbots in best quality",
  keywords: ["Ai chatbots for local business,Local business ai solutions,"],
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className=" no-scrollbar">
      <NavBar />

      {children}

      <Toaster />
    </main>
  );
};

export default Layout;
