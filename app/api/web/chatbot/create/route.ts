import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/database/mongoose";
import WebChatbot from "@/lib/database/models/web/chatbot.model";

export async function POST(request: NextRequest) {
  try {
    const { userId, name, websiteUrl, settings } = await request.json();

    if (!userId || !name || !websiteUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase(); // Don't forget parentheses

    // Generate embed code
    const chatbotId = new ObjectId();
    const embedCode = `<script>
  (function() {
    const chatbotConfig = {
      id: '${chatbotId}',
      apiUrl: '${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/chatbot',
      settings: ${JSON.stringify(settings)}
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
      _id: chatbotId, // Use the ObjectId directly
      clerkId: userId, // Convert string to ObjectId
      name,
      websiteUrl,
      embedCode,
      settings: {
        welcomeMessage:
          settings?.welcomeMessage || "Hi! How can I help you today?",
        primaryColor: settings?.primaryColor || "#00F0FF",
        position: settings?.position || "bottom-right",
        autoExpand: settings?.autoExpand || false,
      },
      analytics: {
        totalConversations: 0,
        totalMessages: 0,
        averageResponseTime: 0,
        satisfactionScore: 0,
      },
      isActive: true,
    };

    // Use Mongoose create() method
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
