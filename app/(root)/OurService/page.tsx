import { Footer } from "@/components/shared/Footer";
import React from "react";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import ServicesTabs from "@/components/shared/ServiceTool";

const Doctors = () => (
  <div className=" mt-10 mx-auto max-w-7xl w-full gap-5  flex flex-col justify-between items-center ">
    <BreadcrumbsDefault />
    <ServicesTabs />
    <Footer />
  </div>
);

export default Doctors;
