("use server");

import OpenAI from "openai";

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

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a professional assistant representing Morningside.AI, an advanced AI and chatbot development agency. Your role is to provide expert advice on the agency's services, including AI agent development, chatbot solutions, and website development. You will assist users by answering questions, explaining the agency's offerings, and guiding them to the best solutions for their needs. Always maintain a friendly, professional, and knowledgeable tone.",
      },
      {
        role: "user",
        content: userInput,
      },
    ],

    temperature: 1,
  });

  const gptArgs = completion?.choices[0]?.message?.content;

  if (!gptArgs) {
    throw new Error("Bad response from OpenAI");
  }

  return JSON.parse(JSON.stringify(gptArgs));
};
