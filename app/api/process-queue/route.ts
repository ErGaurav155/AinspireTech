// app/api/cron/process-queue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hybridQueueProcessor } from "@/lib/services/hybridQueueProcessor";
import { connectToDatabase } from "@/lib/database/mongoose";

export const runtime = "nodejs"; // Required for Vercel Cron Jobs
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

export async function POST(request: NextRequest) {
  return await GET(request);
}
