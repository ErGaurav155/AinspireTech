import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaReplyLog from "@/lib/database/models/insta/ReplyLog.model";
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
    const recentLogs = await InstaReplyLog.find({
      userId: userId,
      success: true,
    })
      .populate("accountId")
      .populate("templateId")
      .sort({ createdAt: -1 })
      .limit(10);
    const recentActivity = recentLogs.map((log) => ({
      id: log._id,
      type: "reply_sent",
      account: log.commenterUsername,
      template: log.templateName || "Unknown",
      timestamp: log.createdAt,
      message: `Auto-reply sent to @${log.commenterUsername}`,
    }));
    // Calculate overall stats
    return NextResponse.json({ replyLogs: recentActivity });
  } catch (error) {
    console.error("Error fetching Reply stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch Reply stats" },
      { status: 500 }
    );
  }
}
