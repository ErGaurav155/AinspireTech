import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  ignoredRoutes: [
    "/",
    "/contactUs",
    "/privacy-policy",
    "/TermsandCondition",
    "/api/webhooks/clerk",
    "/criconai/:path*",
    "/HowToUse",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
