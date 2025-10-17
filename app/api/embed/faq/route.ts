// app/api/embed/faq/route.ts
import webFaq from "@/lib/database/models/web/webFaq.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.API_KEY!;

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

    const body = await request.json();
    const { userId, chatbotType } = body;

    if (!userId || !chatbotType) {
      return NextResponse.json(
        { error: "userId and chatbotType are required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
    await connectToDatabase();

    const faq = await webFaq.findOne({ clerkId: userId, chatbotType });

    if (!faq) {
      return NextResponse.json(
        {
          success: true,
          faq: {
            questions: [],
          },
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        faq,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("FAQ fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch FAQ: " + error.message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
