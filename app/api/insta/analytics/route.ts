import InstaAnalytics from "@/lib/database/models/insta/Analytics.model";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaReplyLog from "@/lib/database/models/insta/ReplyLog.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const timeRange = searchParams.get("timeRange") || "7d";

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "24h":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Build query filter
    const filter: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (accountId && accountId !== "all") {
      filter.accountId = accountId;
    }

    // Get analytics data
    const analyticsData = await InstaAnalytics.find(filter).populate(
      "accountId"
    );

    // Get reply logs for detailed analysis
    const replyLogs = await InstaReplyLog.find(filter)
      .populate("accountId")
      .populate("templateId")
      .sort({ createdAt: -1 })
      .limit(100);

    // Calculate overview metrics
    const totalReplies = replyLogs.length;
    const successfulReplies = replyLogs.filter((log) => log.success).length;
    const successRate =
      totalReplies > 0 ? (successfulReplies / totalReplies) * 100 : 0;
    const avgResponseTime =
      replyLogs.length > 0
        ? replyLogs.reduce((sum, log) => sum + log.responseTime, 0) /
          replyLogs.length /
          1000
        : 0;

    // Calculate engagement increase (mock calculation)
    const engagementIncrease = Math.random() * 30 + 15;

    // Get account performance
    const accounts = await InstagramAccount.find({});
    const accountPerformance = await Promise.all(
      accounts.map(async (account) => {
        const accountLogs = replyLogs.filter(
          (log) => log.accountId._id.toString() === account._id.toString()
        );

        const accountReplies = accountLogs.length;
        const accountSuccessRate =
          accountReplies > 0
            ? (accountLogs.filter((log) => log.success).length /
                accountReplies) *
              100
            : 0;
        const accountAvgResponseTime =
          accountReplies > 0
            ? accountLogs.reduce((sum, log) => sum + log.responseTime, 0) /
              accountReplies /
              1000
            : 0;

        return {
          id: account._id,
          username: account.username,
          profilePicture:
            account.profilePicture ||
            "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
          replies: accountReplies,
          successRate: accountSuccessRate,
          engagementRate: Math.random() * 5 + 2,
          avgResponseTime: accountAvgResponseTime,
          topTemplate: "Welcome Message", // Mock data
        };
      })
    );

    // Get template performance
    const templateStats = new Map();
    replyLogs.forEach((log) => {
      if (log.templateId) {
        const templateId = log.templateId._id.toString();
        const templateName = log.templateId.name;

        if (!templateStats.has(templateId)) {
          templateStats.set(templateId, {
            name: templateName,
            usage: 0,
            successCount: 0,
            triggers: log.templateId.triggers || [],
          });
        }

        const stats = templateStats.get(templateId);
        stats.usage += 1;
        if (log.success) {
          stats.successCount += 1;
        }
      }
    });

    const templatePerformance = Array.from(templateStats.values()).map(
      (stats) => ({
        name: stats.name,
        usage: stats.usage,
        successRate:
          stats.usage > 0 ? (stats.successCount / stats.usage) * 100 : 0,
        avgEngagement: Math.random() * 5 + 2,
        triggers: stats.triggers.slice(0, 3),
      })
    );

    // Get recent activity
    const recentActivity = replyLogs.slice(0, 20).map((log) => ({
      id: log._id,
      type: log.success ? "reply_sent" : "reply_failed",
      account: log.accountId.username,
      template: log.templateId?.name || "Unknown",
      timestamp: log.createdAt,
      success: log.success,
    }));

    const response = {
      overview: {
        totalReplies,
        successRate: parseFloat(successRate.toFixed(1)),
        avgResponseTime: parseFloat(avgResponseTime.toFixed(1)),
        engagementIncrease: parseFloat(engagementIncrease.toFixed(1)),
      },
      accountPerformance,
      templatePerformance,
      recentActivity,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
