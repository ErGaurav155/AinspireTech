import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const userId = searchParams.get("userId");

    if (!accountId || !userId) {
      return NextResponse.json(
        { error: "Account ID and User ID are required" },
        { status: 400 }
      );
    }

    // Find the account to get access token and Instagram Business Account ID
    const account = await InstagramAccount.findOne({
      instagramId: accountId,
      userId: userId,
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (!account.accessToken || !account.instagramId) {
      return NextResponse.json(
        { error: "Instagram account not properly connected" },
        { status: 400 }
      );
    }

    // Fetch media from Instagram Graph API
    const accessToken = account.accessToken;
    const igUserId = account.instagramId;

    // First, get the user's media
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v23.0/${igUserId}/media?fields=id,media_type,media_url,permalink,thumbnail_url,timestamp,caption,like_count,comments_count&limit=5&access_token=${accessToken}`
    );

    if (!mediaResponse.ok) {
      const errorData = await mediaResponse.json();
      console.error("Instagram API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch media from Instagram", details: errorData },
        { status: mediaResponse.status }
      );
    }

    const mediaData = await mediaResponse.json();

    // Format the media data for our application
    const formattedMedia = mediaData.data.map((item: any) => ({
      id: item.id,
      media_type: item.media_type,
      media_url:
        item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url,
      permalink: item.permalink,
      timestamp: item.timestamp,
      caption: item.caption || "",
      likes: item.like_count,
      comments: item.comments_count,
    }));

    // Get all existing templates for this account to filter out media that already has templates
    const existingTemplates = await InstaReplyTemplate.find({
      userId: userId,
      accountId: accountId,
    }).select("mediaId"); // Only select mediaId field for efficiency

    // Extract media IDs that already have templates
    const mediaIdsWithTemplates = existingTemplates.map(
      (template) => template.mediaId
    );

    // Filter out media that already has templates
    const filteredMedia = formattedMedia.filter(
      (media: any) => !mediaIdsWithTemplates.includes(media.id)
    );

    return NextResponse.json({
      media: filteredMedia,
    });
  } catch (error) {
    console.error("Error fetching Instagram media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
