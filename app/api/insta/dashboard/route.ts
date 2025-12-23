import { getUserById } from "@/lib/action/user.actions";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaReplyLog from "@/lib/database/models/insta/ReplyLog.model";
import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import { RateUserCall } from "@/lib/database/models/rate/UserCall.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const userData = await getUserById(userId);
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all accounts with enhanced data
    const accounts = await InstagramAccount.find({ userId: userId }).sort({
      createdAt: -1,
    });
    if (accounts.length === 0) {
      return NextResponse.json({ accounts: [], totalReplies: 0 });
    }

    // Get all RateUserCall documents for the user's accounts
    const accountIds = accounts.map((account) => account.instagramId);
    const rateUserCalls = await RateUserCall.find({
      instagramId: { $in: accountIds },
    });

    // Create a map for quick lookup with proper typing
    const rateUserCallMap: Record<string, number> = {};
    let totalReplies = 0;

    rateUserCalls.forEach((call) => {
      rateUserCallMap[call.instagramId] = call.count;
      totalReplies += call.count;
    });

    const enhancedAccounts = await Promise.all(
      accounts.map(async (account) => {
        // Get template count
        const templatesCount = await InstaReplyTemplate.countDocuments({
          accountId: account.instagramId,
        });
        const avgResTime = (await InstaReplyLog.aggregate([
          {
            $match: {
              accountId: account.instagramId,
              success: true,
            },
          },
          {
            $group: {
              _id: null,
              avgResponseTime: { $avg: "$responseTime" },
            },
          },
        ])) || [{ avgResponseTime: 0 }];

        return {
          ...account.toObject(), // Convert Mongoose document to plain object
          templatesCount,
          avgResTime,
          replies: rateUserCallMap[account.instagramId] || 0,
        };
      })
    );

    return NextResponse.json({
      accounts: enhancedAccounts,
      totalReplies, // Now calculated dynamically
      accountLimit: userData.accountLimit,
      replyLimit: userData.replyLimit,
      totalAccounts: accounts.length,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
