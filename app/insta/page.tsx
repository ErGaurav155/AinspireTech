"use client";

import React, { useEffect, useState } from "react";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import Faq from "@/components/shared/Faq";
import ComparisonTable from "@/components/insta/ComparisonTable";
import { FeatureSection } from "@/components/insta/Feature";
import { ClientShowcase } from "@/components/web/ClientShowcase";
import { FeatureShowcase } from "@/components/web/FeatureShowcase";
import InstaFeaturesGrid from "@/components/insta/InstaFeatureGrid";
import InstaTestimonialsSection from "@/components/insta/InstaTestimonialSection";
import InstaHowItWorksSection from "@/components/insta/InstaWorkFlow";
import InstaCTASection from "@/components/insta/InstaCta";
import { InstagramAutomationHero } from "@/components/insta/InstaHeroSection";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-transparent  flex items-center justify-center h-full w-full">
        <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen max-w-7xl m-auto ">
      <BreadcrumbsDefault />
      {/* Hero Section */}
      <div className="container mx-auto px-4 pb-20">
        <InstagramAutomationHero />
        <InstaHowItWorksSection />
        <InstaFeaturesGrid />
        <FeatureSection />
        <ClientShowcase />
        <FeatureShowcase />
        <ComparisonTable />
        <InstaTestimonialsSection />
        <InstaCTASection />
        <Faq />
      </div>
    </div>
  );
}
