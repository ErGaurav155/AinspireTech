// app/api/subscriptions/insta/route.ts

import InstaSubscription from "@/lib/database/models/insta/InstaSubscription.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const subscriptions = await InstaSubscription.find({
      clerkId: userId,
      chatbotType: {
        $in: [
          "Insta-Automation-Starter",
          "Insta-Automation-Grow",
          "Insta-Automation-Professional",
        ],
      },
      status: "active",
    });

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(subscriptions, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching subscriptions:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
