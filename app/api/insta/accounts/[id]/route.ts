import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaReplyLog from "@/lib/database/models/insta/ReplyLog.model";
import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import RateUserRateLimit from "@/lib/database/models/Rate/UserRateLimit.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const account = await InstagramAccount.findById(id);

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Get templates count
    const templatesCount = await InstaReplyTemplate.countDocuments({
      accountId: id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const body = await req.json();
    const { isActive, displayName } = body;

    const account = await InstagramAccount.findByIdAndUpdate(
      id,
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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // First, get the account details before deleting
    const account = await InstagramAccount.findById(id);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const { userId, instagramId } = account;

    // Delete account from database
    const deletedAccount = await InstagramAccount.findByIdAndDelete(id);
    if (!deletedAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Delete related templates
    await InstaReplyTemplate.deleteMany({
      accountId: instagramId,
    });

    // Delete related reply logs
    await InstaReplyLog.deleteMany({
      accountId: instagramId,
    });

    // Remove this Instagram account from UserRateLimit tracking
    await removeInstagramAccountFromRateLimit(userId, instagramId);

    return NextResponse.json({
      message: "Account deleted successfully",
      deletedAccount: {
        _id: deletedAccount._id,
        instagramId: deletedAccount.instagramId,
        username: deletedAccount.username,
      },
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

// Helper function to remove Instagram account from UserRateLimit tracking
async function removeInstagramAccountFromRateLimit(
  clerkId: string,
  instagramAccountId: string
): Promise<void> {
  try {
    // Get current window
    const currentWindow = new Date();
    currentWindow.setUTCMinutes(0, 0, 0); // Set to start of current hour

    // Find user rate limit record for current window
    const userRateLimit = await RateUserRateLimit.findOne({
      clerkId,
      windowStart: currentWindow,
    });

    if (userRateLimit) {
      // Remove the account from accountUsage array
      const initialLength = userRateLimit.accountUsage.length;
      userRateLimit.accountUsage = userRateLimit.accountUsage.filter(
        (acc: any) => acc.instagramAccountId !== instagramAccountId
      );

      // If account was removed, save the changes
      if (userRateLimit.accountUsage.length < initialLength) {
        await userRateLimit.save();
      } else {
        console.log(
          `Instagram account ${instagramAccountId} not found in rate limit tracking for user ${clerkId}`
        );
      }
    }

    // Also clean up any old window records (optional, for cleanup)
    // Remove from all windows older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    twentyFourHoursAgo.setUTCMinutes(0, 0, 0);

    await RateUserRateLimit.updateMany(
      {
        clerkId,
        windowStart: { $lt: twentyFourHoursAgo },
        "accountUsage.instagramAccountId": instagramAccountId,
      },
      {
        $pull: {
          accountUsage: { instagramAccountId: instagramAccountId },
        },
      }
    );
  } catch (error) {
    console.error(
      "Error removing Instagram account from rate limit tracking:",
      error
    );
  }
}
