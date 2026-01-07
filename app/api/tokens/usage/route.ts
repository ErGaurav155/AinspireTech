import { NextRequest, NextResponse } from "next/server";
import { getTokenUsageStats, getChatbotTokenUsage } from "@/lib/services/token";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period =
      (searchParams.get("period") as "day" | "week" | "month" | "year") ||
      "month";
    const chatbotId = searchParams.get("chatbotId");

    if (chatbotId) {
      const usage = await getChatbotTokenUsage(userId, chatbotId);
      return NextResponse.json({
        success: true,
        data: usage,
      });
    } else {
      const stats = await getTokenUsageStats(userId, period);
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }
  } catch (error) {
    console.error("Error fetching token usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
