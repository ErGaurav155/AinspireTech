import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("accessToken");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    // Get Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );
    const pagesData = await pagesResponse.json();

    if (!pagesResponse.ok) {
      return NextResponse.json(
        { error: pagesData.error || "Failed to fetch pages" },
        { status: pagesResponse.status }
      );
    }

    const pages = pagesData.data || [];
    const pagesWithInstagram = [];

    // Check each page for Instagram connection
    for (const page of pages) {
      try {
        const instagramResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const instagramData = await instagramResponse.json();

        if (instagramData.instagram_business_account) {
          // Get Instagram account details
          const instagramAccountResponse = await fetch(
            `https://graph.facebook.com/v18.0/${instagramData.instagram_business_account.id}?fields=account_type,username,name,profile_picture_url,followers_count,media_count&access_token=${page.access_token}`
          );
          const instagramAccountData = await instagramAccountResponse.json();

          pagesWithInstagram.push({
            page: page,
            instagram: {
              id: instagramData.instagram_business_account.id,
              ...instagramAccountData,
            },
          });
        }
      } catch (error) {
        console.error(`Error checking Instagram for page ${page.id}:`, error);
      }
    }

    return NextResponse.json({
      pages: pagesWithInstagram,
      total: pagesWithInstagram.length,
    });
  } catch (error) {
    console.error("Error fetching Facebook pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
