import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  ignoredRoutes: [
    "/",
    "/ChatBots",
    "/Aboutus",
    "/pricing",
    "/contactUs",
    "/OurService",
    "/Review",
    "/product/:path*",
    "/product",
    "/api/webhooks/clerk",
    "/api/webhooks/paypal-subcancel",
    "/api/webhooks/razerpay/subscription-cancel",
    "/api/validate-widget",
    "/api/twilio/call",
    "/api/twilio/next-question",
    "/privacy-policy",
    "/TermsandCondition",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
