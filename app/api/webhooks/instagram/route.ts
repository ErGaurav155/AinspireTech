// app/api/webhooks/instagram/route.ts
import { handleInstagramWebhook } from "@/lib/action/instaApi.action";
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

    const result = await handleInstagramWebhook(payload);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
