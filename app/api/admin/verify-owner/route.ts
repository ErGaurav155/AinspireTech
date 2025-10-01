import { isOwner } from "@/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
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
