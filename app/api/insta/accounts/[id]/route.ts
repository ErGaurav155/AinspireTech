import { revokeInstagramAccess } from "@/lib/action/insta.action";
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
    const account = await InstagramAccount.findById(params.id);

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    const revokeInstaAccess = await revokeInstagramAccess(
      account.instagramId,
      account.accessToken
    );
    if (revokeInstaAccess && revokeInstaAccess.success) {
      await InstagramAccount.findByIdAndDelete(params.id);
      await InstaReplyTemplate.deleteMany({ accountId: params.id });
      await InstaReplyLog.deleteMany({ accountId: params.id });
    } else {
      return NextResponse.json({ message: "Account deletion Failed" });
    }
    // Delete related templates

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
