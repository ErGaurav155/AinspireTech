import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID!;

const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    const { fullPhoneNumber } = await req.json();
    if (!fullPhoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const otpResponse = await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: fullPhoneNumber, channel: "sms" });

    return NextResponse.json({
      message: "OTP sent successfully",
      sid: otpResponse.sid,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
