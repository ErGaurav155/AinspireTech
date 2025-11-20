import { isOwner } from "@/proxy";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const owner = isOwner(request);

    return NextResponse.json({
      success: true,
      isOwner: owner,
      message: owner
        ? "You are the owner"
        : "You are not the owner. Access denied.",
    });
  } catch (error) {
    console.error("Error verifying owner:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify owner",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
