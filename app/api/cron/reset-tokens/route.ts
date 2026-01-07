import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import TokenBalance from "@/lib/database/models/web/token/TokenBalance.model";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const now = new Date();
    const usersToReset = await TokenBalance.find({
      nextResetAt: { $lte: now },
    });

    let resetCount = 0;

    for (const userTokenBalance of usersToReset) {
      try {
        await userTokenBalance.resetFreeTokens();
        resetCount++;
      } catch (error) {
        console.error(
          `Error resetting tokens for user ${userTokenBalance.userId}:`,
          error
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reset free tokens for ${resetCount} users`,
      resetCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
