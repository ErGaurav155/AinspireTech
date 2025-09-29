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
  Play,
  Rocket,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const productSections = [
  {
    title: "WEBSITE CHATBOTS",
    description:
      "Intelligent AI assistants for your website that provide 24/7 customer support",
    gradient: "from-[#00F0FF] to-[#0080FF]",
    borderColor: "border-[#00F0FF]/20",
    hoverBorder: "hover:border-[#00F0FF]",
    hoverBg:
      "hover:bg-gradient-to-br hover:from-[#00F0FF]/5 hover:to-transparent",
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
    borderColor: "border-[#B026FF]/30",
    hoverBorder: "hover:border-[#B026FF]",
    hoverBg:
      "hover:bg-gradient-to-br hover:from-[#B026FF]/5 hover:to-transparent",
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

const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Animated gradient orbs */}
    <motion.div
      className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#00F0FF]/20 to-[#B026FF]/20 rounded-full blur-3xl"
      animate={{
        x: [0, 100, 0],
        y: [0, -50, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[#B026FF]/15 to-[#FF2E9F]/15 rounded-full blur-3xl"
      animate={{
        x: [0, -80, 0],
        y: [0, 60, 0],
        scale: [1.2, 1, 1.2],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </div>
);

const ProductCard = ({
  item,
  section,
  index,
}: {
  item: any;
  section: any;
  index: number;
}) => {
  const cardRef = useRef(null);
  const router = useRouter();
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card
        className={`group relative h-full flex flex-col overflow-hidden backdrop-blur-sm border-2 transition-all duration-500 ${section.borderColor}  bg-gray-900/40 backdrop-saturate-150`}
      >
        {/* Animated gradient border */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`}
          style={{
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "2px",
          }}
        />

        {/* Hover glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${section.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500`}
        />

        {/* Product Image with parallax effect */}
        <div className="relative h-48 w-full overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full"
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="100%"
              quality={100}
              className="object-cover"
            />
          </motion.div>

          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

          {/* Animated icon */}
          <motion.div
            className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
            whileHover={{
              scale: 1.1,
              rotate: 360,
            }}
            transition={{ duration: 0.5 }}
          >
            <item.icon
              className={`h-6 w-6 ${
                section.gradient.includes("00F0FF")
                  ? "text-[#00F0FF]"
                  : "text-[#FF2E9F]"
              }`}
            />
          </motion.div>

          {/* Rating badge with animation */}
          <motion.div
            className="absolute top-4 left-4 flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-xs text-white font-medium">
              {item.rating}
            </span>
          </motion.div>
        </div>

        <CardContent className="relative flex flex-col gap-4 p-6 z-10">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl font-bold text-white">
              {item.name}
            </CardTitle>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Badge
                variant="secondary"
                className="text-xs bg-white/10 backdrop-blur-sm"
              >
                <Users className="h-3 w-3 mr-1" />
                {item.users}
              </Badge>
            </motion.div>
          </div>

          <CardDescription className="text-gray-300 text-sm leading-relaxed font-montserrat">
            {item.description}
          </CardDescription>

          {/* Features with staggered animation */}
          <div className="space-y-3 mb-4  font-montserrat">
            {item.features.map((feature: string, featureIndex: number) => (
              <motion.div
                key={featureIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={
                  isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                }
                transition={{
                  duration: 0.4,
                  delay: index * 0.1 + featureIndex * 0.1,
                }}
                className="flex items-center text-sm text-gray-400"
              >
                <motion.div
                  className={`w-2 h-2 rounded-full mr-3 ${
                    section.gradient.includes("00F0FF")
                      ? "bg-[#00F0FF]"
                      : "bg-[#FF2E9F]"
                  }`}
                  whileHover={{ scale: 1.5 }}
                />
                {feature}
              </motion.div>
            ))}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => router.push(item.id)}
              className={`w-full group/btn relative overflow-hidden ${
                section.gradient.includes("00F0FF")
                  ? "bg-gradient-to-r from-[#00F0FF] to-[#0080FF]"
                  : "bg-gradient-to-r from-[#B026FF] to-[#FF2E9F]"
              } text-white font-semibold transition-all duration-300 h-11`}
            >
              <motion.span
                className="relative z-10 flex items-center justify-center"
                whileHover={{ x: 2 }}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </motion.span>

              {/* Button shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                initial={{ x: -100 }}
                whileHover={{ x: 400 }}
                transition={{ duration: 0.8 }}
              />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProductShowcase = () => {
  const router = useRouter();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  return (
    <div className="min-h-screen w-full bg-transparent text-white relative overflow-hidden">
      <FloatingElements />

      <div
        ref={containerRef}
        className="relative z-10 flex flex-col items-center justify-center gap-20 py-20 px-4 sm:px-6 lg:px-8"
      >
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00F0FF]/10 to-[#B026FF]/10 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 mb-6"
          >
            <ZapIcon className="h-4 w-4 text-[#00F0FF]" />
            <span className="text-sm font-medium text-gray-300">
              AI-Powered Solutions
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Transform Your Business
          </h1>
          <p className="text-xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed font-montserrat">
            Discover intelligent chatbot solutions that automate customer
            engagement, boost conversions, and provide 24/7 support for your
            business.
          </p>
        </motion.div>

        {/* Product Sections */}
        <div className="max-w-7xl w-full space-y-32">
          {productSections.map((section, sectionIndex) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: sectionIndex * 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-12"
            >
              {/* Section Header with Animation */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h2
                  className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}
                >
                  {section.title}
                </h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-montserrat "
                >
                  {section.description}
                </motion.p>
              </motion.div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.items.map((item, itemIndex) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    section={section}
                    index={itemIndex}
                  />
                ))}
              </div>

              {/* Section CTA */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center pt-8"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className={`bg-gradient-to-r ${section.gradient} text-white font-semibold px-4 md:px-8  py-2 md:py-6 rounded-xl backdrop-blur-sm border-0`}
                    onClick={() =>
                      router.push(sectionIndex === 0 ? "/web" : "/insta")
                    }
                  >
                    <Rocket className=" mr-2 h-5 w-5" />
                    Explore All {section.title.split(" ")[0]} Solutions
                  </Button>
                </motion.div>
              </motion.div> */}
            </motion.section>
          ))}
        </div>

        {/* Enhanced Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl w-full"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8923a3]/10 to-[#00F0FF]/5 backdrop-blur-sm border border-white/10 p-8 md:p-12">
            {/* Background animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/5 via-[#B026FF]/5 to-[#FF2E9F]/5"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />

            <div className="relative z-10">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-white mb-4  font-montserrat"
              >
                Ready to Transform Your Business?
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-gray-300 mb-8 text-lg leading-relaxed  font-montserrat"
              >
                Join thousands of businesses already using our AI solutions to
                automate customer engagement and boost conversions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] hover:shadow-xl text-black font-semibold px-8 py-6 rounded-xl"
                    onClick={() => router.push("/auth/signup")}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Free Trial
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 rounded-xl"
                    onClick={() => router.push("/demo")}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductShowcase;
