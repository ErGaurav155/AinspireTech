"use server";

import OpenAI from "openai";
import { connectToDatabase } from "../database/mongoose";
import File from "@/lib/database/models/scrappeddata.model";

const openai = setupOpenAI();
function setupOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return new Error("OpenAI API key is not set");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const generateGptResponse = async ({
  userInput,
  userfileName,
}: {
  userInput: string;
  userfileName: string;
}) => {
  if (openai instanceof Error) {
    throw openai;
  }
  await connectToDatabase();
  const existingFile = await File.findOne({
    fileName: userfileName,
  });
  let context;
  if (existingFile) {
    context = existingFile.content
      .map((page: any) => {
        return `
      Website Page URL: ${page.url}
      Title: ${page.metadata?.title}
      Description: ${page.metadata?.description || "No description"}
      text: ${page.text}
    `;
      })
      .join("\n\n");
  } else {
    context = "You are an AI assistant that helps users";
  }
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that helps users by providing information based context provided. Only respond based on the provided content.repsponse must be in 2-3 lines.if you dont kow about anything asked by user then fing the email from context and add it to this line-'i dont know about this you can email'.",
      },
      { role: "user", content: context },
      {
        role: "user",
        content: userInput,
      },
    ],
    max_tokens: 500,

    temperature: 1,
  });

  const gptArgs = completion?.choices[0]?.message?.content;

  if (!gptArgs) {
    throw new Error("Bad response from OpenAI");
  }

  return JSON.parse(JSON.stringify(gptArgs));
};

export const generateMcqResponse = async ({
  userInput,
}: {
  userInput: string;
}) => {
  if (openai instanceof Error) {
    throw openai;
  }

  const userInputLower = userInput.toLowerCase();
  const isMCQRequest =
    userInputLower.includes("mcq") || userInputLower.includes("test");
  const systemMessage = isMCQRequest
    ? `Generate 10 MCQs in JSON format. Structure:
    {
      "questions": [
        {
          "question": "text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "explanation": "text",
        }
      ]
    }`
    : "You are an AI assistant...";

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userInput },
    ],
  });

  return completion.choices[0]?.message?.content || "";
};
