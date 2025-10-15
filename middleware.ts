import { authMiddleware } from "@clerk/nextjs";
import { NextRequest } from "next/server";

export default authMiddleware({
  ignoredRoutes: [
    "/",
    "/web",
    "/insta",
    "/Aboutus",
    "/web/pricing",
    "/contactUs",
    "/Review",
    "/web/product/:path*",
    "/new/product",
    "/api/cron",
    "/api/webhooks/clerk",
    "/api/webhooks/instagram",
    "/api/webhooks/instagram/infoupdate",
    "/api/webhooks/razerpay/subscription-cancel",
    "/api/embed/chatbot",
    "api/embed/faq",
    "/api/embed/mcqchatbot",
    "/api/embed/conversation",
    "/api/embed/webQuestion",
    "/privacy-policy",
    "/TermsandCondition",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
export function isOwner(request: NextRequest): boolean {
  // Get the email from the request - you can get it from:
  // 1. Headers (if using Clerk or similar auth)
  // 2. Session
  // 3. Query parameter (for testing)

  const email =
    request.headers.get("x-user-email") ||
    request.nextUrl.searchParams.get("email") ||
    "";
  return email === "gauravgkhaire@gmail.com";
}

export function requireOwner(request: NextRequest): Response | null {
  if (!isOwner(request)) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message:
          "You are not the owner. Only gauravgkhaire@gmail.com can access this resource.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  return null;
}
