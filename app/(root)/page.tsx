import DiscountBanner from "@/components/shared/DiscountBanner";
import { Footer } from "@/components/shared/Footer";
import FunFacts from "@/components/shared/FunFact";
import OutProduct from "@/components/shared/product";
import TestimonialSection from "@/components/shared/Testimonial";
import HeroSection from "@/components/web/Hero";
import { FeatureSection } from "@/components/insta/Feature";
import { FeatureShowcase } from "@/components/web/FeatureShowcase";
import { ClientShowcase } from "@/components/web/ClientShowcase";

const Home = async () => {
  return (
    <div className="flex wrapper2 relative bg-transparent  z-10  flex-col gap-1 items-center justify-center">
      <DiscountBanner />
      <HeroSection />
      {/* <FeatureSection />
      <ClientShowcase />
      <FeatureShowcase /> */}
      <FunFacts />
      <OutProduct />
      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Home;
