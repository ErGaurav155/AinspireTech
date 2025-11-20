import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import WebAppointmentQuestions from "@/lib/database/models/web/AppointmentQuestions.model";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatbotType = searchParams.get("chatbotType");

    if (!chatbotType) {
      return NextResponse.json(
        { error: "Chatbot type is required" },
        { status: 400 }
      );
    }
    await connectToDatabase;

    const questions = await WebAppointmentQuestions.findOne({
      clerkId: userId,
      chatbotType,
    });

    if (!questions) {
      // Return default questions if none exist
      const defaultQuestions = {
        clerkId: userId,
        chatbotType: chatbotType,
        questions: [
          {
            id: 1,
            question: "What is your full name?",
            type: "text",
            required: true,
          },
          {
            id: 2,
            question: "What is your email address?",
            type: "email",
            required: true,
          },
          {
            id: 3,
            question: "What is your phone number?",
            type: "tel",
            required: true,
          },
          {
            id: 4,
            question: "What service are you interested in?",
            type: "select",
            options: ["Consultation", "Service A", "Service B"],
            required: true,
          },
          {
            id: 5,
            question: "Preferred appointment date?",
            type: "date",
            required: true,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await WebAppointmentQuestions.create(defaultQuestions);
      return NextResponse.json({ appointmentQuestions: defaultQuestions });
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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatbotType, questions } = await request.json();

    if (!chatbotType || !questions) {
      return NextResponse.json(
        { error: "Chatbot type and questions are required" },
        { status: 400 }
      );
    }

    await connectToDatabase;

    const result = await WebAppointmentQuestions.updateOne(
      {
        clerkId: userId,
        chatbotType,
      },
      {
        $set: {
          questions,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          clerkId: userId,
          chatbotType,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Appointment questions saved successfully",
      upserted: result.upsertedCount > 0,
    });
  } catch (error) {
    console.error("Appointment questions save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
