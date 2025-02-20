import { NextRequest, NextResponse } from "next/server";
import { twiml } from "twilio";
import { connectToDatabase } from "@/lib/database/mongoose";
import Subscription from "@/lib/database/models/subscription.model";
import User from "@/lib/database/models/user.model";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { From, To } = await req.json();

    const user = await User.findOne({ phone: To });
    if (!user) {
      return NextResponse.json({ message: "User Not Found " }, { status: 403 });
    }
    const SubscribedUser = await Subscription.findOne({
      userId: user._id,
      productId: "ai-agent-customer-support",
      subscriptionStatus: "active",
    });
    if (!SubscribedUser) {
      return NextResponse.json(
        { message: "Subscription isExpired or Not Found " },
        { status: 403 }
      );
    }
    const response = new twiml.VoiceResponse();
    response.say("Hello, I am your AI assistant. Please describe your issue.");
    response.record({
      transcribe: true,
      maxLength: 60,
      action: `/api/twilio/process?userId=${user._id}`,
    });

    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
