import { NavBar } from "@/components/shared/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";

import { MotionDiv } from "@/components/shared/Motion";
import AIChatBot from "@/components/shared/ChatBot";

const stagger = 0.25;

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
export const metadata: Metadata = {
  title: "Best Ai Services studio",
  description: "Web dev,ai agent,chatbots in best quality",
  keywords: ["Ai chatbots for local business,Local business ai solutions,"],
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className=" no-scrollbar ">
      <MotionDiv
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{
          delay: stagger,
          ease: "easeInOut",
          duration: 0.5,
        }}
        viewport={{ amount: 0 }}
        className=" "
      >
        <NavBar />

        {children}
        <AIChatBot />
        <Toaster />
      </MotionDiv>
    </main>
  );
};

export default Layout;
