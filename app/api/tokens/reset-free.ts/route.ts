import { NextRequest, NextResponse } from "next/server";
import { resetFreeTokens } from "@/lib/services/token";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await resetFreeTokens(userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error resetting free tokens:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
