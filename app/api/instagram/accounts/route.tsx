import { NextRequest, NextResponse } from "next/server";
import { getInstagramAccounts } from "@/lib/action/insta.action";

export async function GET(req: NextRequest) {
  const accessToken = req.nextUrl.searchParams.get("access_token");

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token is required" },
      { status: 400 }
    );
  }

  try {
    const accounts = await getInstagramAccounts(accessToken);
    return NextResponse.json({ accounts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch Instagram accounts" },
      { status: 500 }
    );
  }
}
