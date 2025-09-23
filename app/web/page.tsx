import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import Faq from "@/components/shared/Faq";
import { AIAgentHero } from "@/components/web/AiAgentHero";
import { SetupProcess } from "@/components/web/setupProcess";
import FeatureComparisonTable from "@/components/web/WebPriceComparison";
import WebTestimonialsSection from "@/components/web/WebTestimonialSection";
import WebFeaturesGrid from "@/components/web/WebFeatureGrid";
import { WebCTASection } from "@/components/web/WebCta";
export default function Home() {
  return (
    <div className="min-h-screen max-w-7xl m-auto text-white ">
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
