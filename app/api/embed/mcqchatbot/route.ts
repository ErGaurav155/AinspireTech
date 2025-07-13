// app/api/chatbot/route.ts
import { generateMcqResponse } from "@/lib/action/ai.action";

import WebSubscription from "@/lib/database/models/web/Websubcription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";
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
export async function POST(request: Request) {
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

    const { userInput, userId, agentId, isMCQRequest } = await request.json();

    if (!userInput || !userId || !agentId) {
      return NextResponse.json(
        { error: "Message is required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
    await connectToDatabase();

    const subscriptions = await WebSubscription.find({
      clerkId: userId,
      chatbotType: agentId,
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

    const response = await generateMcqResponse({
      userInput: userInput,
      isMCQRequest,
    });

    return NextResponse.json(
      { response },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Chatbot API error:", error);
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
