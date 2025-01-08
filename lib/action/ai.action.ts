"use server";

import OpenAI from "openai";
import { scrapedData } from "@/constant";

const openai = setupOpenAI();
function setupOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return new Error("OpenAI API key is not set");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const generateGptResponse = async ({
  userInput,
}: {
  userInput: string;
}) => {
  if (openai instanceof Error) {
    throw openai;
  }

  // Extract the relevant website content (you may customize this)
  const context = scrapedData
    .map((page: any) => {
      return `
      Website Page URL: ${page.url}
      Title: ${page.title}
      Description: ${page.description || "No description"}
      Headings: ${page.headings.join(", ")}
      Content Summary: ${page.content.slice(0, 500)}...
    `;
    })
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that helps users by providing information based on the stored website content. Only respond based on the provided content.",
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
