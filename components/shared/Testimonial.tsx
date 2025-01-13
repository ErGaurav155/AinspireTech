"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { testimonials } from "@/constant";

export function TestimonialSection() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  // Create pairs of testimonials (two per item)
  const testimonialPairs = [];
  for (let i = 0; i < testimonials.length; i += 2) {
    testimonialPairs.push(testimonials.slice(i, i + 2));
  }

  return (
    <section className="w-[90vw] py-16">
      <div className="container mx-auto ">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-white">
            We served over 5000+ customers
          </h2>
          <div className="w-16 h-1 bg-blue-500 mx-auto my-4"></div>
          <p className="text-lg text-white">
            We are satisfying our customers every day since Last 10+ Years.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <Carousel
          plugins={[plugin.current]}
          className="w-full "
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {testimonialPairs.map((pair, index) => (
              <CarouselItem
                key={index}
                className="flex gap-4 items-start justify-center "
              >
                {/* First Testimonial in Pair */}
                <div className="p-1 flex-auto ">
                  <Card className="bg-gray-900 bg-opacity-50 border-none py-10">
                    <CardContent className=" flex flex-col items-start justify-center space-x-6 ">
                      <div className="flex gap-4 items-center justify-between ">
                        <div className="w-20 h-20 rounded-full overflow-hidden">
                          <Image
                            src={pair[0].image}
                            alt={`Testimonial ${pair[0].id}`}
                            width={200}
                            height={200}
                            className="w-full h-full rounded-lg object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <h4 className="   text-base font-semibold text-white">
                            {pair[0].title}
                          </h4>
                          <span className="text-sm text-white">
                            {pair[0].name}
                          </span>
                        </div>
                      </div>
                      <p className="mt-4 text-white">{pair[0].text}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Second Testimonial in Pair */}
                {pair[1] && (
                  <div className="hidden  md:flex  p-1 flex-auto ">
                    <Card className="border-none py-10 bg-gray-900 bg-opacity-50">
                      <CardContent className=" flex flex-col items-start justify-center space-x-6   ">
                        <div className="flex gap-4 items-center justify-start">
                          <div className=" h-10 w-10  md:w-20 md:h-20 rounded-full overflow-hidden">
                            <Image
                              src={pair[1].image}
                              alt={`Testimonial ${pair[1].id}`}
                              width={200}
                              height={200}
                              className="w-full h-full rounded-lg object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-white">
                              {pair[1].title}
                            </h4>
                            <span className="text-sm text-white">
                              {pair[1].name}
                            </span>
                          </div>
                        </div>
                        <p className="mt-4 text-white">{pair[1].text}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-600" />
          <CarouselNext className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-600" />
        </Carousel>
      </div>
    </section>
  );
}

export default TestimonialSection;
