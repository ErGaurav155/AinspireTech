"use client";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import Faq from "@/components/shared/Faq";
import { AIAgentHero } from "@/components/web/AiAgentHero";
import { SetupProcess } from "@/components/web/setupProcess";
import FeatureComparisonTable from "@/components/web/WebPriceComparison";
import WebTestimonialsSection from "@/components/web/WebTestimonialSection";
import WebFeaturesGrid from "@/components/web/WebFeatureGrid";
import { WebCTASection } from "@/components/web/WebCta";
import { useEffect, useState } from "react";
export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-2 rounded-md bg-transparent w-full">
        <div className="w-full" />
      </div>
    );
  }
  return (
    <div className="min-h-screen max-w-7xl m-auto  ">
      {/* Hero Section */}
      <BreadcrumbsDefault />
      <AIAgentHero />
      <SetupProcess />
      <div className="container mx-auto px-4 py-20">
        <WebFeaturesGrid />
        <FeatureComparisonTable />
        <WebTestimonialsSection />
        <WebCTASection />
        <Faq />
      </div>
    </div>
  );
}
