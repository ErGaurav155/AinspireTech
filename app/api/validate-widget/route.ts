import { getAgentSubscriptionInfo } from "@/lib/action/subscription.action";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = "your-secret-key"; // Store this securely

export async function POST(req: NextRequest) {
  // Check for the secret key in the headers
  const secretKey = req.headers.get("X-Secret-Key");

  // If the key is missing or incorrect, return a 403 Forbidden response
  if (secretKey !== SECRET_KEY) {
    return NextResponse.json(
      { error: "Forbidden: Invalid secret key" },
      { status: 403 }
    );
  }

  // Allow cross-origin requests from your trusted domain
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
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
