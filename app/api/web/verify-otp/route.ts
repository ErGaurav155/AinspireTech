import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID!;

const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const { phone, OTP } = await req.json();

    if (!phone || !OTP) {
      return NextResponse.json(
        { error: "Phone number and OTP code are required" },
        { status: 400 }
      );
    }

    const verificationResponse = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: phone, code: OTP });

    if (verificationResponse.status === "approved") {
      return NextResponse.json({
        message: "OTP verified successfully",
        ok: true,
      });
    } else {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
