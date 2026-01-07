import { NextRequest, NextResponse } from "next/server";
import { getTokenBalanceSummary } from "@/lib/services/token";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenBalance = await getTokenBalanceSummary(userId);

    return NextResponse.json({
      success: true,
      data: tokenBalance,
    });
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
