"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { productDetails } from "@/constant";
import { HeadsetIcon } from "lucide-react";
import { Button } from "@material-tailwind/react";

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
    <div className="md:wrapper2  w-full md:p-8">
      {showAvailableOnly ? (
        <h1 className="text-4xl font-bold text-white mb-12 text-center">
          Popular Products
        </h1>
      ) : (
        <h1 className="text-4xl font-bold text-white mb-12 text-center">
          All Products
        </h1>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.productId}
            className={`flex flex-col items-center justify-center gap-6 ${
              product.available ? "bg-gray-700" : "bg-gray-800 "
            }  rounded-xl p-6 shadow-lg`}
          >
            {/* Product Header */}
            <div
              className={`w-full flex items-center justify-start gap-3 ${product.description.bgcolor} rounded-xl p-3`}
            >
              <HeadsetIcon className="w-8 h-8 text-white" />
              <h2 className="text-lg font-semibold text-white">
                {product.name}
              </h2>
            </div>

            {/* Product Video */}
            <div className="w-full aspect-video">
              <iframe
                className=" w-full h-full"
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
              <p className="text-gray-400">{product.description.subheading}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full mt-auto">
              {product.available ? (
                <Button
                  fullWidth
                  color="green"
                  variant="gradient"
                  onClick={() =>
                    router.push(`/pricing?id=${product.productId}`)
                  }
                  className="text-base font-bold"
                >
                  Buy Now
                </Button>
              ) : (
                <Button
                  fullWidth
                  color="green"
                  variant="gradient"
                  disabled
                  className="text-base font-bold"
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
