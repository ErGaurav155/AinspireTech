"use server";

import nodemailer from "nodemailer";

export const sendSubscriptionEmailToOwner = async ({
  email,
  userId,
  subscriptionId,
}: {
  email: string;
  userId: string;
  subscriptionId: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "New Subscription Alert",
    text: `Congratulations! A customer has subscribed. UserID: ${userId}, SubscriptionID: ${subscriptionId}`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendSubscriptionEmailToUser = async ({
  email,
  userId,
  agentId,
  subscriptionId,
}: {
  email: string;
  userId: string;
  agentId: string;
  subscriptionId: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "New Subscription Alert",
    text: `Congratulations! You has subscribed To AgentID:${agentId}, UserID: ${userId}, SubscriptionID: ${subscriptionId}. Please Wait 24 hours To Work Your AI Smartly.Our Ai Scrapped Your Website Data.Provides Best Response To Your Users`,
  };

  await transporter.sendMail(mailOptions);
};
