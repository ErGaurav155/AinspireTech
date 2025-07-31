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

    // Validate required fields
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
        { ok: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check for existing templates with same category
    const existingTemplates = await InstaReplyTemplate.find({
      accountId,
      category,
    });

    if (existingTemplates.length > 0) {
      // Changed condition from === 0 to > 0
      return NextResponse.json(
        {
          ok: false,
          message: `Template with ${category} category already exists`,
          error: "Duplicate category",
        },
        { status: 409 } // Using 409 Conflict for duplicate resources
      );
    }

    // Create new template
    const template = new InstaReplyTemplate({
      userId,
      accountId,
      name,
      content,
      triggers: Array.isArray(triggers)
        ? triggers
        : triggers.split(",").map((t: string) => t.trim()),
      priority: priority || 5, // Default priority if not provided
      category,
      accountUsername: accountUsername.toLowerCase(),
      isActive: true,
      usageCount: 0,
    });

    await template.save();

    return NextResponse.json(
      {
        ok: true,
        template,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
