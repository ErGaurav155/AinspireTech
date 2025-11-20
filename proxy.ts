import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/web",
  "/insta",
  "/Aboutus",
  "/web/pricing",
  "/contactUs",
  "/Review",
  "/web/product/(.*)",
  "/new/product",
  "/api/cron",
  "/api/webhooks/clerk",
  "/api/webhooks/instagram",
  "/api/webhooks/instagram/infoupdate",
  "/api/webhooks/razerpay/subscription-cancel",
  "/api/embed/chatbot",
  "/api/embed/faq",
  "/api/embed/mcqchatbot",
  "/api/embed/conversation",
  "/api/embed/webQuestion",
  "/privacy-policy",
  "/TermsandCondition",
  "/api/scrape(.*)",
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    // Protect non-public routes
    auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|assets/|.well-known/).*)",
  ],
};

export function isOwner(request: NextRequest): boolean {
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
