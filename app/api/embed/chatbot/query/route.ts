// import { generateGptResponse } from "@/lib/action/ai.action";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { message, userId, chatbotType, filename } = body;

//     if (!message || !userId) {
//       return NextResponse.json(
//         { error: "Message and userId are required" },
//         { status: 400 }
//       );
//     }

//     // Check if user has enough tokens (estimate 100 tokens for initial check)
//     const hasTokens = await TokenService.hasSufficientTokens(userId, 100);
//     if (!hasTokens) {
//       return NextResponse.json(
//         {
//           error:
//             "Insufficient tokens. Please purchase more tokens to continue.",
//           code: "INSUFFICIENT_TOKENS",
//         },
//         { status: 402 }
//       );
//     }

//     // Generate response
//     const result = await generateGptResponse({
//       userInput: message,
//       userfileName: filename,
//     });

//     return NextResponse.json({
//       response: result?.response,
//       tokenUsage: result?.tokenUsage,
//     });
//   } catch (error: any) {
//     console.error("Chatbot query error:", error);

//     // Handle token errors specifically
//     if (
//       error.message.includes("tokens") ||
//       error.message.includes("insufficient")
//     ) {
//       return NextResponse.json(
//         {
//           error: error.message,
//           code: "INSUFFICIENT_TOKENS",
//         },
//         { status: 402 }
//       );
//     }

//     // Handle website scraping requirement
//     if (error.message.includes("scrape your website")) {
//       return NextResponse.json(
//         {
//           error: error.message,
//           code: "WEBSITE_SCRAPING_REQUIRED",
//         },
//         { status: 403 }
//       );
//     }

//     return NextResponse.json(
//       { error: "Failed to process your request" },
//       { status: 500 }
//     );
//   }
// }
