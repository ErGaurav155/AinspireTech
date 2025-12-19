// app/api/rate-limits/cleanup/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cleanupOldQueueItems } from "@/lib/services/queue";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days")
      ? parseInt(searchParams.get("days")!)
      : 7;

    const deletedCount = await cleanupOldQueueItems(days);

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} old queue items`,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup queue items" },
      { status: 500 }
    );
  }
}
