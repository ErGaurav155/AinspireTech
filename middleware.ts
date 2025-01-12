import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  ignoredRoutes: [
    "/",
    "/Aboutus",
    "/contactUs",
    "/OurService",
    "/Review",
    "/privacy-policy",
    "/TermsandCondition",
    "/api/webhooks/clerk",
    "/product/:path*",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
