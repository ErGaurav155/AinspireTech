import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const accountId = searchParams.get("accountId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId ID is required" },
        { status: 400 }
      );
    }
    if (userId && !accountId) {
      const templates = await InstaReplyTemplate.find({ userId }).sort({
        priority: 1,
        createdAt: -1,
      });

      return NextResponse.json(templates);
    }
    if (userId && accountId) {
      const templates = await InstaReplyTemplate.find({
        accountId,
        userId,
      }).sort({ priority: 1, createdAt: -1 });

      return NextResponse.json(templates);
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      userId,
      accountId,
      name,
      content,
      triggers,
      priority,
      category,
      accountUsername,
    } = body;

    if (
      !userId ||
      !accountId ||
      !name ||
      !content ||
      !triggers ||
      !category ||
      !accountUsername
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const template = new InstaReplyTemplate({
      userId,
      accountId,
      name,
      content,
      triggers: Array.isArray(triggers)
        ? triggers
        : triggers.split(",").map((t: string) => t.trim()),
      priority,
      category: category!,
      accountUsername: accountUsername.toLowerCase()!,
      isActive: true,
      usageCount: 0,
    });

    await template.save();

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
