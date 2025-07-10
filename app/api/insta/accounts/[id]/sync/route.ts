import {
  validateAccessTokenAction as validateAccessToken,
  getInstagramProfileAction as getInstagramProfile,
} from "@/lib/action/instaApi.action";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const account = await InstagramAccount.findById(params.id);

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Mock access token (in production, decrypt from database)
    const accessToken = "mock_access_token";

    // Validate access token
    const isValid = await validateAccessToken(accessToken);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Instagram access token" },
        { status: 401 }
      );
    }

    // Get updated profile data
    const profile = await getInstagramProfile("mock_token");

    // Update account with fresh data
    account.followersCount = profile.followers_count;
    account.postsCount = profile.media_count;
    account.profilePicture = profile.profile_picture_url;
    account.lastActivity = new Date();

    await account.save();

    return NextResponse.json({
      message: "Account synced successfully",
      account: account.toObject(),
    });
  } catch (error) {
    console.error("Error syncing account:", error);
    return NextResponse.json(
      { error: "Failed to sync account" },
      { status: 500 }
    );
  }
}
