import { getAgentSubscriptionInfo } from "@/lib/action/subscription.action";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Allow cross-origin requests from your localhost during development
  const headers = new Headers();

  headers.set(
    "Access-Control-Allow-Origin",
    "https://pathology-pink.vercel.app"
  ); // Allow all domains (change to specific domains if needed)
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    // Preflight response
    return NextResponse.json({}, { status: 200, headers });
  }

  const { agentId, userId } = await req.json();
  const agentSubscriptions = await getAgentSubscriptionInfo(userId, agentId);

  if (!agentSubscriptions) {
    return NextResponse.json(
      { error: "No active subscription for this agent" },
      { status: 403, headers }
    );
  }

  // Return the valid subscription response with CORS headers
  return NextResponse.json({ isValid: "true" }, { status: 200, headers });
}
