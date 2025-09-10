import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { setPrimaryAccount } from "@/lib/action/user.actions";
import { connectToDatabase } from "@/lib/database/mongoose";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountId } = await req.json();
    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updatedUser = await setPrimaryAccount(userId, accountId);

    return NextResponse.json({
      message: "Primary account updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error setting primary account:", error);
    return NextResponse.json(
      { error: "Failed to set primary account" },
      { status: 500 }
    );
  }
}
