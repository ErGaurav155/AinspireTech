import { NextResponse } from "next/server";
import InstagramAccount from "@/lib/database/models/instaAcc.model";
import { connectToDatabase } from "@/lib/database/mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    const userId = "demo-user"; // Replace with actual user ID from auth
    const accounts = await InstagramAccount.find({ userId }).sort({
      createdAt: -1,
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { username, displayName } = body;
    const userId = "demo-user"; // Replace with actual user ID from auth

    const existingAccount = await InstagramAccount.findOne({ username });
    if (existingAccount) {
      return NextResponse.json(
        { error: "Account already exists" },
        { status: 400 }
      );
    }

    const account = new InstagramAccount({
      userId,
      username,
      displayName,
      isActive: true,
      lastActivity: new Date(),
    });

    await account.save();
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const deletedAccount = await InstagramAccount.findByIdAndDelete(id);

    if (!deletedAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
