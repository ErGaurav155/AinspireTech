"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { productDetails } from "@/constant";
import { HeadsetIcon } from "lucide-react";
import { Button } from "../ui/button";

interface Product {
  productId: string;
  name: string;
  video: string;
  icon: string;
  available: boolean;
  description: { bgcolor: string; heading: string; subheading: string };
}
interface AvailableProductProps {
  showAvailableOnly: boolean;
}

const AvailableProduct = ({ showAvailableOnly }: AvailableProductProps) => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Sort products with available ones first
    let sortedProducts = Object.values(productDetails).sort((a, b) => {
      // Show available products first
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      return 0;
    });
    if (showAvailableOnly) {
      sortedProducts = sortedProducts.filter((product) => product.available);
    }
    setProducts(sortedProducts);
  }, [showAvailableOnly]);

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-8 relative bg-transparent  z-10">
      {showAvailableOnly ? (
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
          Popular Products
        </h1>
      ) : (
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
          All Products
        </h1>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.productId}
            className={`flex flex-col items-center justify-center gap-6 rounded-xl p-6 shadow-xl
              bg-[#0a0a0a] backdrop-blur-sm border border-[#00F0FF]/30 hover:border-[#B026FF] transition-all
              ${!product.available && "opacity-70"}`}
          >
            {/* Product Header */}
            <div
              className={`w-full flex items-center justify-start gap-3 rounded-xl p-3 bg-gradient-to-r from-[#00F0FF]/20 to-[#B026FF]/20`}
            >
              <HeadsetIcon className="w-8 h-8 text-white" />
              <h2 className="text-lg font-semibold text-white">
                {product.name}
              </h2>
            </div>

            {/* Product Video */}
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-[#00F0FF]/30">
              <iframe
                className="w-full h-full"
                src={product.video}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Product Description */}
            <div className="flex flex-col gap-3 w-full">
              <h3 className="text-xl font-bold text-white">
                {product.description.heading}
              </h3>
              <p className="text-gray-300 font-montserrat">
                {product.description.subheading}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full mt-auto">
              {product.available ? (
                <Button
                  className="text-base  w-full font-bold bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black hover:opacity-90 transition-opacity"
                  onClick={() =>
                    router.push(`/web/pricing?id=${product.productId}`)
                  }
                >
                  Buy Now
                </Button>
              ) : (
                <Button
                  className="text-base w-full font-bold bg-gradient-to-r from-gray-500 to-gray-700 text-gray-300 cursor-not-allowed"
                  disabled
                >
                  Coming Soon...
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableProduct;
