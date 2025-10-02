// app/api/cron/route.ts
import { resetFreeCouponsForAllUsers } from "@/lib/action/user.actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resetCount = await resetFreeCouponsForAllUsers();
    return NextResponse.json({
      success: true,
      message: `Coupons reset for ${resetCount} users`,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to reset coupons" },
      { status: 500 }
    );
  }
}
