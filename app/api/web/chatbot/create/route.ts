import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";
import WebChatbot from "@/lib/database/models/web/WebChatbot.model";
import WebSubscription from "@/lib/database/models/web/Websubcription.model";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, websiteUrl, subscriptionId } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already has this type of chatbot
    const existingChatbot = await WebChatbot.findOne({
      clerkId: userId,
      type,
    });

    if (existingChatbot) {
      return NextResponse.json(
        { error: "You can only create one chatbot of this type" },
        { status: 400 }
      );
    }

    // Check if subscription is active for this chatbot type (if provided)
    if (subscriptionId) {
      const subscription = await WebSubscription.findOne({
        clerkId: userId,
        chatbotType: type,
        status: "active",
        subscriptionId,
      });

      if (!subscription) {
        return NextResponse.json(
          { error: "Active subscription required for this chatbot type" },
          { status: 400 }
        );
      }
    }

    // Generate embed code
    const chatbotId = new ObjectId();
    const embedCode = `<script>
  (function() {
    const chatbotConfig = {
      id: '${chatbotId}',
      apiUrl: '${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/chatbot',
      settings: {
        welcomeMessage: "Hello! How can I help you today?",
        primaryColor: "#3B82F6",
        position: "bottom-right",
        autoExpand: true
      }
    };
    
    const script = document.createElement('script');
    script.src = '${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    }/chatbot-embed.js';
    script.setAttribute('data-chatbot-config', JSON.stringify(chatbotConfig));
    document.head.appendChild(script);
  })();
</script>`;

    const newChatbot = {
      _id: chatbotId,
      clerkId: userId,
      name,
      type,
      websiteUrl: websiteUrl || null,
      embedCode,
      settings: {
        welcomeMessage: "Hello! How can I help you today?",
        primaryColor: "#3B82F6",
        position: "bottom-right",
        autoExpand: true,
      },
      analytics: {
        totalConversations: 0,
        totalMessages: 0,
        averageResponseTime: 0,
        satisfactionScore: 0,
      },
      isActive: true,
      subscriptionId: subscriptionId || null,
    };

    const createdChatbot = await WebChatbot.create(newChatbot);

    return NextResponse.json({
      message: "Chatbot created successfully",
      chatbot: {
        id: createdChatbot._id,
        ...createdChatbot.toObject(),
      },
    });
  } catch (error) {
    console.error("Chatbot creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
