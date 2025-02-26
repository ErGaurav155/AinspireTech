import {
  setSubsciptionActive,
  setSubsciptionCanceled,
} from "@/lib/action/subscription.action";
import { NextResponse } from "next/server";
const crc32 = require("buffer-crc32");
import crypto from "crypto";

export const runtime = "nodejs";

async function verifySignature(rawBody: Buffer, headers: Headers) {
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const transmissionSig = headers.get("paypal-transmission-sig");
  const certUrl = headers.get("paypal-cert-url");
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (
    !transmissionId ||
    !transmissionTime ||
    !transmissionSig ||
    !certUrl ||
    !webhookId
  ) {
    return false;
  }

  // Calculate CRC32
  const crc = crc32(rawBody).readUInt32BE(0);

  // Construct verification message
  const message = `${transmissionId}|${transmissionTime}|${webhookId}|${crc}`;

  try {
    // Fetch PayPal certificate
    const certResponse = await fetch(certUrl);
    const certPem = await certResponse.text();

    // Verify signature
    const verifier = crypto.createVerify("SHA256");
    verifier.update(message);
    return verifier.verify(certPem, transmissionSig, "base64");
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // Get raw request body as Buffer
    const rawBody = Buffer.from(await request.arrayBuffer());

    // Parse JSON body for event handling
    const body = JSON.parse(rawBody.toString());

    // Verify PayPal signature
    const isSignatureValid = await verifySignature(rawBody, request.headers);
    if (!isSignatureValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Process events
    if (body.event_type === "BILLING.SUBSCRIPTION.RENEWED") {
      const subscriptionId = body.resource?.id;
      const nextBillingTime = body.resource?.billing_info?.next_billing_time;
      await setSubsciptionActive(subscriptionId, nextBillingTime);
    }

    if (body.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
      const subscriptionId = body.resource.id;
      const reason = body.resource.summary;
      await setSubsciptionCanceled(subscriptionId, reason);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 }
    );
  }
}
