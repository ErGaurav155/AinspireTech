"use server";

import OpenAI from "openai";
import { connectToDatabase } from "../database/mongoose";
import File from "@/lib/database/models/web/scrappeddata.model";

const openai = setupOpenAI();
function setupOpenAI() {
  if (!process.env.DEEPSEEK_API_KEY) {
    return new Error("OpenAI API key is not set");
  }
  return new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
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
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that helps users by providing information based context provided.Only respond based on the provided content.repsponse must be in 2-3 lines.if you dont kow about anything asked by user then fing the email from context and add it to this line-'i dont know about this you can email'.",
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
  isMCQRequest,
}: {
  userInput: string;
  isMCQRequest: boolean;
}) => {
  if (openai instanceof Error) {
    throw openai;
  }

  const systemMessage = isMCQRequest
    ? `Generate 10 MCQs in JSON format.Must follow below structure also dont provide any heading and json word text:
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
    : "You are an AI assistant.Your work is to give satified answer of there question in plain text format";

  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userInput },
    ],
  });

  return completion.choices[0]?.message?.content || "";
};
export const generateCommentResponse = async ({
  userInput,
  templates,
}: {
  userInput: string;
  templates: string[];
}) => {
  if (openai instanceof Error) {
    throw openai;
  }

  const systemMessage = `Choose one template name from this array ${JSON.stringify(
    templates
  )} that mostly matches this user comment: "${userInput}". 
  Must respond with exactly this JSON structure (no other text):
  {
    "matchedtemplate": "template_name_here"
  }`;

  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userInput },
    ],
    response_format: { type: "json_object" },
  });

  return completion.choices[0]?.message?.content || "";
};
