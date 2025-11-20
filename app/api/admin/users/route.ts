import User from "@/lib/database/models/user.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { requireOwner } from "@/proxy";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check if user is owner
    const authError = requireOwner(request);
    if (authError) return authError;

    await connectToDatabase();

    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: users,
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
