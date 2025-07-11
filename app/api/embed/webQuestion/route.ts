import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import WebAppointmentQuestions from "@/lib/database/models/web/AppointmentQuestions.model";

const SECRET_KEY = process.env.API_KEY!; // Ensure this is set in your environment

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-KEY" // Added X-API-KEY
  );
  return response;
}

export async function POST(request: Request) {
  try {
    // 1. First check the API key from headers
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

    // 2. Then parse and validate the request body
    const { chatbotType, userId } = await request.json();

    if (!chatbotType || !userId) {
      return NextResponse.json(
        { error: "Chatbot type and UserId are required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 3. Only now connect to database
    await connectToDatabase();

    const questions = await WebAppointmentQuestions.findOne({
      clerkId: userId,
      chatbotType,
    });

    if (!questions) {
      return NextResponse.json(
        { error: "No questions found for this user and chatbot type" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return NextResponse.json(
      { appointmentQuestions: questions },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Appointment questions fetch error:", error);
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
