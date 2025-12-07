import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
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
      <TestimonialSection />
    </div>
  );
};

export default Tesimonials;
