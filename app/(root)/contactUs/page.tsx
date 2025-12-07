"use client";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import ContactForm from "@/components/shared/Contactus";
import { MotionDiv } from "@/components/shared/Motion";

import React from "react";
const stagger = 0.25;

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const contactUs = () => {
  return (
    <MotionDiv
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{
        delay: stagger,
        ease: "easeInOut",
        duration: 0.5,
      }}
      viewport={{ amount: 0 }}
      className=""
    >
      <div className="mx-auto max-w-7xl w-full gap-5  flex flex-col justify-between items-center ">
        <BreadcrumbsDefault />

        <ContactForm />
      </div>
    </MotionDiv>
  );
};

export default contactUs;
