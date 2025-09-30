"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const Faq = () => {
  // Animation variants - remove 'once: true' to replay on every scroll
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
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
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
      borderColor: "rgba(37, 139, 148, 0.4)",
      boxShadow: "0 20px 40px -10px rgba(37, 139, 148, 0.2)",
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

  const questionVariants = {
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

  const answerVariants = {
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

  const faqData = [
    {
      question: "Can I change my plan anytime?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept Razorpay and PayPal Payment Gateways for our customers.",
    },
    {
      question: "Is there a setup fee?",
      answer:
        "No, there are no setup fees or hidden costs. You only pay the monthly or yearly subscription.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. No questions asked.",
    },
    {
      question: "How quickly can I get started?",
      answer:
        "You can be up and running within 5 minutes of subscribing. No technical setup required.",
    },
  ];

  return (
    <div>
      {/* FAQ Section */}
      <section className="py-16  ">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-100px" }}
        >
          <motion.div
            className="flex items-center justify-center text-[#00F0FF] mb-4"
            variants={titleVariants}
            whileInView="visible"
            viewport={{ once: false }}
            initial="hidden"
          >
            <span className="text-sm font-medium uppercase tracking-widest border border-[#00F0FF]/30 rounded-full px-4 py-1">
              FAQ SECTION
            </span>
          </motion.div>
          <motion.div variants={itemVariants} className="mb-4">
            <h2 className="text-3xl font-bold mb-4 gradient-text-main text-center">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0a0a0a]/10 backdrop-blur-sm">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                whileInView="visible"
                viewport={{ once: false, margin: "-50px" }}
                initial="hidden"
              >
                <Card className="bg-[#0a0a0a]/60 border border-[#333] hover:border-[#258b94]/40 transition-colors duration-300">
                  <CardContent className="p-3 md:p-6">
                    <motion.h3
                      className="font-semibold text-[#258b94] mb-2"
                      variants={questionVariants}
                      whileInView="visible"
                      viewport={{ once: false }}
                      initial="hidden"
                    >
                      {faq.question}
                    </motion.h3>
                    <motion.p
                      className="text-gray-300 font-montserrat"
                      variants={answerVariants}
                      whileInView="visible"
                      viewport={{ once: false }}
                      initial="hidden"
                    >
                      {faq.answer}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Faq;
