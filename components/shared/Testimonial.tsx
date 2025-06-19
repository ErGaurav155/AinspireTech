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
    <section className="w-full py-16 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
            We served over 5000+ customers
          </h2>
          <div className="flex justify-center my-6">
            <div className="w-20 h-1 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full"></div>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We are satisfying our customers every day since Last 10+ Years.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <Carousel
          plugins={[plugin.current]}
          className="w-full max-w-6xl mx-auto"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {testimonialPairs.map((pair, index) => (
              <CarouselItem
                key={index}
                className="md:basis-1/2 lg:basis-1/3 p-4"
              >
                <div className="grid grid-cols-1 gap-6">
                  {pair.map((testimonial) => (
                    <Card
                      key={testimonial.id}
                      className="bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#00F0FF]/30 rounded-xl hover:border-[#B026FF] transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-6">
                          <div className="flex gap-4 items-center">
                            <div className="relative">
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] animate-pulse"></div>
                              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
                                <Image
                                  src={testimonial.image}
                                  alt={`Testimonial ${testimonial.id}`}
                                  width={64}
                                  height={64}
                                  className="rounded-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-white">
                                {testimonial.title}
                              </h4>
                              <span className="text-sm text-gray-300">
                                {testimonial.name}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-300">{testimonial.text}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}

export default TestimonialSection;
