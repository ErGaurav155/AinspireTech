import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagramAccountId, accountType, accessToken } = body;

    if (!instagramAccountId || !accountType || !accessToken) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Make Graph API request to convert account type
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_type: accountType,
          access_token: accessToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to convert account type" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error converting account type:", error);
    return NextResponse.json(
      { error: "Failed to convert account type" },
      { status: 500 }
    );
  }
}
