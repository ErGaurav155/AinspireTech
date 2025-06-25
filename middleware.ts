import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  ignoredRoutes: [
    "/",
    "/web",
    "/insta",
    "/ChatBots",
    "/Aboutus",
    "/web/pricing",
    "/contactUs",
    "/OurService",
    "/Review",
    "/web/product/:path*",
    "/new/product",
    "/api/webhooks/clerk",
    "/api/twilio/call",
    "/api/twilio/next-question",
    "/privacy-policy",
    "/TermsandCondition",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
