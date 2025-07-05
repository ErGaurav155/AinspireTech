import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDatabase } from "@/lib/database/mongoose";
import Subscription from "@/lib/database/models/subscription.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatbotType: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d";

    const activeSubscription = await Subscription.findOne({
      clerkId: userId,
      chatbotType: params.chatbotType,
      status: "active",
    });

    if (!activeSubscription) {
      return NextResponse.json(
        { error: "No active subscription for this chatbot type" },
        { status: 403 }
      );
    }

    // Generate analytics data based on chatbot type
    const generateAnalyticsData = (chatbotType: string) => {
      const baseData = {
        "customer-support": {
          totalConversations: Math.floor(Math.random() * 1000) + 500,
          totalMessages: Math.floor(Math.random() * 5000) + 2000,
          averageResponseTime: Math.floor(Math.random() * 10) + 2,
          satisfactionScore: Math.floor(Math.random() * 20) + 80,
          resolvedIssues: Math.floor(Math.random() * 800) + 400,
          pendingTickets: Math.floor(Math.random() * 50) + 10,
        },
        "e-commerce": {
          totalConversations: Math.floor(Math.random() * 1500) + 800,
          totalMessages: Math.floor(Math.random() * 7000) + 3000,
          salesAssisted: Math.floor(Math.random() * 50000) + 20000,
          cartRecoveries: Math.floor(Math.random() * 200) + 100,
          conversionRate: Math.floor(Math.random() * 10) + 8,
          productInquiries: Math.floor(Math.random() * 2000) + 1000,
        },
        "lead-generation": {
          totalConversations: Math.floor(Math.random() * 800) + 300,
          totalMessages: Math.floor(Math.random() * 3000) + 1500,
          leadsGenerated: Math.floor(Math.random() * 500) + 200,
          qualifiedLeads: Math.floor(Math.random() * 200) + 100,
          conversionRate: Math.floor(Math.random() * 8) + 5,
          formCompletions: Math.floor(Math.random() * 20) + 70,
        },
        "instagram-automation": {
          totalConversations: Math.floor(Math.random() * 2000) + 1000,
          totalMessages: Math.floor(Math.random() * 8000) + 4000,
          commentsReplied: Math.floor(Math.random() * 3000) + 1500,
          dmsAutomated: Math.floor(Math.random() * 1000) + 500,
          engagementRate: Math.floor(Math.random() * 10) + 12,
          followersGrowth: Math.floor(Math.random() * 400) + 200,
        },
      };

      return (
        baseData[chatbotType as keyof typeof baseData] ||
        baseData["customer-support"]
      );
    };

    // Generate trend data for charts
    const generateTrendData = () => {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((day) => ({
        name: day,
        conversations: Math.floor(Math.random() * 100) + 20,
        responses: Math.floor(Math.random() * 90) + 15,
        engagement: Math.floor(Math.random() * 80) + 10,
      }));
    };

    const analyticsData = {
      overview: generateAnalyticsData(params.chatbotType),
      trends: generateTrendData(),
      responseTime: [
        { time: "0-30s", count: Math.floor(Math.random() * 200) + 100 },
        { time: "30s-1m", count: Math.floor(Math.random() * 150) + 50 },
        { time: "1-2m", count: Math.floor(Math.random() * 100) + 30 },
        { time: "2-5m", count: Math.floor(Math.random() * 50) + 20 },
        { time: "5m+", count: Math.floor(Math.random() * 30) + 10 },
      ],
      satisfaction: [
        {
          name: "Excellent",
          value: Math.floor(Math.random() * 20) + 40,
          color: "#00F0FF",
        },
        {
          name: "Good",
          value: Math.floor(Math.random() * 20) + 30,
          color: "#B026FF",
        },
        {
          name: "Average",
          value: Math.floor(Math.random() * 15) + 10,
          color: "#FF2E9F",
        },
        {
          name: "Poor",
          value: Math.floor(Math.random() * 10) + 5,
          color: "#666",
        },
      ],
    };

    return NextResponse.json({ analytics: analyticsData });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
