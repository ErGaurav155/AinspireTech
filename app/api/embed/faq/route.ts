// app/api/embed/faq/route.ts
import FAQ from "@/lib/database/models/web/webFaq.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.API_KEY!;

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "*";

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, X-API-KEY, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || "*";

    const apiKey = request.headers.get("X-API-KEY");

    if (!apiKey || apiKey !== SECRET_KEY) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: Invalid API key" }),
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": origin,
            "Content-Type": "application/json",
          },
        }
      );
    }

    await connectToDatabase();
    const body = await request.json();
    const { userId, chatbotType } = body;

    if (!userId || !chatbotType) {
      return new NextResponse(
        JSON.stringify({ error: "userId and chatbotType are required" }),
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": origin,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const faq = await FAQ.findOne({ clerkId: userId, chatbotType });

    if (!faq) {
      return new NextResponse(
        JSON.stringify({
          success: true,
          faq: {
            questions: [],
          },
        }),
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": origin,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        faq,
      }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("FAQ fetch error:", error);
    const origin = request.headers.get("origin") || "*";

    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch FAQ: " + error.message }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
