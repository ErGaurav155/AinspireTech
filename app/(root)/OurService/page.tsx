import { Footer } from "@/components/shared/Footer";
import React from "react";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import ServicesTabs from "@/components/shared/ServiceTool";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "OurServices",
  description: "Create Website,ai agent,chatbots in best quality",
};
const Doctors = () => (
  <div className=" mt-10 mx-auto max-w-7xl w-full gap-5  flex flex-col justify-center items-center ">
    <BreadcrumbsDefault />
    <ServicesTabs />
    <Footer />
  </div>
);

export default Doctors;
