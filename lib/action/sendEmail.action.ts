"use server";

import nodemailer from "nodemailer";
import twilio from "twilio";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { Twilio } from "twilio";

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

interface DataTypes {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

interface SendWhatsAppInfoParams {
  data: DataTypes;
  userId: string | null;
}

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsAppInfo({
  data,
  userId,
}: SendWhatsAppInfoParams): Promise<{ success: boolean; data?: any }> {
  try {
    const { name, email, phone, message } = data;
    await connectToDatabase();

    let PhoneNumber;
    if (!userId) {
      PhoneNumber = process.env.WHATSAPP_NUMBER;
    }
    const user = await User.findOne({ _id: userId }).exec();

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.phone) {
      throw new Error("User phone number not available");
    }
    PhoneNumber = user.phone;
    const result = await client.messages.create({
      from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_NUMBER}`,
      to: `whatsapp:${PhoneNumber}`,
      contentSid: process.env.YOUR_MESSAGE_CONTENT_SID_HERE, // Replace with your template's Content SID
      contentVariables: JSON.stringify({
        "1": name,
        "2": email,
        "3": phone || "Not provided",
        "4": message || "No message",
      }),
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return {
      success: false,
      data: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
