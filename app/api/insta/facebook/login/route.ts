import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const FB_APP_ID = process.env.FB_APP_ID!;
const FB_APP_SECRET = process.env.FB_APP_SECRET!;

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json();

  try {
    // Exchange for long-lived
    const { data: longRes } = await axios.get(
      `https://graph.facebook.com/v19.0/oauth/access_token`,
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          fb_exchange_token: accessToken,
        },
      }
    );
    const longLivedToken = longRes.access_token;

    // Fetch user Pages
    const { data: pagesRes } = await axios.get(
      `https://graph.facebook.com/v19.0/me/accounts`,
      { params: { access_token: longLivedToken } }
    );

    return NextResponse.json({ longLivedToken, pages: pagesRes.data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 500 }
    );
  }
}
