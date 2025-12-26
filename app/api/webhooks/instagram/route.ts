import { handleInstagramWebhook } from "@/lib/action/instaApi.action";
import { processQueueBatch } from "@/lib/services/queueProcessor";
import {
  getCurrentWindow,
  isAppLimitReached,
} from "@/lib/services/hourlyRateLimiter";
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

    // Check if app automation is paused due to app limit
    const appLimitStatus = await isAppLimitReached();

    if (appLimitStatus.reached) {
      console.log(
        `App limit reached (${appLimitStatus.percentage.toFixed(
          1
        )}%). Webhook received but automation is paused.`
      );

      return NextResponse.json({
        success: false,
        message: `App limit reached. Automation paused until next window.`,
        appLimit: appLimitStatus.appLimit,
        globalCalls: appLimitStatus.globalCalls,
        percentage: appLimitStatus.percentage,
        queued: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("Received Instagram webhook payload");

    // Process the webhook
    const result = await handleInstagramWebhook(payload);

    // After processing webhook, check if queue needs processing
    const { start: currentWindowStart } = await getCurrentWindow();

    // Only process queue if we have queued items
    if (result.queued && result.queued > 0) {
      console.log(`Processing ${result.queued} queued items from webhook`);

      // Process a small batch from the queue asynchronously
      setTimeout(async () => {
        try {
          const queueResult = await processQueueBatch(20); // Process 20 items
          console.log("Queue processing result after webhook:", queueResult);
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
