import { NextRequest, NextResponse } from "next/server";
import { resetWindowAndProcessQueue } from "@/lib/services/hourlyRateLimiter";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (from Vercel Cron)
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await resetWindowAndProcessQueue();

    return NextResponse.json({
      success: true,
      message: "Window reset and queue processed successfully",
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in reset-window cron:", error);

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
