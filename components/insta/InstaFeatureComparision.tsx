"use client";

import { motion } from "framer-motion";
import { Crown, Star, Zap, Check, X, Sparkles } from "lucide-react";
import Image from "next/image";
import cup from "@/public/assets/img/pricecup.png";

const comparisonData = {
  features: [
    "Features",
    "Meta Verified",
    "Plan / Month",
    "Automation",
    "Reply to all",
    "Comment for link",
    "Follows only link",
  ],
  products: [
    {
      name: "AinSpireTech",
      price: "Truly unlimited",
      metaVerified: true,
      plan: "₹99/month",
      automation: true,
      replyToAll: true,
      commentForLink: true,
      followsOnlyLink: true,
      highlight: true,
      rating: 5.0,
    },
    {
      name: "RutoDM",
      price: "₹399",
      metaVerified: false,
      plan: "unlimited",
      automation: true,
      replyToAll: true,
      commentForLink: true,
      followsOnlyLink: true,
      highlight: false,
      rating: 4.2,
    },
    {
      name: "Linkplease",
      price: "₹399",
      metaVerified: false,
      plan: "unlimited",
      automation: true,
      replyToAll: true,
      commentForLink: true,
      followsOnlyLink: true,
      highlight: false,
      rating: 4.1,
    },
    {
      name: "Rapiddm",
      price: "₹499",
      metaVerified: false,
      plan: "unlimited",
      automation: true,
      replyToAll: true,
      commentForLink: true,
      followsOnlyLink: true,
      highlight: false,
      rating: 4.0,
    },
    {
      name: "Zorcha",
      price: "₹1200",
      metaVerified: false,
      plan: "unlimited",
      automation: true,
      replyToAll: true,
      commentForLink: true,
      followsOnlyLink: true,
      highlight: false,
      rating: 3.8,
    },
    {
      name: "InstantDM",
      price: "₹2000",
      metaVerified: false,
      plan: "unlimited",
      automation: true,
      replyToAll: true,
      commentForLink: true,
      followsOnlyLink: true,
      highlight: false,
      rating: 3.5,
    },
  ],
};

const CheckIcon = ({ className }: { className?: string }) => (
  <motion.div
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 0.9 }}
    className={`w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center ${className}`}
  >
    <Check className="h-4 w-4 text-green-400" />
  </motion.div>
);

const CrossIcon = ({ className }: { className?: string }) => (
  <motion.div
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 0.9 }}
    className={`w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center ${className}`}
  >
    <X className="h-4 w-4 text-red-400" />
  </motion.div>
);

const InstaPriceComparisonTable = () => {
  const renderFeatureValue = (
    value: boolean | string,
    isHeader: boolean = false,
    featureIndex: number = 0
  ) => {
    if (isHeader) {
      return <span className="font-bold text-white text-lg">{value}</span>;
    }

    if (typeof value === "boolean") {
      return value ? <CheckIcon /> : <CrossIcon />;
    }

    // Price styling for the second feature (price column)
    if (featureIndex === 1) {
      if (value === "Truly unlimited") {
        return (
          <motion.span
            className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 text-lg"
            whileHover={{ scale: 1.05 }}
          >
            {value}
          </motion.span>
        );
      }
      return <span className="font-semibold text-gray-300">{value}</span>;
    }

    // Plan styling for the third feature
    if (featureIndex === 2) {
      if (value === "₹99/month") {
        return (
          <motion.span
            className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400"
            whileHover={{ scale: 1.05 }}
          >
            {value}
          </motion.span>
        );
      }
      return <span className="text-gray-400">{value}</span>;
    }

    return <span className="text-gray-300">{value}</span>;
  };

  const getProductGradient = (productName: string) => {
    switch (productName) {
      case "AinSpireTech":
        return "from-[#0ce05d] to-[#054e29]";
      case "RutoDM":
        return "from-[#00F0FF] to-[#0080FF]";
      case "Linkplease":
        return "from-[#B026FF] to-[#FF2E9F]";
      case "Rapiddm":
        return "from-[#00F0FF] to-[#B026FF]";
      case "Zorcha":
        return "from-[#FF2E9F] to-[#B026FF]";
      case "InstantDM":
        return "from-[#0080FF] to-[#00F0FF]";
      default:
        return "from-gray-600 to-gray-800";
    }
  };

  const getProductTextColor = (productName: string) => {
    switch (productName) {
      case "AinSpireTech":
        return "text-[#0ce05d]";
      case "RutoDM":
        return "text-[#00F0FF]";
      case "Linkplease":
        return "text-[#B026FF]";
      case "Rapiddm":
        return "text-[#00F0FF]";
      case "Zorcha":
        return "text-[#FF2E9F]";
      case "InstantDM":
        return "text-[#0080FF]";
      default:
        return "text-gray-400";
    }
  };

  return (
    <section className="w-full py-20 bg-transparent text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#00F0FF]/10 to-[#B026FF]/10 rounded-full blur-3xl"
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
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00F0FF]/10 to-[#B026FF]/10 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 mb-6"
          >
            <Crown className="h-4 w-4 text-[#00F0FF]" />
            <span className="text-sm font-medium text-gray-300">
              Best Value Comparison
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Ultimate Feature Comparison
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Compare all features and pricing to see why AinSpireTech offers the
            best value
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="text-left py-6 px-6 font-semibold text-white bg-gray-800/50">
                    Features
                  </th>
                  {comparisonData.products.map((product, index) => (
                    <th
                      key={product.name}
                      className={`relative text-center py-6 px-6 font-semibold ${getProductTextColor(
                        product.name
                      )} bg-gradient-to-r ${getProductGradient(
                        product.name
                      )}/80`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {product.highlight && (
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Crown className="h-5 w-5 text-yellow-400" />
                          </motion.div>
                        )}
                        <span>{product.name}</span>
                        {product.highlight && (
                          <Image
                            src={cup}
                            alt="Best Value"
                            width={40}
                            height={40}
                            className="absolute -right-2 -top-2 rotate-12"
                          />
                        )}
                      </div>

                      {/* Rating Badge */}
                      <div className="flex items-center justify-center mt-2 space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-white">
                          {product.rating}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {comparisonData.features.map((feature, featureIndex) => (
                  <motion.tr
                    key={featureIndex}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                    className="hover:bg-gray-800/20 transition-colors duration-300"
                  >
                    <td className="py-4 px-6 font-medium text-gray-300 bg-gray-800/30">
                      {renderFeatureValue(feature, true, featureIndex)}
                    </td>

                    {comparisonData.products.map((product, productIndex) => (
                      <td
                        key={`${featureIndex}-${productIndex}`}
                        className="py-4 px-6 text-center"
                      >
                        <div className="flex items-center justify-center">
                          {featureIndex === 0 ? (
                            <span className="font-semibold text-white">
                              {feature}
                            </span>
                          ) : featureIndex === 1 ? (
                            renderFeatureValue(
                              product.price,
                              false,
                              featureIndex
                            )
                          ) : featureIndex === 2 ? (
                            renderFeatureValue(
                              product.plan,
                              false,
                              featureIndex
                            )
                          ) : featureIndex === 3 ? (
                            renderFeatureValue(
                              product.automation,
                              false,
                              featureIndex
                            )
                          ) : featureIndex === 4 ? (
                            renderFeatureValue(
                              product.replyToAll,
                              false,
                              featureIndex
                            )
                          ) : featureIndex === 5 ? (
                            renderFeatureValue(
                              product.commentForLink,
                              false,
                              featureIndex
                            )
                          ) : (
                            renderFeatureValue(
                              product.followsOnlyLink,
                              false,
                              featureIndex
                            )
                          )}
                        </div>
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-[#0ce05d]/10 to-[#054e29]/10 backdrop-blur-sm border border-[#0ce05d]/30 rounded-2xl p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Why Choose AinSpireTech?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="h-5 w-5 text-[#0ce05d]" />
                <span className="text-gray-300">Truly Unlimited Usage</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-5 w-5 text-[#0ce05d]" />
                <span className="text-gray-300">All Features Included</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-5 w-5 text-[#0ce05d]" />
                <span className="text-gray-300">Best Price Guarantee</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#0ce05d] to-[#054e29] text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Get Started - Only ₹99/month
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InstaPriceComparisonTable;
