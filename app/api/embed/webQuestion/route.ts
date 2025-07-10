import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import WebAppointmentQuestions from "@/lib/database/models/web/AppointmentQuestions.model";

export async function POST(request: Request) {
  try {
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

    return NextResponse.json({ appointmentQuestions: questions });
  } catch (error) {
    console.error("Appointment questions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
