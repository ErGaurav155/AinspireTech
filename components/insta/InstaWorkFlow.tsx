"use client";

import { motion } from "framer-motion";

function InstaHowItWorksSection() {
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

  const stepVariants = {
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

  const iconVariants = {
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
    <section className=" mx-auto md:px-4 py-16 md:py-24 bg-transparent">
      <motion.div
        className="flex items-center justify-center text-[#00F0FF] mb-4"
        variants={titleVariants}
        whileInView="visible"
        viewport={{ once: false }}
        initial="hidden"
      >
        <span className="text-sm font-medium uppercase tracking-widest border border-[#00F0FF]/30 rounded-full px-4 py-1">
          WORKING FLOW
        </span>
      </motion.div>
      <motion.div
        className="text-center mb-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-100px" }}
      >
        <motion.h2
          className="text-3xl  font-bold mb-4 gradient-text-main"
          variants={titleVariants}
          whileInView="visible"
          viewport={{ once: false }}
          initial="hidden"
        >
          How CommentFlow Works
        </motion.h2>
        <motion.p
          className="text-lg text-gray-300 max-w-2xl mx-auto font-montserrat"
          variants={textVariants}
          whileInView="visible"
          viewport={{ once: false }}
          initial="hidden"
        >
          Set up in minutes and start automating your Instagram comments
        </motion.p>
      </motion.div>

      <motion.div
        className="max-w-6xl mx-auto bg-[#0a0a0a]/10 backdrop-blur-sm"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-50px" }}
      >
        {/* Step 1 */}
        <motion.div
          className="flex flex-col md:flex-row gap-8 items-center mb-16 "
          variants={cardVariants}
          whileHover="hover"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
          initial="hidden"
        >
          <div className="md:w-1/2">
            <motion.div
              className="text-cyan-400 font-bold text-lg mb-2"
              variants={stepVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              Step 1
            </motion.div>
            <motion.h3
              className="text-2xl font-semibold mb-4 text-white"
              variants={titleVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              Connect Your Instagram Account
            </motion.h3>
            <motion.p
              className="text-gray-300 font-montserrat"
              variants={textVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              Securely connect your Instagram business account with our
              compliant API integration. We never store your password and use
              official Instagram APIs.
            </motion.p>
          </div>
          <motion.div
            className="md:w-1/2 border border-gray-700/50 rounded-2xl p-6 aspect-video flex items-center justify-center  hover:border-[#258b94]/40 transition-colors duration-300"
            variants={cardVariants}
            whileHover="hover"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            initial="hidden"
          >
            <motion.div
              className="text-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
            >
              <motion.div
                className="text-5xl mb-4 w-full "
                variants={iconVariants}
                whileInView="visible"
                viewport={{ once: false }}
                initial="hidden"
              >
                📱
              </motion.div>
              <motion.div
                className="text-gray-400"
                variants={textVariants}
                whileInView="visible"
                viewport={{ once: false }}
                initial="hidden"
              >
                Instagram Connection Interface
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Step 2 */}
        <motion.div
          className="flex flex-col md:flex-row-reverse gap-8 items-center mb-16"
          variants={cardVariants}
          whileHover="hover"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
          initial="hidden"
        >
          <div className="md:w-1/2">
            <motion.div
              className="text-cyan-400 font-bold text-lg mb-2"
              variants={stepVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              Step 2
            </motion.div>
            <motion.h3
              className="text-2xl font-semibold mb-4 text-white"
              variants={titleVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              Set Up Response Rules
            </motion.h3>
            <motion.p
              className="text-gray-300 font-montserrat"
              variants={textVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              Create custom response templates based on keywords, question
              types, or sentiment. Our AI can help suggest responses or you can
              create your own.
            </motion.p>
          </div>
          <motion.div
            className="md:w-1/2 border border-gray-700/50 rounded-2xl p-6 aspect-video flex items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-sm hover:border-[#258b94]/40 transition-colors duration-300"
            variants={cardVariants}
            whileHover="hover"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            initial="hidden"
          >
            <motion.div
              className="text-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
            >
              <motion.div
                className="text-5xl mb-4 w-full"
                variants={iconVariants}
                whileInView="visible"
                viewport={{ once: false }}
                initial="hidden"
              >
                ⚙️
              </motion.div>
              <motion.div
                className="text-gray-400"
                variants={textVariants}
                whileInView="visible"
                viewport={{ once: false }}
                initial="hidden"
              >
                Response Rules Configuration
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Step 3 */}
        <motion.div
          className="flex flex-col md:flex-row gap-8 items-center"
          variants={cardVariants}
          whileHover="hover"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
          initial="hidden"
        >
          <div className="md:w-1/2">
            <motion.div
              className="text-cyan-400 font-bold text-lg mb-2"
              variants={stepVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              Step 3
            </motion.div>
            <motion.h3
              className="text-2xl font-semibold mb-4 text-white"
              variants={titleVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              Monitor & Improve
            </motion.h3>
            <motion.p
              className="text-gray-300 font-montserrat"
              variants={textVariants}
              whileInView="visible"
              viewport={{ once: false }}
              initial="hidden"
            >
              Use our dashboard to monitor responses, analyze engagement
              metrics, and continuously improve your automated comment system.
            </motion.p>
          </div>
          <motion.div
            className="md:w-1/2 border border-gray-700/50 rounded-2xl p-6 aspect-video flex items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-sm hover:border-[#258b94]/40 transition-colors duration-300"
            variants={cardVariants}
            whileHover="hover"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            initial="hidden"
          >
            <motion.div
              className="text-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
            >
              <motion.div
                className="text-5xl mb-4 w-full"
                variants={iconVariants}
                whileInView="visible"
                viewport={{ once: false }}
                initial="hidden"
              >
                📊
              </motion.div>
              <motion.div
                className="text-gray-400"
                variants={textVariants}
                whileInView="visible"
                viewport={{ once: false }}
                initial="hidden"
              >
                User Analytics Dashboard
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default InstaHowItWorksSection;
