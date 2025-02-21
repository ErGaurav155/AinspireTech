"use server";

import nodemailer from "nodemailer";
import twilio from "twilio";

export const sendSubscriptionEmailToOwner = async ({
  email,
  userDbId,
  subscriptionId,
}: {
  email: string;
  userDbId: string;
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
    text: `Congratulations! A customer has subscribed. UserID: ${userDbId}, SubscriptionID: ${subscriptionId}`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendSubscriptionEmailToUser = async ({
  email,
  userDbId,
  agentId,
  subscriptionId,
}: {
  email: string;
  userDbId: string;
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
    text: `Congratulations! You has subscribed To AgentID:${agentId}, UserID: ${userDbId}, SubscriptionID: ${subscriptionId}. Please Wait 24 hours To Work Your AI Smartly.Our Ai Scrapped Your Website Data.Provides Best Response To Your Users`,
  };

  await transporter.sendMail(mailOptions);
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error("Twilio credentials are not set in .env");
}

const client = twilio(accountSid, authToken);

export async function sendWhatsAppInfo({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}) {
  const whatsappNumber = process.env.WHATSAPP_NUMBER!; // Destination WhatsApp number

  // Construct the message text
  const msg = `New Feedback Submission:
Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}`;

  try {
    const result = await client.messages.create({
      body: msg,
      from: process.env.NEXT_PUBLIC_TWILIO_NUMBER, // Your Twilio WhatsApp-enabled number
      to: whatsappNumber,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("WhatsApp send error:", error);
    throw new Error("Failed to send WhatsApp message");
  }
}
