// app/api/chatbot/route.ts
import { generateGptResponse } from "@/lib/action/ai.action";
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

    const { userInput, fileData, userId, agentId } = await request.json();

    if (!userInput || !userId || !agentId || !fileData) {
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

    const response = await generateGptResponse({
      userInput: userInput,
      userfileName: fileData || "default",
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
