import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { pageAccessToken, pageId } = await req.json();
  try {
    const { data } = await axios.get(
      `https://graph.facebook.com/v19.0/${pageId}`,
      {
        params: {
          fields: "instagram_business_account",
          access_token: pageAccessToken,
        },
      }
    );
    const igAccountId = data.instagram_business_account?.id;
    return NextResponse.json({ igAccountId });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch IG account" },
      { status: 500 }
    );
  }
}
