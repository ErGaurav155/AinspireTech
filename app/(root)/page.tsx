import { OurClientReviev } from "@/components/shared/corousel";
import Features from "@/components/shared/Feature";
import { Footer } from "@/components/shared/Footer";
import FunFacts from "@/components/shared/FunFact";
import { HeroSlider } from "@/components/shared/HeroSlider";
import OutProduct from "@/components/shared/product";
import Service from "@/components/shared/Service";
import TestimonialSection from "@/components/shared/Testimonial";

const Home = async () => {
  return (
    <div className="flex wrapper2  flex-col gap-10 items-center justify-center">
      <HeroSlider />
      <FunFacts />
      <OutProduct />
      <Service />
      <Features />
      <OurClientReviev />
      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Home;
