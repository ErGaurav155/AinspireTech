// app/api/cron/route.ts
import { resetFreeCouponsForAllUsers } from "@/lib/action/user.actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resetCount = await resetFreeCouponsForAllUsers();
    console.log(" resetCount:", resetCount);
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
