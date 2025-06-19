import { handleError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { twiml } from "twilio";
import { Twilio } from "twilio";

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const questionFlow = [
  {
    question: "Hello,How may i help you?",
    key: "issue",
  },
  {
    question: "Please provide your full address where service is needed",
    key: "address",
  },
  {
    question: "What's the best phone number to contact you?",
    key: "contactNumber",
  },
  {
    question: "Please provide your email address for service updates",
    key: "email",
  },
];

export async function POST(req: NextRequest) {
  try {
    const response = new twiml.VoiceResponse();
    const params = new URL(req.url).searchParams;
    const step = parseInt(params.get("step") || "1");
    const caller = params.get("caller") || ""; // Fix error 2: Handle null case
    const To = params.get("to") || ""; // Fix error 2: Handle null case

    // Collect previous answers
    const formData = await req.formData();
    const speechResult = formData.get("SpeechResult")?.toString().trim() || ""; // Fix error 1: Convert to string
    if (step > 1 && speechResult === "") {
      response.say("No input received. Ending call.");
      response.hangup();
      return twimlResponse(response);
    }
    const answers = Object.fromEntries(params.entries());

    // Store current answer
    const currentQuestion = questionFlow[step - 2];
    if (currentQuestion) {
      answers[currentQuestion.key] = speechResult;
    }

    if (step > questionFlow.length) {
      await finalizeServiceRequest(answers, caller, To);
      response.say(
        "Thank you for the information. We will contact you shortly."
      );
      response.hangup();
      return twimlResponse(response);
    }

    const gather = response.gather({
      input: ["speech"],
      timeout: 15,
      action: `/api/twilio/next-question?step=${step + 1}&${new URLSearchParams(
        answers as Record<string, string>
      )}&caller=${caller}&to=${To}`,
      method: "POST",
    });

    gather.say(questionFlow[step - 1].question);
    return twimlResponse(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function finalizeServiceRequest(
  answers: any,
  caller: string,
  To: string
) {
  // Send to WhatsApp
  try {
    const result = await client.messages.create({
      from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_NUMBER}` as string,
      to: `whatsapp:${To}`,
      contentSid: process.env.YOUR_CALL_CONTENT_SID_HERE, // Replace with your template's Content SID
      contentVariables: JSON.stringify({
        "1": answers.issue,
        "2": answers.address,
        "3": answers.contactNumber || "N/A",
        "4": answers.email || "No message provided",
        "5": caller || "N/A",
      }),
    });
    return { success: true, data: result };
  } catch (error) {
    handleError(error);
  }
}

function twimlResponse(response: any, status = 200) {
  return new NextResponse(response.toString(), {
    status,
    headers: { "Content-Type": "text/xml" },
  });
}
