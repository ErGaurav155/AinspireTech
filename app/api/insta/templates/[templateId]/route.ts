import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { name, content, triggers, reply, priority, isActive } = body;

    const template = await InstaReplyTemplate.findOneAndUpdate(
      { _id: params?.templateId },
      {
        name,
        content,
        triggers,
        reply,
        priority,
        isActive,
      },
      { new: true }
    );
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    await connectToDatabase();

    const template = await InstaReplyTemplate.findOneAndDelete({
      _id: params.templateId,
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
