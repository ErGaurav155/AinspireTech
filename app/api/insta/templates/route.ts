import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const accountId = searchParams.get("accountId");
    const loadMoreCount = parseInt(searchParams.get("loadMoreCount") || "0");
    const search = searchParams.get("search") || "";
    const filterAccount = searchParams.get("filterAccount") || "all";

    if (!userId) {
      return NextResponse.json(
        { error: "userId ID is required" },
        { status: 400 }
      );
    }

    // Build query based on parameters
    let query: any = { userId };

    // If accountId is provided, get templates only for that specific account
    if (accountId) {
      query.accountId = accountId;
    }
    // If accountId is NOT provided, apply account filter
    else if (filterAccount !== "all") {
      query.accountUsername = filterAccount;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "content.text": { $regex: search, $options: "i" } },
        { triggers: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value based on loadMoreCount (each click loads 10 more)
    const skip = loadMoreCount * 1;
    const limit = 1;

    // Execute query with pagination
    const templates = await InstaReplyTemplate.find(query)
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count to check if there are more templates
    const totalCount = await InstaReplyTemplate.countDocuments(query);
    const hasMore = skip + limit < totalCount;

    return NextResponse.json({
      templates,
      hasMore,
      totalCount,
    });
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
      mediaId,
      mediaUrl,
      name,
      content,
      reply,
      triggers,
      priority,
      accountUsername,
    } = body;

    // ✅ Validation
    if (
      !userId ||
      !accountId ||
      !name ||
      !content ||
      !reply ||
      !triggers ||
      !mediaId ||
      !mediaUrl ||
      !accountUsername
    ) {
      return NextResponse.json(
        { ok: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // ✅ Ensure content is array with required fields
    if (
      !Array.isArray(content) ||
      content.some(
        (item: any) =>
          !item.text ||
          typeof item.text !== "string" ||
          !item.link ||
          typeof item.link !== "string"
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Content must be an array of { text, link } objects",
        },
        { status: 400 }
      );
    }

    // ✅ Check duplicate mediaId
    const existingTemplates = await InstaReplyTemplate.find({
      accountId,
      mediaId,
    });
    if (existingTemplates.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `Template with ${mediaId} already exists`,
          error: "Duplicate Media",
        },
        { status: 409 }
      );
    }

    // ✅ Normalize triggers
    const formattedTriggers = Array.isArray(triggers)
      ? triggers.map((t: string) => t.trim().toLowerCase())
      : triggers.split(",").map((t: string) => t.trim().toLowerCase());

    // ✅ Normalize reply
    const formattedReply = Array.isArray(reply)
      ? reply.map((r: string) => r.trim())
      : [String(reply).trim()];

    // ✅ Normalize content (force trim)
    const formattedContent = content.map((item: any) => ({
      text: item.text.trim(),
      link: item.link.trim(),
    }));

    // ✅ Create new template
    const template = new InstaReplyTemplate({
      userId,
      accountId,
      name,
      content: formattedContent,
      reply: formattedReply,
      triggers: formattedTriggers,
      priority: priority || 5,
      mediaId,
      mediaUrl,
      accountUsername: accountUsername.toLowerCase(),
      isActive: true,
      usageCount: 0,
    });

    await template.save();

    return NextResponse.json({ ok: true, template }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
