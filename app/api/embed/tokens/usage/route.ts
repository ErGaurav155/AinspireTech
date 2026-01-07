import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { verifyApiKey } from "@/lib/utils";
import { usedTokens } from "@/lib/services/token";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-KEY",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key from header
    const apiKey = request.headers.get("X-API-KEY");

    if (!apiKey || !verifyApiKey(apiKey)) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId, chatbotType, tokensUsed } = body;

    // Validate required fields
    if (!userId || !chatbotType || tokensUsed === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: userId, chatbotType, tokensUsed" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate tokensUsed is a positive number
    if (typeof tokensUsed !== "number" || tokensUsed <= 0) {
      return NextResponse.json(
        { error: "tokensUsed must be a positive number" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Use tokens
    const tokenResult = await usedTokens(
      userId,
      tokensUsed,
      chatbotType,
      tokensUsed * 0.0000014 // Approximate cost calculation
    );

    if (!tokenResult.success) {
      return NextResponse.json(
        { error: "Failed to update token usage" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Token usage tracked successfully",
        data: {
          remainingTokens: tokenResult.remainingTokens,
          tokensUsed: tokensUsed,
        },
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error tracking token usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
