import { getInstagramProfileAction as getInstagramProfile } from "@/lib/action/instaApi.action";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaReplyLog from "@/lib/database/models/insta/ReplyLog.model";
import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Get all accounts with enhanced data
    const accounts = await InstagramAccount.find({}).sort({ createdAt: -1 });

    const enhancedAccounts = await Promise.all(
      accounts.map(async (account) => {
        // Get template count
        const templatesCount = await InstaReplyTemplate.countDocuments({
          accountId: account._id,
          isActive: true,
        });

        // Get reply count from logs
        const repliesCount = await InstaReplyLog.countDocuments({
          accountId: account._id,
          success: true,
        });

        // Mock Instagram API data
        const profile = await getInstagramProfile("mock_token");

        return {
          id: account._id,
          username: account.username,
          displayName: account.displayName || account.username,
          profilePicture: account.profilePicture || profile.profile_picture_url,
          followersCount: account.followersCount || profile.followers_count,
          postsCount: account.postsCount || profile.media_count,
          isActive: account.isActive,
          templatesCount,
          repliesCount,
          lastActivity: account.lastActivity,
          engagementRate: Math.random() * 5 + 2, // Mock data
          avgResponseTime: (Math.random() * 2 + 1).toFixed(1) + "s",
        };
      })
    );

    // Calculate overall stats
    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter(
      (account) => account.isActive
    ).length;
    const totalTemplates = await InstaReplyTemplate.countDocuments({
      isActive: true,
    });
    const totalReplies = await InstaReplyLog.countDocuments({ success: true });

    // Get recent activity
    const recentLogs = await InstaReplyLog.find({ success: true })
      .populate("accountId")
      .populate("templateId")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentActivity = recentLogs.map((log) => ({
      id: log._id,
      type: "reply_sent",
      account: log.accountId.username,
      template: log.templateId?.name || "Unknown",
      timestamp: log.createdAt,
      message: `Auto-reply sent to @${log.commenterUsername}`,
    }));

    const stats = {
      totalAccounts,
      activeAccounts,
      totalTemplates,
      totalReplies,
      engagementRate: 87, // Mock data
      successRate: 94, // Mock data
      accounts: enhancedAccounts,
      recentActivity,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
