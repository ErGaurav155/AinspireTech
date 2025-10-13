"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { testimonials } from "@/constant";
import useEmblaCarousel from "embla-carousel-react";
import Autoscroll from "embla-carousel-auto-scroll";
import { useTheme } from "next-themes";

export function TestimonialSection() {
  const { theme } = useTheme();

  // Theme-based styles
  const cardBg = theme === "dark" ? "bg-[#0a0a0a]/60" : "bg-white/80";

  const cardBorder =
    theme === "dark"
      ? "border-[#00F0FF]/30 hover:border-[#B026FF]"
      : "border-blue-200 hover:border-purple-400";

  const titleText = theme === "dark" ? "text-white" : "text-n-5";

  const subtitleText = theme === "dark" ? "text-gray-300" : "text-n-5";

  const descriptionText = theme === "dark" ? "text-gray-300" : "text-n-5";

  const sectionText = theme === "dark" ? "text-gray-300" : "text-n-5";

  const avatarBg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-white";

  // Forward scrolling carousel (left to right)
  const [emblaRefForward] = useEmblaCarousel(
    {
      loop: true,
    },
    [
      Autoscroll({
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        direction: "forward",
      }),
    ]
  );

  // Backward scrolling carousel (right to left)
  const [emblaRefBackward] = useEmblaCarousel(
    {
      loop: true,
    },
    [
      Autoscroll({
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        direction: "backward",
      }),
    ]
  );

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="w-full py-10 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          {/* <motion.div
            className="flex items-center justify-center text-[#00F0FF] mb-4"
            variants={titleVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            <span className="text-sm font-medium uppercase tracking-widest border border-[#00F0FF]/30 rounded-full px-4 py-1">
              CUSTOMER REVIEW{" "}
            </span>
          </motion.div> */}
          <motion.div
            className={`inline-flex items-center text-blue-600 border border-blue-400/50} rounded-full px-4 py-1 mb-4`}
            variants={titleVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            <span className="text-sm font-medium"> CUSTOMER REVIEW</span>
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
            We served over 5000+ customers
          </h2>
          <div className="flex justify-center my-6">
            <div className="w-20 h-1 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full"></div>
          </div>
          <p
            className={`text-lg ${sectionText} max-w-2xl mx-auto font-montserrat`}
          >
            We are satisfying our customers every day since Last 10+ Years.
          </p>
        </div>

        {/* Forward Direction Carousel (Left to Right) */}
        <div className="mb-12">
          <div ref={emblaRefForward} className="overflow-hidden w-full">
            <div className="flex">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-4"
                >
                  <Card
                    className={`${cardBg} backdrop-blur-sm border ${cardBorder} rounded-xl transition-all`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-center">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] animate-pulse"></div>
                            <div
                              className={`relative w-16 h-16 rounded-full overflow-hidden ${avatarBg} flex items-center justify-center`}
                            >
                              <Image
                                src={testimonial.image}
                                alt={`Testimonial ${testimonial.id}`}
                                fill
                                sizes="100%"
                                className="rounded-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          </div>
                          <div>
                            <h4
                              className={`text-xs md:text-lg font-medium ${titleText}`}
                            >
                              {testimonial.title}
                            </h4>
                            <span
                              className={`text-xs md:text-sm ${subtitleText}`}
                            >
                              {testimonial.name}
                            </span>
                          </div>
                        </div>
                        <p
                          className={`${descriptionText} h-[10rem] overflow-y-auto no-scrollbar font-montserrat`}
                        >
                          {testimonial.text}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Backward Direction Carousel (Right to Left) */}
        <div>
          <div ref={emblaRefBackward} className="overflow-hidden w-full">
            <div className="flex">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-4"
                >
                  <Card
                    className={`${cardBg} backdrop-blur-sm border ${cardBorder} rounded-xl transition-all`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-center">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] animate-pulse"></div>
                            <div
                              className={`relative w-16 h-16 rounded-full overflow-hidden ${avatarBg} flex items-center justify-center`}
                            >
                              <Image
                                src={testimonial.image}
                                alt={`Testimonial ${testimonial.id}`}
                                fill
                                sizes="100%"
                                className="rounded-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          </div>
                          <div>
                            <h4
                              className={`text-xs md:text-lg font-medium ${titleText}`}
                            >
                              {testimonial.title}
                            </h4>
                            <span
                              className={`text-xs md:text-sm ${subtitleText}`}
                            >
                              {testimonial.name}
                            </span>
                          </div>
                        </div>
                        <p
                          className={`${descriptionText} h-[10rem] overflow-y-auto no-scrollbar font-montserrat`}
                        >
                          {testimonial.text}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialSection;
