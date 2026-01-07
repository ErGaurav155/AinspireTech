import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { getTokenBalanceSummary } from "@/lib/services/token";
import { verifyApiKey } from "@/lib/utils";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-KEY",
    },
  });
}

export async function GET(request: NextRequest) {
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

    // Get userId from query parameter
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
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

    // Get token balance
    const tokenBalance = await getTokenBalanceSummary(userId);

    return NextResponse.json(
      {
        success: true,
        data: tokenBalance,
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
    console.error("Error fetching token balance:", error);
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
