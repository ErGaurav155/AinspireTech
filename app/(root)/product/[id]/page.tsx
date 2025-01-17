"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import Image from "next/image";
import { HeadsetIcon } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { useAuth } from "@clerk/nextjs";
import { Checkout } from "@/components/shared/Checkout";
import { getPlanInfo } from "@/lib/action/plan.action";
import { getUserById } from "@/lib/action/user.actions";
import { productDetails } from "@/constant";

// Define the structure of product details

interface ProductParams {
  id: string;
}

const ProductDetail = ({ params }: { params: ProductParams }) => {
  const router = useRouter();
  const { userId } = useAuth();
  const [url, serUrl] = useState<boolean>(false);

  const [product, setProduct] = useState<{
    productId: string;
    name: string;
    video: string;
    icon: string;
    description: { bgcolor: string; heading: string; subheading: string };
  } | null>(null);
  const [planInfo, setPlanInfo] = useState<{
    planId: string;
    name: string;
    amount: number;
  } | null>(null);
  const [buyerInfo, setBuyerInfo] = useState<string>();

  useEffect(() => {
    const { id } = params;
    const detail = productDetails[id];
    if (detail) {
      setProduct(detail);
    } else {
      router.push("/404");
    }
  }, [params, router]);
  useEffect(() => {
    const fetchPlanInfo = async () => {
      if (product) {
        try {
          const info = await getPlanInfo(product.productId);
          setPlanInfo(info);
        } catch (error) {
          console.error("Error fetching plan info:", error);
        }
      }
      if (userId) {
        try {
          const buyer = await getUserById(userId);
          if (!buyer) {
            router.push("/sign-in");
          }
          setBuyerInfo(buyer._id);
        } catch (error) {
          console.error("Error fetching plan info:", error);
        }
      }
    };

    fetchPlanInfo();
  }, [product, router, userId]);
  if (!product || !planInfo)
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        Loading...
      </div>
    );

  return (
    <>
      <div className="wrapper2 flex flex-col md:flex-row items-center justify-center gap-10 min-h-[80vh] w-full">
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
            {!userId || !buyerInfo ? (
              <Button
                size="lg"
                color="green"
                variant="gradient"
                className="px-3"
                onClick={() => router.push("/sign-in")}
              >
                Buy Now
              </Button>
            ) : (
              <Button
                size="lg"
                color="green"
                variant="gradient"
                className="px-3"
                onClick={() => serUrl(true)}
              >
                Buy Now
              </Button>
            )}
            {url && buyerInfo && (
              <Checkout
                amount={planInfo.amount}
                planId={planInfo.planId}
                buyerId={buyerInfo}
                productId={product.productId}
              />
            )}
            <Button
              size="lg"
              color="blue"
              variant="gradient"
              className="px-3"
              onClick={() => alert("Redirect to Request a Demo page!")}
            >
              Request To Setup
            </Button>
          </div>
        </div>

        {/* Right Side: Video */}
        <div className="flex-1 w-full md:w-1/2">
          <video
            src={product.video}
            controls
            className="w-full rounded-md shadow-lg"
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;
