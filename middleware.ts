import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  ignoredRoutes: [
    "/",
    "/web",
    "/insta",
    "/Aboutus",
    "/web/pricing",
    "/contactUs",
    "/OurService",
    "/Review",
    "/web/product/:path*",
    "/new/product",
    "/api/webhooks/clerk",
    "/api/webhooks/instagram",
    "/api/webhooks/instagram/infoupdate",
    "/api/webhooks/razerpay/subscription-cancel",
    "/api/embed/chatbot",
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
