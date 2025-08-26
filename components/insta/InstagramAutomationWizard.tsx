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
      <div className="max-w-md w-full p-6 backdrop-blur-md rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Instagram Business Login
        </h1>
        <Link
          href={authUrl}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Connect Instagram Account
        </Link>
      </div>
    </div>
  );
}
