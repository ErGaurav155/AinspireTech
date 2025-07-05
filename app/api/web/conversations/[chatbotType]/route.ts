import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDatabase } from "@/lib/database/mongoose";
import Subscription from "@/lib/database/models/Websubcription.model";
import Conversation from "@/lib/database/models/Conversation.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatbotType: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    await connectToDatabase;
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

    // Generate mock conversations if none exist
    const existingConversations = await Conversation.find({
      clerkId: userId,
      chatbotType: params.chatbotType,
    })
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    if (existingConversations.length === 0) {
      // Generate mock conversations
      const mockConversations = [
        {
          _id: "mock1",
          chatbotId: "chatbot1",
          chatbotType: params.chatbotType,
          userId: userId,
          clerkId: userId,
          customerName: "John Doe",
          customerEmail: "john@example.com",
          messages: [
            {
              id: "msg1",
              type: "user" as const,
              content: "I want to book an appointment",
              timestamp: new Date(Date.now() - 120000),
            },
            {
              id: "msg2",
              type: "bot" as const,
              content:
                "I'd be happy to help you book an appointment. Let me get some details from you.",
              timestamp: new Date(Date.now() - 110000),
            },
          ],
          formData: {
            name: "John Doe",
            email: "john@example.com",
            phone: "+1234567890",
            service: "Consultation",
            date: "2024-01-15",
            message: "Looking for AI consultation services",
          },
          status: "answered" as const,
          tags: [],
          createdAt: new Date(Date.now() - 120000),
          updatedAt: new Date(Date.now() - 110000),
        },
        {
          _id: "mock2",
          chatbotId: "chatbot1",
          chatbotType: params.chatbotType,
          userId: userId,
          clerkId: userId,
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          messages: [
            {
              id: "msg3",
              type: "user" as const,
              content: "What are your business hours?",
              timestamp: new Date(Date.now() - 300000),
            },
            {
              id: "msg4",
              type: "bot" as const,
              content:
                "Our business hours are Monday-Friday 9AM-6PM. How can I assist you today?",
              timestamp: new Date(Date.now() - 290000),
            },
          ],
          status: "answered" as const,
          tags: [],
          createdAt: new Date(Date.now() - 300000),
          updatedAt: new Date(Date.now() - 290000),
        },
        {
          _id: "mock3",
          chatbotId: "chatbot1",
          chatbotType: params.chatbotType,
          userId: userId,
          clerkId: userId,
          customerName: "Mike Johnson",
          customerEmail: "mike@example.com",
          messages: [
            {
              id: "msg5",
              type: "user" as const,
              content: "I need help with pricing",
              timestamp: new Date(Date.now() - 600000),
            },
          ],
          formData: {
            name: "Mike Johnson",
            email: "mike@example.com",
            phone: "+1987654321",
            service: "Service A",
            date: "2024-01-16",
            message: "Interested in your premium services",
          },
          status: "pending" as const,
          tags: [],
          createdAt: new Date(Date.now() - 600000),
          updatedAt: new Date(Date.now() - 600000),
        },
      ];

      return NextResponse.json({
        conversations: mockConversations,
        total: mockConversations.length,
        hasMore: false,
      });
    }

    const total = await Conversation.countDocuments({
      clerkId: userId,
      chatbotType: params.chatbotType,
    });

    return NextResponse.json({
      conversations: existingConversations,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Conversations fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
