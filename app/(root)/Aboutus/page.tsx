import { Footer } from "@/components/shared/Footer";
import React from "react";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import Features from "@/components/shared/Feature";
import FunFacts from "@/components/shared/FunFact";

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
