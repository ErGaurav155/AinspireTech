"use client";

import { BusinessMessagingTemplate } from "@/components/shared/BusinessMessagingTemplate";
import DiscountBanner from "@/components/shared/DiscountBanner";
import StickyScrollFeatures from "@/components/shared/EngagementToolsection";
import { Footer } from "@/components/shared/Footer";
import { AIVoiceAgentShowcase } from "@/components/shared/OurProducts";
import OutProduct from "@/components/shared/product";
import TestimonialSection from "@/components/shared/Testimonial";
import HeroSection from "@/components/web/Hero";
import { useEffect, useState } from "react";
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

      // Store in localStorage or sessionStorage for later use
      localStorage.setItem("referral_code", ref);

      // Optionally, store in a cookie
      document.cookie = `referral_code=${ref}; path=/; max-age=604800`; // 7 days
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
    <div className="flex wrapper2 relative bg-transparent  z-10  flex-col gap-1 items-center justify-center">
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
};

export default Home;
