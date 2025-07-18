import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken } = body;

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
        {
          error: pagesData.error || "Failed to fetch pages",
          hasInstagram: false,
          accounts: [],
        },
        { status: pagesResponse.status }
      );
    }

    const pages = pagesData.data || [];
    const instagramAccounts = [];

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

          instagramAccounts.push({
            id: instagramData.instagram_business_account.id,
            pageId: page.id,
            pageAccessToken: page.access_token,
            pageName: page.name,
            ...instagramAccountData,
          });
        }
      } catch (error) {
        console.error(`Error checking Instagram for page ${page.id}:`, error);
      }
    }

    return NextResponse.json({
      hasInstagram: instagramAccounts.length > 0,
      accounts: instagramAccounts,
      total: instagramAccounts.length,
    });
  } catch (error) {
    console.error("Error checking Instagram connection:", error);
    return NextResponse.json(
      {
        error: "Failed to check Instagram connection",
        hasInstagram: false,
        accounts: [],
      },
      { status: 500 }
    );
  }
}
