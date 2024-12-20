import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import Features from "@/components/shared/Feature";
import { Footer } from "@/components/shared/Footer";
import FunFacts from "@/components/shared/FunFact";
import TestimonialSection from "@/components/shared/Testimonial";
import React from "react";

const Tesimonials = () => {
  return (
    <div className=" mt-10 mx-auto max-w-7xl w-full gap-5  flex flex-col justify-between items-center ">
      <BreadcrumbsDefault />
      <Features />
      <FunFacts />

      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Tesimonials;
