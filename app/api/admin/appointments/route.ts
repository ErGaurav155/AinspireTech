import { getAllAppointments } from "@/lib/action/appointment.actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // Verify owner access (same logic as your other admin routes)
    if (email !== "gauravgkhaire@gmail.com") {
      return NextResponse.json(
        {
          success: false,
          message: "ACCESS_DENIED: You are not the owner",
        },
        { status: 403 }
      );
    }

    const appointments = await getAllAppointments();
    return NextResponse.json({
      success: true,
      data: appointments,
      message: "Appointments fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch appointments",
      },
      { status: 500 }
    );
  }
}
