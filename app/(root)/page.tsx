import { OurClientReviev } from "@/components/shared/corousel";
import DiscountBanner from "@/components/shared/DiscountBanner";
import Features from "@/components/shared/Feature";
import { Footer } from "@/components/shared/Footer";
import FunFacts from "@/components/shared/FunFact";
import { HeroSlider } from "@/components/shared/HeroSlider";
import OutProduct from "@/components/shared/product";
import TestimonialSection from "@/components/shared/Testimonial";

const Home = async () => {
  return (
    <div className="flex wrapper2 relative bg-transparent  z-10  flex-col gap-1 items-center justify-center">
      <DiscountBanner />
      <HeroSlider />
      <FunFacts />
      <OutProduct />
      <Features />
      <OurClientReviev />
      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Home;
