import InstagramAccount, {
  IInstagramAccount,
} from "@/lib/database/models/insta/InstagramAccount.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // In a real app, you'd get the user ID from authentication
    const userId = "demo-user";

    const accounts = await InstagramAccount.find({ userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body: IInstagramAccount = await request.json();

    const {
      userId,
      instagramId,
      username,
      isProfessional,
      accountType,
      accessToken,
      pageId,
      pageAccessToken,
    } = body;

    // Validate required fields
    if (!instagramId || !username || !accessToken || !userId) {
      return NextResponse.json(
        {
          error: "Missing required fields (instagramId, username, accessToken)",
        },
        { status: 400 }
      );
    }

    // Find by instagramId
    let instaAccount = await InstagramAccount.findOne({ instagramId });

    if (instaAccount) {
      // Update existing account
      instaAccount.username = username;
      instaAccount.isProfessional = isProfessional;
      instaAccount.accountType = accountType;
      instaAccount.accessToken = accessToken;
      instaAccount.pageId = pageId;
      instaAccount.pageAccessToken = pageAccessToken;
    } else {
      // Create new account
      instaAccount = new InstagramAccount({
        userId,
        instagramId,
        username,
        isProfessional,
        accountType,
        accessToken,
        pageId,
        pageAccessToken,
      });
    }

    await instaAccount.save();

    return NextResponse.json(
      { success: true, data: instaAccount },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Account creation/update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create/update account" },
      { status: 500 }
    );
  }
}
