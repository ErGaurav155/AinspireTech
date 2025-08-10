import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { headers } from "next/headers";

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
  await connectToDatabase();

  // 1. Verify signature
  const body = await req.text();
  const signature = headers().get("x-hub-signature") || "";
  const expectedSignature =
    "sha1=" +
    crypto
      .createHmac("sha1", process.env.INSTAGRAM_VERIFY_TOKEN!)
      .update(body)
      .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  // 2. Process valid webhook
  try {
    const data = JSON.parse(body);
    const { object, entry } = data;

    if (object === "instagram" && entry?.length) {
      for (const change of entry) {
        await InstagramAccount.findOneAndUpdate(
          { instagramId: change.id },
          {
            username: change.username,
            profilePicUrl: change.profile_pic_url,
            lastUpdated: new Date(),
          },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
