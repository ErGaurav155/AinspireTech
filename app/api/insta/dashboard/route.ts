import { getUserById } from "@/lib/action/user.actions";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaReplyLog from "@/lib/database/models/insta/ReplyLog.model";
import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import RateUserRateLimit from "@/lib/database/models/Rate/UserRateLimit.model";
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
      return NextResponse.json({
        accounts: [],
        totalReplies: 0,
        accountLimit: userData.accountLimit,
        replyLimit: userData.replyLimit,
        totalAccounts: 0,
      });
    }

    const rateLimitData = await RateUserRateLimit.findOne({ clerkId: userId });

    // Create a map for quick lookup of callsMade by instagramAccountId
    const accountCallsMap = new Map<string, number>();
    if (rateLimitData && rateLimitData.accountUsage) {
      rateLimitData.accountUsage.forEach((accountUsage: any) => {
        accountCallsMap.set(
          accountUsage.instagramAccountId,
          accountUsage.callsMade
        );
      });
    }
    const enhancedAccounts = await Promise.all(
      accounts.map(async (account) => {
        // Get template count
        const templatesCount = await InstaReplyTemplate.countDocuments({
          accountId: account.instagramId,
        });

        // Get reply count (callsMade) from rate limit data or calculate from logs
        let replyCount = accountCallsMap.get(account.instagramId) || 0;

        // If not found in rate limit data, calculate from reply logs as fallback
        if (replyCount === 0) {
          replyCount = await InstaReplyLog.countDocuments({
            accountId: account.instagramId,
            success: true,
          });
        }

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
          replyCount, // Add reply count (callsMade)
          avgResTime,
          callsMade: accountCallsMap.get(account.instagramId) || 0,
        };
      })
    );

    return NextResponse.json({
      accounts: enhancedAccounts,
      totalReplies: rateLimitData?.totalCallsMade || 0,
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
