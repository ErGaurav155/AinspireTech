import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  Instagram,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
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
  return (
    <div className="min-h-screen max-w-7xl m-auto text-white">
      <BreadcrumbsDefault />
      {/* Hero Section */}
      <div className="container mx-auto px-4 pb-20">
        <InstagramAutomationHero />
        <InstaFeaturesGrid />
        <FeatureSection />
        <ClientShowcase />
        <FeatureShowcase />
        <InstaHowItWorksSection />
        <ComparisonTable />
        <InstaTestimonialsSection />
        <InstaCTASection />
        <Faq />
      </div>
    </div>
  );
}
