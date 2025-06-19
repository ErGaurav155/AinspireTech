import { NextRequest, NextResponse } from "next/server";
import { twiml } from "twilio";
// import { connectToDatabase } from "@/lib/database/mongoose";
// import Subscription from "@/lib/database/models/subscription.model";
// import User from "@/lib/database/models/user.model";

export async function POST(req: NextRequest) {
  try {
    // await connectToDatabase();
    const formData = await req.formData();
    const From = formData.get("From");
    const To = formData.get("To");
    // const user = await User.findOne({ twilio: To });
    // if (!user) {
    //   return NextResponse.json({ message: "User Not Found " }, { status: 403 });
    // }
    // const SubscribedUser = await Subscription.findOne({
    //   userId: user._id,
    //   productId: "ai-agent-customer-support",
    //   subscriptionStatus: "active",
    // });
    // if (!SubscribedUser) {
    //   return NextResponse.json(
    //     { message: "Subscription isExpired or Not Found " },
    //     { status: 403 }
    //   );
    // }
    const response = new twiml.VoiceResponse();
    startQuestionnaire(response, From as string, To as string);

    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function startQuestionnaire(response: any, caller: string, To: string) {
  const gather = response.gather({
    input: "speech",
    action: `/api/twilio/next-question?step=1&caller=${caller}&to=${To}`,
    method: "POST",
  });
  gather.say(
    "Hello, I am your AI plumbing assistant. What plumbing issue are you experiencing?"
  );
}
