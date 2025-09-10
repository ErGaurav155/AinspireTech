"use client";

import Link from "next/link";

export default function LoginPage() {
  const instaId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;

  if (!instaId) {
    console.error("Instagram App ID is not defined");
    return <div>Error: Missing configuration</div>;
  }

  const authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${instaId}&redirect_uri=${encodeURIComponent(
    "https://ainspiretech.com/insta/pricing"
  )}&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights`;

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full p-0 md:p-6 backdrop-blur-md rounded-lg shadow-md">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-center">
          Instagram Business Login
        </h1>
        <Link
          href={authUrl}
          className="w-full flex items-center justify-center p-2 md:px-4 md:py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#B026FF] hover:to-[#00F0FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Connect Instagram Account
        </Link>
      </div>
    </div>
  );
}
