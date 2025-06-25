"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeadsetIcon } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { productDetails } from "@/constant";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";

interface ProductParams {
  id: string;
}

const ProductDetail = ({ params }: { params: ProductParams }) => {
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState<{
    productId: string;
    name: string;
    video: string;
    icon: string;
    available: boolean;
    description: { bgcolor: string; heading: string; subheading: string };
  } | null>(null);

  useEffect(() => {
    const detail = productDetails[id];
    if (detail) {
      setProduct(detail);
    } else {
      router.push("/404");
    }
  }, [id, router]);

  if (!product)
    return (
      <div className="flex items-center justify-center min-h-screen text-white font-bold text-xl bg-black">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <BreadcrumbsDefault />

      <div className="wrapper2 mt-8 flex flex-col md:flex-row items-center justify-center gap-10 min-h-[80vh] w-full max-w-6xl px-4">
        {/* Left Side: Product Icon and Buttons */}
        <div className="flex-1 flex flex-col items-start justify-start gap-8 p-6 bg-gray-900/50 backdrop-blur-md border border-[#B026FF]/30 rounded-2xl">
          <div className="flex items-center justify-start gap-3 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full px-6 py-3">
            <HeadsetIcon className="w-8 h-8 text-white" />
            <h1 className="text-xl font-bold text-white">{product.name}</h1>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
            {product.description.heading}
          </h1>

          <h4 className="text-xl text-gray-300">
            {product.description.subheading}
          </h4>

          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            {product.available ? (
              <button
                onClick={() => router.push(`/pricing?id=${id}`)}
                className="flex-1 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90 hover:shadow-lg hover:shadow-[#00F0FF]/30"
              >
                Buy Now
              </button>
            ) : (
              <button className="flex-1 bg-gradient-to-r from-gray-600 to-gray-800 text-gray-300 font-bold py-3 px-6 rounded-full text-lg cursor-not-allowed">
                Coming Soon...
              </button>
            )}

            <button
              onClick={() => router.push("/contactUs")}
              className="flex-1 bg-gradient-to-r from-[#FF2E9F] to-[#B026FF] text-black font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 hover:from-[#FF2E9F]/90 hover:to-[#B026FF]/90 hover:shadow-lg hover:shadow-[#FF2E9F]/30"
            >
              Request To Setup
            </button>
          </div>
        </div>

        {/* Right Side: Video */}
        <div className="flex-1 w-full md:w-1/2 bg-gradient-to-br from-[#00F0FF]/20 to-[#FF2E9F]/20 backdrop-blur-sm border border-[#B026FF]/30 rounded-2xl overflow-hidden p-1">
          <iframe
            className="aspect-video w-full h-full rounded-xl"
            src={product.video}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
