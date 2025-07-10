import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import WebAppointmentQuestions from "@/lib/database/models/web/AppointmentQuestions.model";
const SECRET_KEY = "your-secret-key"; // Store this securely

export async function POST(request: Request) {
  try {
    const secretKey = request.headers.get("X-Secret-Key");

    // If the key is missing or incorrect, return a 403 Forbidden response
    if (secretKey !== SECRET_KEY) {
      return NextResponse.json(
        { error: "Forbidden: Invalid secret key" },
        { status: 403 }
      );
    }

    // Allow cross-origin requests from your trusted domain
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
      // Preflight response
      return NextResponse.json({}, { status: 200, headers });
    }
    const { chatbotType, userId } = await request.json();

    if (!chatbotType || !userId) {
      return NextResponse.json(
        { error: "Chatbot and UserId type is required" },
        { status: 400 }
      );
    }
    await connectToDatabase();

    const questions = await WebAppointmentQuestions.findOne({
      clerkId: userId,
      chatbotType,
    });

    if (!questions) {
      return NextResponse.json(
        { error: "Questions is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ appointmentQuestions: questions, headers });
  } catch (error) {
    console.error("Appointment questions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
