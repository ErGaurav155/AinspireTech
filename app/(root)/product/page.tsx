"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import Image from "next/image";
import { HeadsetIcon } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { productDetails } from "@/constant";

// Define the structure of product details
interface Product {
  productId: string;
  name: string;
  video: string;
  icon: string;
  available: boolean;
  description: { bgcolor: string; heading: string; subheading: string };
}

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Sort products with available ones first
    const sortedProducts = Object.values(productDetails).sort((a, b) => {
      // Show available products first
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      return 0;
    });

    setProducts(sortedProducts);
  }, []);

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="wrapper2 min-h-[80vh] w-full p-8">
        <h1 className="text-4xl font-bold text-white mb-12 text-center">
          All Products
        </h1>

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
                <video
                  src={product.video}
                  controls
                  className="w-full h-full rounded-md"
                />
              </div>

              {/* Product Description */}
              <div className="flex flex-col gap-3 w-full">
                <h3 className="text-xl font-bold text-white">
                  {product.description.heading}
                </h3>
                <p className="text-gray-400">
                  {product.description.subheading}
                </p>
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
                  >
                    Buy Now
                  </Button>
                ) : (
                  <Button fullWidth color="green" variant="gradient" disabled>
                    Coming Soon...
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductsPage;
