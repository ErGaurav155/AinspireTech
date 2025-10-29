import { AffiliateDashboard } from "@/components/shared/AffiliateDashboard";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { Footer } from "@/components/shared/Footer";
import { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
  title: "Client referrals",
  description: "Create Website,ai agent,chatbots in best quality",
  keywords: ["free ai chatbot"],
};
const referrals = () => {
  return (
    <div className="min-h-screen mt-10 mx-auto max-w-7xl w-full gap-5  flex flex-col justify-between items-center ">
      <BreadcrumbsDefault />
      <AffiliateDashboard />
      <Footer />
    </div>
  );
};

export default referrals;
