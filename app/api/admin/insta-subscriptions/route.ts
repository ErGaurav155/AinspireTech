import InstaSubscription from "@/lib/database/models/insta/InstaSubscription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { requireOwner } from "@/proxy";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check if user is owner
    const authError = requireOwner(request);
    if (authError) return authError;

    await connectToDatabase();

    const subscriptions = await InstaSubscription.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: subscriptions,
      message: "Instagram subscriptions fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching instagram subscriptions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch instagram subscriptions",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
