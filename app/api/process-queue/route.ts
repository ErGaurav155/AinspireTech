import { NextRequest, NextResponse } from "next/server";
import {
  manualCleanupOldQueueItems,
  processQueueBatch,
} from "@/lib/services/queueProcessor";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(`Starting queue processing at ${new Date().toISOString()}`);

    // Process queue
    const processResult = await processQueueBatch(100);

    // Clean up old queue items (run less frequently)
    const now = new Date();
    if (now.getMinutes() % 30 === 0) {
      // Run every 30 minutes
      const cleanupResult = await manualCleanupOldQueueItems();
    }

    console.log(`Queue processing completed:`, processResult);

    return NextResponse.json({
      success: true,
      message: "Queue processed successfully",
      data: {
        processing: processResult,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in process-queue cron:", error);

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
