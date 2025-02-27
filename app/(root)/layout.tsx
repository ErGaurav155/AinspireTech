import { NavBar } from "@/components/shared/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";

import { MotionDiv } from "@/components/shared/Motion";
import AIChatBot from "@/components/shared/ChatBot";
import AibotCollapse from "@/components/shared/AiBot";

const stagger = 0.25;

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
export const metadata: Metadata = {
  title: "Best Ai Services studio",
  description: "Web dev,ai agent,chatbots in best quality",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="root no-scrollbar ">
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
        className="bg-black "
      >
        <NavBar />

        {children}
        {/* <AIChatBot /> */}
        <AibotCollapse authorised={true} userId={"67922c11cf6a3854412928c3"} />

        <Toaster />
      </MotionDiv>
    </main>
  );
};

export default Layout;
