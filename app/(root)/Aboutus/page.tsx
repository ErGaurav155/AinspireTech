import { Footer } from "@/components/shared/Footer";
import React from "react";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import Features from "@/components/shared/Feature";
import FunFacts from "@/components/shared/FunFact";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "About Us",
  description: "Create Website,ai agent,chatbots in best quality",
  keywords: ["What is an AI phone agent?"],
};
const Galarries = () => {
  return (
    <div className=" mt-10 mx-auto max-w-7xl w-full gap-5  flex flex-col justify-between items-center ">
      <BreadcrumbsDefault />
      <Features />
      <FunFacts />
      <Footer />
    </div>
  );
};

export default Galarries;
