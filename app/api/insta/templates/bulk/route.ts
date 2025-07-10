import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { action, templateIds, accountId } = body;

    if (!action || !templateIds || !Array.isArray(templateIds)) {
      return NextResponse.json(
        { error: "Action and template IDs are required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "activate":
        result = await InstaReplyTemplate.updateMany(
          { _id: { $in: templateIds } },
          { isActive: true }
        );
        break;

      case "deactivate":
        result = await InstaReplyTemplate.updateMany(
          { _id: { $in: templateIds } },
          { isActive: false }
        );
        break;

      case "delete":
        result = await InstaReplyTemplate.deleteMany({
          _id: { $in: templateIds },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      message: `Successfully ${action}d ${result} templates`,
      affected: result,
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
