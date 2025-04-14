import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const IPSTACK_ACCESS_KEY = process.env.IPSTACK_ACCESS_KEY;

if (!IPSTACK_ACCESS_KEY) {
  throw new Error(
    "IPSTACK_ACCESS_KEY is not defined in environment variables."
  );
}

export async function GET(request: NextRequest) {
  try {
    await request.body;
    const userIp =
      request.headers.get("x-forwarded-for") || request.ip || "check";

    const response = await axios.get(
      `http://api.ipstack.com/${userIp}?access_key=${IPSTACK_ACCESS_KEY}`
    );

    const data = response.data;
    if (data) {
      return NextResponse.json(
        {
          success: true,
          location: {
            country: data.country_name,
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Unable to fetch location data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
