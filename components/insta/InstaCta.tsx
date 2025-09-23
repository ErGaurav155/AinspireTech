"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

function InstaCTASection() {
  // EXACT same animation variants as testimonials component
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
      borderColor: "rgba(37, 139, 148, 0.4)",
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

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <motion.div
      className="text-center"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }}
    >
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        whileInView="visible"
        viewport={{ once: false, margin: "-50px" }}
        initial="hidden"
      >
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]/90 border border-white/10 backdrop-blur-lg">
          <CardContent className="pt-12 pb-12">
            <motion.h2
              className="text-4xl font-bold mb-4 gradient-text-main"
              variants={titleVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              Ready to Transform Your Instagram Engagement?
            </motion.h2>
            <motion.p
              className="text-gray-300 mb-8 text-lg font-montserrat max-w-2xl mx-auto"
              variants={textVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              Join thousands of creators and businesses who have automated their
              Instagram responses and increased their engagement rates by up to
              300%.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  size="lg"
                  className="btn-gradient-cyan text-lg px-8 hover:opacity-90 transition-opacity"
                  asChild
                >
                  <Link href="/insta/dashboard">
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-[#B026FF]/30 bg-transparent text-[#B026FF] hover:bg-[#B026FF]/10"
                >
                  View Pricing
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default InstaCTASection;
