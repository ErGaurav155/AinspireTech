import { BusinessMessagingTemplate } from "@/components/shared/BusinessMessagingTemplate";
import DiscountBanner from "@/components/shared/DiscountBanner";
import StickyScrollFeatures from "@/components/shared/EngagementToolsection";
import { Footer } from "@/components/shared/Footer";
import FunFacts from "@/components/shared/FunFact";
import { AIVoiceAgentShowcase } from "@/components/shared/OurProducts";
import OutProduct from "@/components/shared/product";
import TestimonialSection from "@/components/shared/Testimonial";
import HeroSection from "@/components/web/Hero";

const Home = async () => {
  return (
    <div className="flex wrapper2 relative bg-transparent  z-10  flex-col gap-1 items-center justify-center">
      <DiscountBanner />
      <HeroSection />
      <BusinessMessagingTemplate />
      <StickyScrollFeatures />
      <AIVoiceAgentShowcase />
      <FunFacts />
      {/* <OutProduct /> */}
      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Home;
