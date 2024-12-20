"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import useEmblaCarousel from "embla-carousel-react";
import Autoscroll from "embla-carousel-auto-scroll";
import img2 from "@/public/assets/Webapp/HomeInterior.jpg";
import img3 from "@/public/assets/Webapp/Medical.jpg";
import img4 from "@/public/assets/Webapp/digitalmarketing.jpg";
import img5 from "@/public/assets/Webapp/fitness.jpg";
import img6 from "@/public/assets/Webapp/it-website.webp";
import img7 from "@/public/assets/Webapp/pathology.jpg";
import img1 from "@/public/assets/Webapp/retail.jpg";
import { User2Icon } from "lucide-react";

const imagesWithTitles = [
  { img: img1, title: "Retail ", rating: 4 },
  { img: img6, title: "IT ", rating: 5 },
  { img: img7, title: "Pathology ", rating: 3 },
  { img: img2, title: "HomeInterior ", rating: 4 },
  { img: img3, title: "Medical ", rating: 4 },
  { img: img4, title: "DigiMarketing ", rating: 5 },
  { img: img5, title: "Fitness", rating: 4 },
];

export function OurClient() {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      // Enable infinite looping
    },

    [
      Autoscroll({
        speed: 0.5,
      }),
    ]
  );

  return (
    <div
      ref={emblaRef}
      className="overflow-hidden w-full opacity-80 " // Embla's parent container
    >
      <div className="flex">
        {imagesWithTitles.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full sm:w-1/3 lg:w-1/3 p-2" // Slide width and padding
          >
            <Card className="w-full p-0">
              <CardContent className="flex flex-col p-0 w-full aspect-video items-center justify-center">
                <Image
                  className="w-full h-full rounded-lg object-cover"
                  src={item.img}
                  alt={`Thumbnail ${index + 1}`}
                  loading="lazy"
                />
                <div className="p-2 flex w-full  items-center justify-between flex-nowrap">
                  <h3 className="text-md font-bold text-gray-800 dark:text-white">
                    {item.title}
                  </h3>

                  {/* Display rating */}
                  <div className="flex items-center ">
                    {/* Display stars */}
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 ${
                          i < item.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 15l-3.293 1.736a1 1 0 0 1-1.447-1.054L7.6 11.232 4.28 8.888a1 1 0 0 1 .58-1.719l4.443-.645L10 2.5l1.697 4.997 4.443.645a1 1 0 0 1 .58 1.719l-3.32 2.344 1.342 5.45a1 1 0 0 1-1.447 1.054L10 15z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OurClient2() {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      // Enable infinite looping
    },

    [
      Autoscroll({
        speed: 0.5,
        direction: "backward",
      }),
    ]
  );

  return (
    <div
      ref={emblaRef}
      className="overflow-hidden w-full opacity-80" // Embla's parent container
    >
      <div className="flex">
        {imagesWithTitles.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full sm:w-1/3 lg:w-1/3 p-2" // Slide width and padding
          >
            <Card className="w-full p-0">
              <CardContent className="flex flex-col p-0 w-full aspect-video items-center justify-center">
                <Image
                  className="w-full h-full rounded-lg object-cover"
                  src={item.img}
                  alt={`Thumbnail ${index + 1}`}
                  loading="lazy"
                />
                <div className="p-2 flex w-full  items-center justify-between flex-nowrap">
                  <h3 className="text-md font-bold text-gray-800 dark:text-white">
                    {item.title}
                  </h3>

                  {/* Display rating */}
                  <div className="flex items-center ">
                    {/* Display stars */}
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 ${
                          i < item.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 15l-3.293 1.736a1 1 0 0 1-1.447-1.054L7.6 11.232 4.28 8.888a1 1 0 0 1 .58-1.719l4.443-.645L10 2.5l1.697 4.997 4.443.645a1 1 0 0 1 .58 1.719l-3.32 2.344 1.342 5.45a1 1 0 0 1-1.447 1.054L10 15z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OurClientReviev() {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      // Enable infinite looping
    },

    [
      Autoscroll({
        speed: 0.5,
      }),
    ]
  );

  return (
    <div
      ref={emblaRef}
      className="overflow-hidden w-full opacity-80  " // Embla's parent container
    >
      <div className="flex ">
        {imagesWithTitles.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full sm:w-1/3 lg:w-1/5 p-2" // Slide width and padding
          >
            <Card className="w-full p-0 bg-black border-none">
              <CardContent className="flex  gap-3 w-full aspect-video items-center justify-center ">
                {/* <Image
                  className=" rounded-full object-cover"
                  src=""
                  width={45}
                  height={45}
                  alt={`Thumbnail ${index + 1}`}
                  loading="lazy"
                /> */}
                <User2Icon
                  color="white"
                  size={25}
                  className=" rounded-full  border border-white p-1"
                />
                <div className=" flex flex-col w-full  items-start justify-between flex-nowrap">
                  <h3 className="text-md font-bold text-gray-800 dark:text-white">
                    {item.title}
                  </h3>

                  {/* Display rating */}
                  <div className="flex items-center ">
                    {/* Display stars */}
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 ${
                          i < item.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 15l-3.293 1.736a1 1 0 0 1-1.447-1.054L7.6 11.232 4.28 8.888a1 1 0 0 1 .58-1.719l4.443-.645L10 2.5l1.697 4.997 4.443.645a1 1 0 0 1 .58 1.719l-3.32 2.344 1.342 5.45a1 1 0 0 1-1.447 1.054L10 15z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
