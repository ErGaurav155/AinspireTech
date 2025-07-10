import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/database/mongoose";
import Chatbot from "@/lib/database/models/web/chatbot.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase;

    const chatbot = await Chatbot.findOne({
      _id: new ObjectId(params.id),
      clerkId: userId,
    });

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    return NextResponse.json({ chatbot });
  } catch (error) {
    console.error("Chatbot fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updateData = await request.json();

    await connectToDatabase;

    const result = await Chatbot.updateOne(
      {
        _id: new ObjectId(params.id),
        clerkId: userId,
      },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Chatbot updated successfully",
    });
  } catch (error) {
    console.error("Chatbot update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase;

    const result = await Chatbot.deleteOne({
      _id: new ObjectId(params.id),
      clerkId: userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Chatbot deleted successfully",
    });
  } catch (error) {
    console.error("Chatbot delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
