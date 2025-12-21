// app/api/instagram/webhook/route.ts
import { handleInstagramWebhook } from "@/lib/action/instaApi.action";
import { hybridQueueProcessor } from "@/lib/services/hybridQueueProcessor";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

    // After processing webhook, check if queue needs processing
    // This is the fallback mechanism when GitHub Actions doesn't run
    const queueCheck = await hybridQueueProcessor();

    return NextResponse.json({
      ...result,
      queueProcessed: queueCheck.processed,
      queueMessage: queueCheck.reason,
      queueTimestamp: queueCheck.timestamp,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
