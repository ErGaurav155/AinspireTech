import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // In a real app, you'd get the user ID from authentication
    const userId = "demo-user";

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

    // In a real app, you'd get the user ID from authentication
    const userId = "demo-user";

    // Check if account already exists
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
