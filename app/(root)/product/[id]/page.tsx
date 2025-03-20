"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
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
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center">
      <BreadcrumbsDefault />

      <div className="wrapper2 mt-2 flex flex-col md:flex-row items-center justify-center gap-10 min-h-[80vh] w-full">
        {/* Left Side: Product Icon and Buttons */}
        <div className="flex-1 flex flex-col items-start justify-start gap-4">
          <div
            className={`flex items-center justify-start gap-1 ${product.description.bgcolor} rounded-xl p-2 lg:p-3`}
          >
            <HeadsetIcon className="w-10 h-10 text-white" />
            <h1 className="text-lg md:text-xl font-semibold lg:font-bold text-white">
              {product.name}
            </h1>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {product.description.heading}
          </h1>
          <h4 className="text-lg font-semibold text-gray-500">
            {product.description.subheading}
          </h4>
          <div className="flex gap-3">
            {product.available ? (
              <Button
                size="lg"
                color="green"
                variant="gradient"
                className="px-3"
                onClick={() => router.push(`/pricing?id=${id}`)}
              >
                Buy Now
              </Button>
            ) : (
              <Button
                size="lg"
                color="green"
                variant="gradient"
                className="px-3"
              >
                Coming Soon...
              </Button>
            )}

            <Button
              size="lg"
              color="blue"
              variant="gradient"
              className="px-3"
              onClick={() => router.push("/contactUs")}
            >
              Request To Setup
            </Button>
          </div>
        </div>

        <div className="flex-1 w-full md:w-1/2">
          <iframe
            className="aspect-video w-full h-full"
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
