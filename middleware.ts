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
    "/privacy-policy",
    "/TermsandCondition",
    "/api/webhooks/clerk",
    "/api/validate-widget",
    "/api/scrapping",
    "/product/:path*",
    "/product",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
