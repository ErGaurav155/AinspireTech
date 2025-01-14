import { getAgentSubscriptionInfo } from "@/lib/action/subscription.action";
import { connectToDatabase } from "@/lib/database/mongoose";
import { currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { agentId, userId } = await req.json();
  const agentSubscriptions = await getAgentSubscriptionInfo(userId, agentId);

  if (!agentSubscriptions) {
    return NextResponse.json(
      { error: "No active subscription for this agent" },
      { status: 403 }
    );
  }

  return NextResponse.json({ isValid: "true" }, { status: 200 });
}
