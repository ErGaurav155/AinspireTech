import { NavBar } from "@/components/shared/Navbar";
import { Banner } from "@/components/shared/Banner";
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
  title: "AI Tools For Content Creators",
  description: "AI-powered content creation technology for content creators",
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
        className=""
      >
        <Banner />
        <hr className="wrapper2" />
        <NavBar />

        {children}
        <AibotCollapse />

        <Toaster />
      </MotionDiv>
    </main>
  );
};

export default Layout;
