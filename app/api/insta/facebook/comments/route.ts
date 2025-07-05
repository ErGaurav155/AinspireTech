import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { igAccountId, pageAccessToken, mediaId, action, commentId, message } =
    await req.json();
  try {
    if (action === "fetch") {
      const { data } = await axios.get(
        `https://graph.facebook.com/v19.0/${mediaId}/comments`,
        { params: { access_token: pageAccessToken } }
      );
      return NextResponse.json({ comments: data.data });
    } else if (action === "reply") {
      const url = `https://graph.facebook.com/v19.0/${commentId}/replies`;
      const payload = new URLSearchParams({
        message,
        access_token: pageAccessToken,
      });
      const { data } = await axios.post(url, payload);
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Comments API failed" }, { status: 500 });
  }
}
