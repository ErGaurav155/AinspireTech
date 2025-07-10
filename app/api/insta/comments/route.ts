import {
  getRecentMedia,
  getMediaComments,
  processComment,
} from "@/lib/action/instaApi.action";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const account = await InstagramAccount.findById(accountId);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (!account.isActive) {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 400 }
      );
    }

    // Mock access token (in production, decrypt from database)
    const accessToken = "mock_access_token";

    const recentMedia = await getRecentMedia(accessToken, 10);
    for (const media of recentMedia) {
      const comments = await getMediaComments(accessToken, media.id);
      for (const comment of comments) {
        await processComment(accessToken, accountId, comment, media.id);
      }
    }
    return NextResponse.json({
      message: "Comments processed successfully",
      accountId,
    });
  } catch (error) {
    console.error("Error processing comments:", error);
    return NextResponse.json(
      { error: "Failed to process comments" },
      { status: 500 }
    );
  }
}
