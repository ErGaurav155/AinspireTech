import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const userid = searchParams.get("userId");

    const error = searchParams.get("error");

    if (error) {
      throw new Error(`Authorization failed: ${error}`);
    }

    if (!code) {
      throw new Error("No authorization code received");
    }
    if (!userid) {
      throw new Error("No authorization userid received");
    }
    const { userId } = auth();
    if (!userId || userId !== userid) {
      throw new Error("Unauthorized access");
    }
    // Exchange code for short-lived token

    const tokenRes = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.INSTAGRAM_APP_ID!,
          client_secret: process.env.INSTAGRAM_APP_SECRET!,
          grant_type: "authorization_code",
          redirect_uri: `https://ainspiretech.com/insta/pricing`,
          code: code,
        }),
      }
    );
    const tokenData = await tokenRes.json();
    if (!tokenData || !tokenData.access_token) {
      throw new Error("Failed to obtain access token");
    }

    const { access_token: shortLivedToken, user_id: instgramId } = tokenData;

    // Exchange for long-lived token
    const longLivedUrl = new URL("https://graph.instagram.com/access_token");
    longLivedUrl.searchParams.append("grant_type", "ig_exchange_token");
    longLivedUrl.searchParams.append(
      "client_secret",
      process.env.INSTAGRAM_APP_SECRET!
    );
    longLivedUrl.searchParams.append("access_token", shortLivedToken);

    const longLivedRes = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedRes.json();

    if (!longLivedData.access_token) {
      throw new Error("Failed to obtain long-lived token");
    }

    // Calculate expiration date
    const expiresIn = longLivedData.expires_in;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Save to MongoDB
    const InstaAcc = await InstagramAccount.findOneAndUpdate(
      { userId: userid },
      {
        instagramId: instgramId,
        accessToken: longLivedData.access_token,
        lastTokenRefresh: Date.now(),
        expiresAt,
      },
      { upsert: true, new: true }
    );
    return NextResponse.json({ account: InstaAcc, status: 200 });
  } catch (error: any) {
    console.error("Instagram callback error:", error);
    return NextResponse.json(
      { error: "Failed to save account" },
      { status: 500 }
    );
  }
}
