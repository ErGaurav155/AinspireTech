import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaReplyLog from "@/lib/database/models/insta/ReplyLog.model";
import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    //  const timeRange = searchParams.get("timeRange") || "7d";

    //     // Calculate date range
    //     const endDate = new Date();
    //     const startDate = new Date();

    //     switch (timeRange) {
    //       case "24h":
    //         startDate.setDate(startDate.getDate() - 1);
    //         break;
    //       case "7d":
    //         startDate.setDate(startDate.getDate() - 7);
    //         break;
    //       case "30d":
    //         startDate.setDate(startDate.getDate() - 30);
    //         break;
    //       case "90d":
    //         startDate.setDate(startDate.getDate() - 90);
    //         break;
    //       default:
    //         startDate.setDate(startDate.getDate() - 7);
    //     }

    //     // Build query filter
    //     const filter: any = {
    //       createdAt: { $gte: startDate, $lte: endDate },
    //     };

    //     if (accountId && accountId !== "all") {
    //       filter.accountId = accountId;
    //     }
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    // Get all accounts with enhanced data
    const accounts = await InstagramAccount.find({ userId: userId }).sort({
      createdAt: -1,
    });

    const enhancedAccounts = await Promise.all(
      accounts.map(async (account) => {
        // Get template count
        const templatesCount = await InstaReplyTemplate.countDocuments({
          accountId: account.instagramId,
        });

        // Get reply count from logs
        const repliesCount = await InstaReplyLog.countDocuments({
          accountId: account.instagramId,
          success: true,
        });

        // Mock Instagram API data

        return {
          ...account.toObject(), // Convert Mongoose document to plain object
          templatesCount,
          repliesCount,
        };
      })
    );

    return NextResponse.json({ accounts: enhancedAccounts });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
