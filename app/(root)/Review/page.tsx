import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { OurClientReviev } from "@/components/shared/corousel";
import { Footer } from "@/components/shared/Footer";
import TestimonialSection from "@/components/shared/Testimonial";
import { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
  title: "Client Review",
  description: "Create Website,ai agent,chatbots in best quality",
  keywords: ["free ai chatbot"],
};
const Tesimonials = () => {
  return (
    <div className=" mt-10 mx-auto max-w-7xl w-full gap-5  flex flex-col justify-between items-center ">
      <BreadcrumbsDefault />
      <OurClientReviev />
      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Tesimonials;
