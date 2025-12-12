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

const Home = () => {
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
      <div className="min-h-screen bg-transparent  flex items-center justify-center h-full w-full">
        <div className="w-5 h-5  border-t-transparent rounded-full animate-spin" />
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
    </div>
  );
};

export default Home;
