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

    // Get the user's rate limit document
    const rateLimitDoc = await RateUserRateLimit.findOne({ clerkId: userId });

    // Get all Instagram account IDs
    const accountIds = accounts.map((account) => account.instagramId);

    let totalReplies = 0;
    const rateUserCallMap: Record<string, number> = {};

    if (rateLimitDoc) {
      accounts.forEach((account) => {
        const hasAutomationActive = !rateLimitDoc.instagramAccounts.includes(
          account.instagramId
        );

        if (hasAutomationActive) {
          const activeAccountsCount =
            accounts.length - rateLimitDoc.instagramAccounts.length;
          const repliesPerAccount =
            activeAccountsCount > 0
              ? Math.floor(rateLimitDoc.callsMade / activeAccountsCount)
              : 0;

          rateUserCallMap[account.instagramId] = repliesPerAccount;
          totalReplies += repliesPerAccount;
        } else {
          rateUserCallMap[account.instagramId] = 0;
        }
      });
    }

    const enhancedAccounts = await Promise.all(
      accounts.map(async (account) => {
        // Get template count
        const templatesCount = await InstaReplyTemplate.countDocuments({
          accountId: account.instagramId,
        });

        // Get average response time
        const avgResTimeAggregation = await InstaReplyLog.aggregate([
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
        ]);

        const avgResTime =
          avgResTimeAggregation.length > 0
            ? avgResTimeAggregation[0].avgResponseTime
            : 0;

        return {
          ...account.toObject(),
          templatesCount,
          avgResTime,
          replies: rateUserCallMap[account.instagramId] || 0,
          isAutomationPaused:
            rateLimitDoc?.instagramAccounts.includes(account.instagramId) ||
            false,
        };
      })
    );

    return NextResponse.json({
      accounts: enhancedAccounts,
      totalReplies,
      accountLimit: userData.accountLimit,
      replyLimit: userData.replyLimit || rateLimitDoc?.tierLimit || 100, // Use tierLimit from rate limit doc
      totalAccounts: accounts.length,
      tier: rateLimitDoc?.tier || "free",
      callsMade: rateLimitDoc?.callsMade || 0,
      tierLimit: rateLimitDoc?.tierLimit || 100,
      isAutomationPaused: rateLimitDoc?.isAutomationPaused || false,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
