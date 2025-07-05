import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import Subscription from "@/lib/database/models/Websubcription.model";

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSubscriptions = await Subscription.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      subscriptions: userSubscriptions,
    });
  } catch (error) {
    console.error("Subscriptions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
