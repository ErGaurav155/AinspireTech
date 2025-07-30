import { getInstagramUser } from "@/lib/action/insta.action";

// For use in API routes
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("accessToken");
  const fields = searchParams.get("fields")?.split(",") || [
    "user_id",
    "username",
  ];

  if (!accessToken) {
    return Response.json(
      { error: "Access token is required" },
      { status: 400 }
    );
  }
  if (fields.length === 0) {
    return Response.json(
      { error: "Fields array cannot be empty" },
      { status: 400 }
    );
  }

  try {
    const user = await getInstagramUser(accessToken, fields);
    return Response.json(user);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Instagram user",
      },
      { status: 500 }
    );
  }
}
