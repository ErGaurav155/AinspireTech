// app/api/instagram/webhook/route.ts
import { handleInstagramWebhook } from "@/lib/action/instaApi.action";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  // Instagram verification handshake
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
  }

  return new Response("Verification failed", { status: 403 });
}

export async function POST(req: Request) {
  const payload = await req.json();
  const result = await handleInstagramWebhook(payload);
  return Response.json(result);
}
