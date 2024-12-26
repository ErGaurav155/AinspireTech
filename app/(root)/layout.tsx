import { NavBar } from "@/components/shared/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";

import AibotCollapse from "@/components/shared/AiBot";
import { MotionDiv } from "@/components/shared/Motion";
const stagger = 0.25;

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
export const metadata: Metadata = {
  title: "Best Web Services available",
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
        <AibotCollapse />

        <Toaster />
      </MotionDiv>
    </main>
  );
};

export default Layout;
