import {
  sendAppointmentEmailToUser,
  sendWhatsAppInfo,
} from "@/lib/action/sendEmail.action";
import { getUserById } from "@/lib/action/user.actions";
import WebConversation from "@/lib/database/models/web/Conversation.model";
import WebSubscription from "@/lib/database/models/web/Websubcription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
const SECRET_KEY = process.env.API_KEY!; // Ensure this is set in your environment

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, X-API-KEY" // Added X-API-KEY
  );
  return response;
}
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("X-API-KEY");

    if (!apiKey || apiKey !== SECRET_KEY) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid API key" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
    const {
      chatbotType,
      userId,
      customerEmail,
      customerName,
      messages,
      formData,
      status,
    } = await request.json();

    if (!chatbotType || !userId || !messages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    await connectToDatabase();
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        {
          message: "User Not Found",
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
    const subscriptions = await WebSubscription.find({
      clerkId: userId,
      chatbotType: {
        $in: ["chatbot-customer-support", "chatbot-lead-generation"],
      },
      status: "active",
    });

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json([], {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const newConversation = {
      chatbotType: chatbotType,
      clerkId: userId,
      customerName: customerName || "Anonymous",
      customerEmail: customerEmail || null,
      messages: messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
      formData: formData || null,
      status: status || "active",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await WebConversation.create(newConversation);
    if (chatbotType === "chatbot-lead-generation") {
      await sendAppointmentEmailToUser({
        email: user.email,
        data: formData,
      });
      await sendWhatsAppInfo({ data: formData, userId });
    }

    return NextResponse.json(
      {
        message: "Conversation created successfully",
        conversationId: result._id, // Changed from insertedId to _id for Mongoose
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Conversation creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
