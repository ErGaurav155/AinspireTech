import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const templates = await InstaReplyTemplate.find({ accountId }).sort({
      priority: 1,
      createdAt: -1,
    });

    return NextResponse.json(templates);
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
    const { accountId, name, content, triggers, priority = 1 } = body;

    if (!accountId || !name || !content || !triggers) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const template = new InstaReplyTemplate({
      accountId,
      name,
      content,
      triggers: Array.isArray(triggers)
        ? triggers
        : triggers.split(",").map((t: string) => t.trim()),
      priority,
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
