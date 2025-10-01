import { Sparkles, Play } from "lucide-react";
import Link from "next/link";

const ProductShowcase = () => {
  return (
    <div className=" w-full  bg-transparent text-white relative overflow-hidden">
      <div className="relative max-w-4xl w-full m-auto  z-10  px-4 sm:px-6 lg:px-8">
        {/* Enhanced Bottom CTA Section */}
        <div className="text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8923a3]/10 to-[#00F0FF]/5 backdrop-blur-sm border border-white/10 p-8 md:p-12">
            {/* Background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/5 via-[#B026FF]/5 to-[#FF2E9F]/5" />

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4  font-montserrat">
                Ready to Transform Your Business?
              </h3>

              <p className="text-gray-300 mb-8 text-lg leading-relaxed  font-montserrat">
                Join thousands of businesses already using our AI solutions to
                automate customer engagement and boost conversions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/web"
                  className="bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] hover:shadow-xl text-black font-semibold px-8 py-6 rounded-xl flex items-center justify-center "
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Link>

                <Link
                  href="/insta"
                  className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 rounded-xl flex items-center justify-center "
                >
                  <Play className="mr-2 h-5 w-5" />
                  Purchase Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
