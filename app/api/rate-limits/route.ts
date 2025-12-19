// app/api/rate-limits/status/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAccountStatus,
  getSystemStats,
  getTopUsers,
  resetAccountRateLimit,
} from "@/lib/services/rateLimiter";
import { getQueueStats } from "@/lib/services/queue";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    let rateLimitStatus;
    let queueStats;

    if (accountId) {
      rateLimitStatus = await getAccountStatus(accountId);
      queueStats = await getQueueStats(accountId);
    } else {
      // Get top users if no account specified
      const topUsers = await getTopUsers(10);
      const systemStats = await getSystemStats();
      rateLimitStatus = {
        summary: topUsers,
        system: systemStats,
      };
      queueStats = await getQueueStats();
    }

    return NextResponse.json({
      success: true,
      data: {
        rateLimit: rateLimitStatus,
        queue: queueStats,
        limits: {
          maxCallsPerHour: 180,
          blockThreshold: 170,
          blockDurationMinutes: 5,
        },
      },
    });
  } catch (error) {
    console.error("Rate limit status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate limit status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    await resetAccountRateLimit(accountId);

    return NextResponse.json({
      success: true,
      message: `Rate limit reset for account ${accountId}`,
    });
  } catch (error) {
    console.error("Rate limit reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset rate limit" },
      { status: 500 }
    );
  }
}
