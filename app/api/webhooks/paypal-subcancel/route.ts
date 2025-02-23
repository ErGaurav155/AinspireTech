import {
  setSubsciptionActive,
  setSubsciptionCanceled,
} from "@/lib/action/subscription.action";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 }
    );
  }
}
