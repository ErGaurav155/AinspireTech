import { NextResponse } from "next/server";
import ReplyTemplate from "@/lib/database/models/replyTemp.model";
import { connectToDatabase } from "@/lib/database/mongoose";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { name, content, triggers, priority, isActive } = body;

    const template = await ReplyTemplate.findByIdAndUpdate(
      params.id,
      {
        name,
        content,
        triggers: Array.isArray(triggers)
          ? triggers
          : triggers.split(",").map((t: string) => t.trim()),
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
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const template = await ReplyTemplate.findByIdAndDelete(params.id);

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
