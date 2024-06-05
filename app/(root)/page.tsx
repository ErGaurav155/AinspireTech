import Roadmap from "@/components/JsmComp/Roadmap";
import Services from "@/components/JsmComp/Services";
import { Faq } from "@/components/shared/Faq";
import { Footer } from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import Promo from "@/components/shared/Promotion";
import Heading from "@/components/shared/Svgs/HEading";
import { TabsDemo } from "@/components/shared/ToolsTab";
import {
  CarouselAiimages,
  CarouselChannel,
  CarouselPoster,
  CarouselThumbnail,
} from "@/components/shared/carousel";
import { Button } from "@/components/ui/button";

import { ArrowBigRight, RocketIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Home = async () => {
  return (
    <div className="wrapper pb-8 lg:pb-10">
      <Button className="text-white bg-green-800 hover:bg-[#1c7429] rounded-md self-start w-full  cursor-default  max-h-min  mt-2 overflow-hidden">
        <Link
          href={"/credits"}
          className="flex animate-scroll-left whitespace-nowrap "
        >
          Get
          <span className="text-yellow-500"> &nbsp;250 Free &nbsp;</span>
          Credits For First 100 premium package purchase &nbsp;
          <RocketIcon color="yellow" />
        </Link>
      </Button>

      <div className="flex  flex-col gap-10 items-center m-auto justify-center">
        <section className="bg-[#FCF8F1] bg-opacity-30 pt-4">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
              <div>
                <h1 className="mt-4 text-3xl font-bold text-black lg:mt-8 sm:text-3xl md:text-4xl xl:text-6xl">
                  10X Booost Your Youtube Growth
                </h1>
                <p className="mt-4 text-base text-black lg:mt-8 sm:text-xl">
                  Cricon AI Platform for Content Creation
                </p>

                <Link
                  href="/criconai/longvid/idea"
                  className="inline-flex items-center px-6 py-4 mt-2 font-semibold text-white transition-all duration-200 bg-[#73257a] rounded-full lg:mt-3 hover:bg-[#bb76c2] focus:bg-[#bb76c2] "
                  role="button"
                >
                  Start for free
                  <ArrowBigRight />
                </Link>
              </div>

              <div className="w-full">
                <Image
                  src="/assets/MyHero.png"
                  height={869}
                  width={1139}
                  alt="carousel"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#7e7c77] bg-opacity-30 p-4 rounded-lg">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid items-center grid-cols-1 gap-8 md:gap-12 md:grid-cols-2">
              <div>
                <h1 className="mt-4 text-xl font-bold text-black lg:mt-8 sm:text-2xl md:text-3xl xl:text-5xl">
                  Using Ai Tools
                </h1>
                <p className="mt-4 text-base text-black lg:mt-8 sm:text-2xl ">
                  Channels Makes 5k-10k Per video
                </p>

                <Link
                  href="/credits"
                  className="inline-flex items-center px:4 py-2 lg:px-6 lg:py-4 mt-2 font-normal md:font-semibold text-white transition-all duration-200 bg-[#3a3ccf] rounded-full lg:mt-3 hover:bg-[#4c8eeb] focus:bg-[#90a1cd] "
                  role="button"
                >
                  Grab Opportunity Now
                  <ArrowBigRight />
                </Link>
              </div>

              <CarouselChannel />
            </div>
          </div>
        </section>
        <TabsDemo />
        <div className="flex flex-col-reverse gap-5">
          <section className="bg-[#cfe4e2] bg-opacity-30 p-4 rounded-lg">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
                <div>
                  <p className="mt-4 text-base text-black lg:mt-8 sm:text-2xl pb-10">
                    Cricon Ai Generated Posters
                  </p>
                  <Link
                    href="/credits"
                    className="inline-flex items-center px-6 py-4 mt-2 font-semibold text-white transition-all duration-200 bg-[#3a3ccf] rounded-full lg:mt-3 hover:bg-[#4c8eeb] focus:bg-[#90a1cd] "
                    role="button"
                  >
                    Make Posters
                    <ArrowBigRight />
                  </Link>
                </div>

                <div className="w-full rounded-lg">
                  <CarouselPoster />
                </div>
              </div>
            </div>
          </section>
          <section className="bg-[#cfe4e2] bg-opacity-30 p-4 rounded-lg">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
                <div className="w-full rounded-lg">
                  <CarouselAiimages />{" "}
                </div>
                <div>
                  <p className="mt-4 text-base text-black lg:mt-8 sm:text-2xl pb-10">
                    Cricon Ai Generated Images
                  </p>
                  <Link
                    href="/credits"
                    className="inline-flex items-center px-6 py-4 mt-2 font-semibold text-white transition-all duration-200 bg-[#3a3ccf] rounded-full lg:mt-3 hover:bg-[#4c8eeb] focus:bg-[#90a1cd] "
                    role="button"
                  >
                    Make AiImages
                    <ArrowBigRight />
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <section className="bg-[#cfe4e2] bg-opacity-30 p-4 rounded-lg">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
                <div>
                  <p className="mt-4 text-base text-black lg:mt-8 sm:text-2xl pb-10">
                    Cricon Ai Generated Thumbnails
                  </p>

                  <Link
                    href="/credits"
                    className="inline-flex items-center px-6 py-4 mt-2 font-semibold text-white transition-all duration-200 bg-[#3a3ccf] rounded-full lg:mt-3 hover:bg-[#4c8eeb] focus:bg-[#90a1cd] "
                    role="button"
                  >
                    Make Thumbnail
                    <ArrowBigRight />
                  </Link>
                </div>

                <div className="w-full rounded-lg">
                  <CarouselThumbnail />
                </div>
              </div>
            </div>
          </section>
        </div>

        <Promo />
        <Services />
        <Roadmap />
        <Faq />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
