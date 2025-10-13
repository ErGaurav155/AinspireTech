"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";

const testimonials = [
  {
    name: "Raj Mehta",
    company: "Fashion Boutique",
    content:
      "Our engagement increased by 300% after implementing InstaReply Pro. Never miss a customer comment again!",
    rating: 5,
  },
  {
    name: "Priya Desai",
    company: "Tech Dropshipping",
    content:
      "The automation is so natural, our followers can't tell it's not us responding personally.",
    rating: 5,
  },
  {
    name: "Anil Kumar",
    company: "Food Blog",
    content:
      "ROI was positive within the first week. The system pays for itself with increased engagement.",
    rating: 5,
  },
];

function InstaTestimonialsSection() {
  const { theme } = useTheme();

  // Theme-based styles
  const containerBg = theme === "dark" ? "bg-[#0a0a0a]/10" : "bg-gray-50/50";
  const badgeBorder =
    theme === "dark" ? "border-[#00F0FF]/30" : "border-blue-700/30";
  const titleText = theme === "dark" ? "text-white" : "text-n-7";
  const descriptionText = theme === "dark" ? "text-gray-300" : "text-n-5";
  const cardBg = theme === "dark" ? "bg-[#0a0a0a]/60" : "bg-white/80";
  const cardBorder = theme === "dark" ? "border-white/10" : "border-gray-200";
  const cardHoverBorder =
    theme === "dark"
      ? "hover:border-[#258b94]/40"
      : "hover:border-[#258b94]/60";
  const testimonialText = theme === "dark" ? "text-gray-300" : "text-n-4";
  const companyText = theme === "dark" ? "text-gray-400" : "text-n-5";

  // EXACT same animation variants as FAQ component
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.9,
      rotateX: -10,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      borderColor:
        theme === "dark"
          ? "rgba(37, 139, 148, 0.4)"
          : "rgba(37, 139, 148, 0.2)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  const ratingVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const starVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className={`py-16 bg-transparent ${containerBg}`}>
      <motion.div
        className="text-center mb-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-100px" }}
      >
        <motion.div
          className="flex items-center justify-center text-blue-700 mb-4"
          variants={titleVariants}
          whileInView="visible"
          viewport={{ once: false }}
          initial="hidden"
        >
          <span
            className={`text-sm font-medium uppercase tracking-widest border ${badgeBorder} rounded-full px-4 py-1`}
          >
            CLIENT REVIEW
          </span>
        </motion.div>
        <motion.h2
          className={`text-3xl font-bold mb-4 gradient-text-main ${titleText}`}
          variants={titleVariants}
          whileInView="visible"
          viewport={{ once: false }}
          initial="hidden"
        >
          What Our Customers Say
        </motion.h2>
        <motion.p
          className={`text-xl font-montserrat ${descriptionText}`}
          variants={textVariants}
          whileInView="visible"
          viewport={{ once: false }}
          initial="hidden"
        >
          Join thousands of creators who have transformed their Instagram
          engagement
        </motion.p>
      </motion.div>

      <motion.div
        className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 ${containerBg} backdrop-blur-sm`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-50px" }}
      >
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover="hover"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            initial="hidden"
          >
            <Card
              className={`${cardBg} border ${cardBorder} ${cardHoverBorder} transition-colors duration-300 backdrop-blur-sm h-full`}
            >
              <CardContent className="p-3 md:p-6">
                <motion.div
                  className="flex items-center gap-1 mb-4"
                  variants={ratingVariants}
                  whileInView="visible"
                  viewport={{ once: false }}
                  initial="hidden"
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-4 w-4 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]"
                      variants={starVariants}
                      whileInView="visible"
                      viewport={{ once: false }}
                      initial="hidden"
                    />
                  ))}
                </motion.div>

                <motion.p
                  className={`mb-4 font-montserrat ${testimonialText}`}
                  variants={textVariants}
                  whileInView="visible"
                  viewport={{ once: false }}
                  initial="hidden"
                >
                  {testimonial.content}
                </motion.p>

                <motion.div
                  variants={ratingVariants}
                  whileInView="visible"
                  viewport={{ once: false }}
                  initial="hidden"
                >
                  <p className={`font-semibold ${titleText}`}>
                    {testimonial.name}
                  </p>
                  <p className={`text-sm ${companyText}`}>
                    {testimonial.company}
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default InstaTestimonialsSection;
