import { defaultTemplates } from "@/constant";
import { getInstagramUser } from "@/lib/action/insta.action";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaSubscription from "@/lib/database/models/insta/InstaSubscription.model";
import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
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

    const user = await getInstagramUser(longLivedData.access_token, [
      "username",
      "id",
      "user_id",
      "profile_picture_url",
    ]);
    console.log("Instagram User:", user);

    const InstagramAcc = await InstagramAccount.find({
      userId: userId,
    });
    console.log("InstagramAcc", InstagramAcc);
    const subscriptions = await InstaSubscription.find({
      clerkId: userId,
      chatbotType: {
        $in: [
          "Insta-Automation-Starter",
          "Insta-Automation-Grow",
          "Insta-Automation-Professional",
        ],
      },
      status: "active",
    });
    console.log("subscriptions", subscriptions);
    let InstaAcc;
    if (!subscriptions || subscriptions.length === 0) {
      if (InstagramAcc && InstagramAcc.length >= 1) {
        throw new Error(
          "You have already added an Instagram account. Please upgrade your plan to add more accounts."
        );
      }
      InstaAcc = await InstagramAccount.findOneAndUpdate(
        { userId: userid },
        {
          instagramId: user.user_id,
          userInstaId: user.id,
          username: user.username,
          profilePicture: user.profile_picture_url,
          accessToken: longLivedData.access_token,
          lastTokenRefresh: Date.now(),
          isActive: true,
          expiresAt,
        },
        { upsert: true, new: true }
      );
    } else {
      // Save to MongoDB
      let noOfAccount = 0;
      switch (subscriptions[0]?.chatbotType) {
        case "Insta-Automation-Starter":
          noOfAccount = 1;

          break;
        case "Insta-Automation-Grow":
          noOfAccount = 3;

          break;
        case "Insta-Automation-Professional":
          noOfAccount = 5;
          break;
        default:
          throw new Error("No active subscription found");
      }

      if (InstagramAcc && InstagramAcc.length >= noOfAccount) {
        throw new Error(
          `You have reached the limit of ${noOfAccount} Instagram accounts. Please upgrade your plan to add more accounts.`
        );
      }
      InstaAcc = await InstagramAccount.findOneAndUpdate(
        { userId: userid },
        {
          instagramId: user.user_id,
          username: user.username,
          profilePicture: user.profile_picture_url,
          accessToken: longLivedData.access_token,
          lastTokenRefresh: Date.now(),
          isActive: true,
          expiresAt,
        },
        { upsert: true, new: true }
      );
    }

    await Promise.all(
      defaultTemplates.map(async (template) => {
        const newTemplate = new InstaReplyTemplate({
          ...template,
          userId,
          accountId: InstaAcc.instagramId,
          accountUsername: InstaAcc.username,
        });
        await newTemplate.save();
      })
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
