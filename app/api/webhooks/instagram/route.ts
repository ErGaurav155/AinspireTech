// app/api/webhooks/instagram/route.ts
import {
  getAccountRateLimitStatus,
  handleInstagramWebhook,
} from "@/lib/action/instaApi.action";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Instagram verification handshake
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    }
  }

  return new NextResponse("Verification failed", { status: 403 });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("Received Instagram webhook payload:", payload);

    // Process the webhook
    const result = await handleInstagramWebhook(payload);

    // Log rate limit status
    if (payload.entry?.[0]?.id) {
      const accountId = payload.entry[0].id;

      const rateStatus = await getAccountRateLimitStatus(accountId);
      console.log(`Rate limit status for ${accountId}:`, rateStatus);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
