import { handleInstagramWebhook } from "@/lib/action/instaApi.action";
import { processQueueBatch } from "@/lib/services/queueProcessor";
import { getCurrentWindow } from "@/lib/services/hourlyRateLimiter";
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
    // This helps process any queued items immediately when we have webhook activity
    const { start: currentWindowStart } = getCurrentWindow();

    // Only process queue if we have queued items
    if (result.queued && result.queued > 0) {
      console.log(`Processing ${result.queued} queued items from webhook`);

      // Process a small batch from the queue
      // We do this asynchronously so we don't delay the webhook response
      setTimeout(async () => {
        try {
          const queueResult = await processQueueBatch(10); // Process 10 items
          console.log("Queue processing result:", queueResult);
        } catch (error) {
          console.error("Error processing queue after webhook:", error);
        }
      }, 1000); // Delay 1 second to let webhook finish
    }

    // Log rate limit info for monitoring
    console.log(
      `Webhook processed: ${result.message}, Queued: ${result.queued || 0}`
    );

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
