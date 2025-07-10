"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  MessageCircle,
  ShoppingCart,
  TrendingUp,
  GraduationCap,
  Instagram,
  Stethoscope,
  Building2,
  Zap,
  ArrowRight,
  Star,
  Users,
  Clock,
  Shield,
  Sparkles,
  Globe,
  Heart,
  Target,
  BookOpen,
} from "lucide-react";
import Image from "next/image";

const productSections = [
  {
    title: "WEBSITE CHATBOTS",
    description:
      "Intelligent AI assistants for your website that provide 24/7 customer support",
    gradient: "from-[#00F0FF] to-[#0080FF]",
    borderColor: "border-[#00F0FF]/20 hover:border-[#00F0FF]",
    hoverBg: "from-[#00F0FF]/10",
    items: [
      {
        id: "/web/product/chatbot-customer-support",
        name: "Customer Support",
        icon: MessageCircle,
        description: "24/7 customer service with intelligent responses",
        features: [
          "Instant responses",
          "Multi-language support",
          "Ticket routing",
        ],
        rating: 4.9,
        users: "10K+",
        image:
          "https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=400",
      },

      {
        id: "/web/product/chatbot-lead-generation",
        name: "Lead Generation",
        icon: Target,
        description: "Convert visitors into qualified leads automatically",
        features: ["Lead qualification", "Contact forms", "CRM integration"],
        rating: 4.7,
        users: "6K+",
        image:
          "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
      {
        id: "/web/product/chatbot-education",
        name: "Education",
        icon: GraduationCap,
        description:
          "Interactive learning assistants for educational platforms",
        features: ["Course guidance", "Q&A support", "Progress tracking"],
        rating: 4.9,
        users: "5K+",
        image:
          "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
    ],
  },
  {
    title: "INSTAGRAM CHATBOTS",
    description:
      "Automate your Instagram engagement with smart comment and DM responses",
    gradient: "from-[#B026FF] to-[#FF2E9F]",
    borderColor: "border-[#B026FF]/30 hover:border-[#B026FF]",
    hoverBg: "from-[#B026FF]/10",
    items: [
      {
        id: "/insta?2",
        name: "E-Commerce",
        icon: ShoppingCart,
        description: "Drive sales through Instagram with automated responses",
        features: ["Product inquiries", "Order updates", "Customer support"],
        rating: 4.8,
        users: "7K+",
        image:
          "https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
      {
        id: "/insta?3",
        name: "Business",
        icon: Building2,
        description: "Professional Instagram automation for businesses",
        features: ["Lead capture", "Service inquiries", "Brand engagement"],
        rating: 4.7,
        users: "4K+",
        image:
          "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
      {
        id: "/insta?4",
        name: "SaaS",
        icon: Globe,
        description: "Automate customer onboarding and support for SaaS",
        features: ["Demo booking", "Feature explanations", "Support tickets"],
        rating: 4.8,
        users: "2K+",
        image:
          "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
    ],
  },
];

const ProductShowcase = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full  text-white relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center gap-16 py-20 px-4 sm:px-6 lg:px-8">
        {/* Product Sections */}
        <div className="max-w-7xl w-full">
          <div className="space-y-20">
            {productSections.map((section, sectionIndex) => (
              <div key={section.title} className="space-y-8">
                {/* Section Header */}
                <div className="text-center">
                  <h2
                    className={`text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}
                  >
                    {section.title}
                  </h2>
                  <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                    {section.description}
                  </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {section.items.map((item, itemIndex) => (
                    <Card
                      key={item.id}
                      className={`group relative h-full flex flex-col items-center justify-between overflow-hidden backdrop-blur-sm border transition-all duration-500 hover:scale-105 hover:shadow-2xl ${section.borderColor} bg-gray-900/30 h-full`}
                    >
                      {/* Hover Effect Background */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${section.hoverBg} to-transparent`}
                      ></div>

                      {/* Product Image */}
                      <div className="relative h-48 w-full overflow-hidden">
                        {/* Image with full coverage */}
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          priority={true} // If this is a prominent image
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                        {/* 3D Icon Overlay */}
                        <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/20 flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                          <item.icon
                            className={`h-6 w-6 ${
                              sectionIndex === 0
                                ? "text-[#00F0FF]"
                                : "text-[#FF2E9F]"
                            }`}
                          />
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-white font-medium">
                            {item.rating}
                          </span>
                        </div>
                      </div>

                      <CardContent className="relative flex flex-col  justify-center gap-3 xl:gap-5   border-gray-900   overflow-hidden z-10 p-4  max-h-max ">
                        <div className="flex items-center justify-between mb-3">
                          <CardTitle className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00F0FF] group-hover:to-[#FF2E9F] transition-all duration-300">
                            {item.name}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {item.users}
                          </Badge>
                        </div>

                        <CardDescription className="text-gray-300 mb-4 text-sm leading-relaxed">
                          {item.description}
                        </CardDescription>

                        {/* Features List */}
                        <div className="space-y-2 mb-6">
                          {item.features.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center text-xs text-gray-400"
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                  sectionIndex === 0
                                    ? "bg-[#00F0FF]"
                                    : "bg-[#FF2E9F]"
                                }`}
                              ></div>
                              {feature}
                            </div>
                          ))}
                        </div>

                        <Button
                          onClick={() => router.push(item.id)}
                          className={`w-full  group/btn relative overflow-hidden ${
                            sectionIndex === 0
                              ? "bg-gradient-to-r from-[#00F0FF]/80 to-[#00F0FF] hover:from-[#00F0FF] hover:to-[#0080FF]"
                              : "bg-gradient-to-r from-[#B026FF]/80 to-[#FF2E9F] hover:from-[#B026FF] hover:to-[#FF2E9F]"
                          } text-black font-semibold transition-all duration-300 hover:shadow-lg`}
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </span>
                          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Section CTA */}
                <div className="text-center pt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className={`${section.borderColor} text-white hover:bg-gradient-to-r ${section.hoverBg} hover:to-transparent backdrop-blur-sm p-2`}
                    onClick={() =>
                      router.push(sectionIndex === 0 ? "/web" : "/insta")
                    }
                  >
                    <Zap className=" h-5 w-5" />
                    Explore All {section.title.split(" ")[0]} Solutions
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center max-w-4xl">
          <div className="flex flex-col items-start text-start justify-center bg-gradient-to-r bg-transparent from-[#8923a3]/10 to-[#8923a3]/5 backdrop-blur-sm border border-[#8923a3]/50  rounded-2xl p-4 md:p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of businesses already using our AI solutions to
              automate customer engagement and boost conversions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] hover:opacity-90 text-black font-semibold"
                onClick={() => router.push("/auth/signup")}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
                onClick={() => router.push("/demo")}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                View Live Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
