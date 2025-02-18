"use server";

import OpenAI from "openai";
import { scrapedData } from "@/constant";
import fs from "fs";
import path from "path";

const openai = setupOpenAI();
function setupOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return new Error("OpenAI API key is not set");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
// const getFileContext = (userfileName: string) => {
//   // Construct the absolute file path using process.cwd() which returns the project root
//   const filePath = path.join(process.cwd(), "public", "assets", userfileName);

//   // Optionally, you can add a check to ensure the file exists
//   if (!fs.existsSync(filePath)) {
//     throw new Error(`File ${userfileName} not found at ${filePath}`);
//   }

//   return fs.readFileSync(filePath, "utf8");
// };

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

  // Extract the relevant website content (you may customize this)
  // const context = await getFileContext(userfileName);
  const context = fs.readFileSync(userfileName, "utf8");

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

// lib/action/ai.action.ts

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
    // ... rest of config ...
  });

  return completion.choices[0]?.message?.content || "";
};

// export const generateUrls = async (userInput: string) => {
//   if (openai instanceof Error) {
//     throw openai;
//   }

//   // Extract the relevant website content (you may customize this)

//   const completion = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages: [
//       {
//         role: "system",
//         content:
//           "You are an AI web page scrapping expert some webpage urls send to you.you have check them and urls that are not more informative to user which are gettng customer support form website chatbot like terms and condition url ,privacy-policy urls ,etc remove them and send remaining urls back in array of string urls must follow output formate ['url','url','url'] likewise only ",
//       },

//       {
//         role: "user",
//         content: userInput,
//       },
//     ],
//     max_tokens: 500,

//     temperature: 1,
//   });

//   const gptArgs = completion?.choices[0]?.message?.content;
//   if (!gptArgs) {
//     throw new Error("Bad response from OpenAI");
//   }
//   // Preprocess the response to ensure valid JSON format
//   let fixedResponse = gptArgs.trim();

//   // Fix any issues with the string format, ensuring double quotes and valid array
//   fixedResponse = fixedResponse.replace(/'/g, '"'); // Replace single quotes with double quotes
//   fixedResponse = fixedResponse.replace(/,\s*}/g, "}"); // Remove unnecessary commas before closing curly braces

//   try {
//     // Parse the fixed response as JSON
//     const parsedUrls = JSON.parse(fixedResponse);
//     return parsedUrls;
//   } catch (error) {
//     console.error("Error parsing impUrls:", error);
//     throw new Error("`impUrls` is not in a valid format.");
//   }
// };
