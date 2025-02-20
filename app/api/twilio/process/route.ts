import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const TWILIO_NUMBER = process.env.TWILIO_NUMBER;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_SID = process.env.TWILIO_SID!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function processCall(req: NextRequest) {
  try {
    const { RecordingUrl, From } = await req.json();
    const transcription = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      { audio_url: RecordingUrl, model: "whisper-1" },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );

    const text = transcription.data.text;
    const voiceResponse = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech",
      { text, voice: "default" },
      { headers: { Authorization: `Bearer ${ELEVENLABS_API_KEY}` } }
    );

    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      new URLSearchParams({
        To: `whatsapp:${From}`,
        From: `whatsapp:${WHATSAPP_NUMBER}`,
        Body: `Call from ${From}: ${text}`,
      }),
      { auth: { username: TWILIO_SID, password: TWILIO_AUTH_TOKEN } }
    );

    return NextResponse.json({ message: "Call processed successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
