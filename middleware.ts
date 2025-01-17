import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  ignoredRoutes: [
    "/",
    "/ChatBots",
    "/Aboutus",
    "/contactUs",
    "/OurService",
    "/Review",
    "/privacy-policy",
    "/TermsandCondition",
    "/api/webhooks/clerk",
    "/api/validate-widget",
    "/product/:path*",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
