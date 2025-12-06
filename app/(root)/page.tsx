// app/page.tsx
"use client";

import { BusinessMessagingTemplate } from "@/components/shared/BusinessMessagingTemplate";
import DiscountBanner from "@/components/shared/DiscountBanner";
import StickyScrollFeatures from "@/components/shared/EngagementToolsection";
import { Footer } from "@/components/shared/Footer";
import { AIVoiceAgentShowcase } from "@/components/shared/OurProducts";
import OutProduct from "@/components/shared/product";
import TestimonialSection from "@/components/shared/Testimonial";
import HeroSection from "@/components/web/Hero";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Create a separate client component for the main content
function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      localStorage.setItem("referral_code", ref);
      document.cookie = `referral_code=${ref}; path=/; max-age=604800`;
    }
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="p-2 rounded-md bg-transparent w-full">
        <div className="w-full" />
      </div>
    );
  }

  return (
    <div className="flex wrapper2 relative bg-transparent z-10 flex-col gap-1 items-center justify-center">
      <DiscountBanner />
      <HeroSection />
      <BusinessMessagingTemplate />
      <StickyScrollFeatures />
      <AIVoiceAgentShowcase />
      <OutProduct />
      <TestimonialSection />
      <Footer />
    </div>
  );
}

// Loading component for Suspense fallback
function HomeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Main Home component with Suspense boundary
const Home = () => {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
};

export default Home;
