import { Metadata } from "next";
import { Footer } from "@/components/shared/Footer";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import AvailableProduct from "@/components/shared/AvailableProduct";
export const metadata: Metadata = {
  title: "Client Review",
  description: "Create Website,ai agent,chatbots in best quality",
  keywords: [
    "lead generation chatbot,customer support chatbot,educational chatbot",
  ],
};
const ProductsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-7xl m-auto ">
      <BreadcrumbsDefault />
      <AvailableProduct showAvailableOnly={false} />

      <Footer />
    </div>
  );
};

export default ProductsPage;
