import { getAgentSubscriptionInfo } from "@/lib/action/subscription.action";
import { connectToDatabase } from "@/lib/database/mongoose";
import { currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentId, userId } = await req.json();
  const agentSubscriptions = await getAgentSubscriptionInfo(userId, agentId);

  if (!agentSubscriptions) {
    return NextResponse.json(
      { error: "No active subscription for this agent" },
      { status: 403 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
