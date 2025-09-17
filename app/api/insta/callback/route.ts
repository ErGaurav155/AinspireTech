import { getInstagramUser } from "@/lib/action/insta.action";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaSubscription from "@/lib/database/models/insta/InstaSubscription.model";
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

    // Validate input parameters
    if (error) {
      return NextResponse.json(
        { error: `Authorization failed: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "No authorization code received" },
        { status: 400 }
      );
    }

    if (!userid) {
      return NextResponse.json(
        { error: "No user ID received" },
        { status: 400 }
      );
    }

    // Verify authentication
    const { userId } = auth();
    if (!userId || userId !== userid) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
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

    if (!tokenRes.ok) {
      throw new Error(`Instagram API error: ${tokenRes.statusText}`);
    }

    const tokenData = await tokenRes.json();
    if (!tokenData?.access_token) {
      throw new Error("Failed to obtain access token from Instagram");
    }

    const { access_token: shortLivedToken, user_id: instagramId } = tokenData;

    // Exchange for long-lived token
    const longLivedUrl = new URL("https://graph.instagram.com/access_token");
    longLivedUrl.searchParams.append("grant_type", "ig_exchange_token");
    longLivedUrl.searchParams.append(
      "client_secret",
      process.env.INSTAGRAM_APP_SECRET!
    );
    longLivedUrl.searchParams.append("access_token", shortLivedToken);

    const longLivedRes = await fetch(longLivedUrl.toString());
    if (!longLivedRes.ok) {
      throw new Error(`Instagram API error: ${longLivedRes.statusText}`);
    }

    const longLivedData = await longLivedRes.json();
    if (!longLivedData?.access_token) {
      throw new Error("Failed to obtain long-lived token");
    }

    // Calculate expiration date
    const expiresIn = longLivedData.expires_in || 5184000; // Default 60 days if not provided
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Get Instagram user info
    const user = await getInstagramUser(longLivedData.access_token, [
      "username",
      "id",
      "user_id",
      "profile_picture_url",
    ]);

    if (!user) {
      throw new Error("Failed to fetch Instagram user information");
    }

    // Check existing accounts and subscriptions
    const [existingAccounts, subscriptions] = await Promise.all([
      InstagramAccount.find({ userId }),
      InstaSubscription.find({
        clerkId: userId,
        chatbotType: {
          $in: [
            "Insta-Automation-Starter",
            "Insta-Automation-Grow",
            "Insta-Automation-Professional",
          ],
        },
        status: "active",
      }),
    ]);

    // Determine account limit based on subscription
    let accountLimit = 1; // Default free plan limit

    if (subscriptions.length > 0) {
      const subscription = subscriptions[0];
      switch (subscription.chatbotType) {
        case "Insta-Automation-Starter":
          accountLimit = 1;
          break;
        case "Insta-Automation-Grow":
          accountLimit = 3;
          break;
        case "Insta-Automation-Professional":
          accountLimit = 5;
          break;
      }
    }

    // Check if user has reached account limit
    if (existingAccounts.length >= accountLimit) {
      return NextResponse.json(
        {
          error: `You have reached the limit of ${accountLimit} Instagram account${
            accountLimit > 1 ? "s" : ""
          }. Please upgrade your plan to add more accounts.`,
        },
        { status: 400 }
      );
    }

    // Check if account already exists for this user
    const existingAccount = await InstagramAccount.findOne({
      userId,
      instagramId: user.user_id,
    });

    if (existingAccount) {
      // Update existing account
      existingAccount.accessToken = longLivedData.access_token;
      existingAccount.lastTokenRefresh = new Date();
      existingAccount.expiresAt = expiresAt;
      existingAccount.isActive = true;

      await existingAccount.save();

      return NextResponse.json({
        account: existingAccount,
        message: "Account updated successfully",
        status: 200,
      });
    }

    // Create new account
    const newAccount = await InstagramAccount.create({
      userId,
      instagramId: user.user_id,
      userInstaId: user.id,
      username: user.username,
      profilePicture: user.profile_picture_url,
      accessToken: longLivedData.access_token,
      lastTokenRefresh: new Date(),
      accountReply: 0,
      isActive: true,
      expiresAt,
    });

    return NextResponse.json({
      account: newAccount,
      message: "Account connected successfully",
      status: 200,
    });
  } catch (error: any) {
    console.error("Instagram callback error:", error);

    return NextResponse.json(
      {
        error:
          error.message || "Failed to process Instagram account connection",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: error.status || 500 }
    );
  }
}
