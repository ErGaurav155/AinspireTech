// app/api/public/process-queue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hybridQueueProcessor } from "@/lib/services/hybridQueueProcessor";
import { connectToDatabase } from "@/lib/database/mongoose";

// Public endpoint that can be called by external cron services
export async function GET(request: NextRequest) {
  try {
    // Simple security check (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_PUBLIC_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const result = await hybridQueueProcessor();

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing queue:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return await GET(request);
}
