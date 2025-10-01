import WebSubscription from "@/lib/database/models/web/Websubcription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { requireOwner } from "@/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check if user is owner
    const authError = requireOwner(request);
    if (authError) return authError;

    await connectToDatabase();

    const subscriptions = await WebSubscription.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: subscriptions,
      message: "Web subscriptions fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching web subscriptions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch web subscriptions",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
