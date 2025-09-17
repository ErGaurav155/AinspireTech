import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaReplyLog from "@/lib/database/models/insta/ReplyLog.model";
import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const account = await InstagramAccount.findById(params.id);

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Get templates count
    const templatesCount = await InstaReplyTemplate.countDocuments({
      accountId: params.id,
      isActive: true,
    });

    // Mock Instagram API data (replace with real API calls)

    const accountData = {
      ...account.toObject(),
      templatesCount,
    };

    return NextResponse.json(accountData);
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { isActive, displayName } = body;

    const account = await InstagramAccount.findByIdAndUpdate(
      params.id,
      {
        isActive,
        displayName,
        lastActivity: new Date(),
      },
      { new: true }
    );

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Delete account and all related data
    const account = await InstagramAccount.findByIdAndDelete(params.id);
    console.log("account:", account);
    if (!account) {
      console.log("hi hellooooo:");
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Delete related templates
    await InstaReplyTemplate.deleteMany({
      accountId: account.instagramId,
    });

    await InstaReplyLog.deleteMany({
      accountId: account.instagramId,
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
