import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaReplyTemplate from "@/lib/database/models/insta/ReplyTemplate.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const accounts = await InstagramAccount.find({ userId: userId });

    const accountsWithTemplateCounts = await Promise.all(
      accounts.map(async (account) => {
        const templatesCount = await InstaReplyTemplate.countDocuments({
          accountId: account.instagramId, // Use account._id as the accountId
          isActive: true,
        });

        return {
          ...account.toObject(), // Convert Mongoose document to plain object
          templatesCount,
        };
      })
    );
    return NextResponse.json({ accounts: accountsWithTemplateCounts });
  } catch (error) {
    console.error("Error fetching Instagram accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// export async function POST(request: NextRequest) {
//   try {
//     await connectToDatabase();

//     const body = await request.json();
//     const {
//       userId,
//       instagramId,
//       username,
//       isProfessional,
//       accountType,
//       accessToken,
//       displayName,
//       profilePicture,
//       followersCount,
//       postsCount,
//       pageId,
//       pageAccessToken,
//     } = body;

//     // Check if account already exists
//     const existingAccount = await InstagramAccount.findOne({
//       $or: [{ instagramId }, { username: username.toLowerCase() }],
//     });

//     if (existingAccount) {
//       // Update existing account
//       const updatedAccount = await InstagramAccount.findByIdAndUpdate(
//         existingAccount._id,
//         {
//           userId,
//           isProfessional,
//           accountType,
//           accessToken,
//           displayName,
//           profilePicture,
//           followersCount,
//           postsCount,
//           pageId,
//           pageAccessToken,
//           lastTokenRefresh: new Date(),
//           lastActivity: new Date(),
//         },
//         { new: true }
//       );

//       return NextResponse.json({ account: updatedAccount });
//     }

//     // Create new account
//     const newAccount = new InstagramAccount({
//       userId,
//       instagramId,
//       username: username.toLowerCase(),
//       isProfessional,
//       accountType,
//       accessToken,
//       displayName,
//       profilePicture,
//       followersCount,
//       postsCount,
//       pageId,
//       pageAccessToken,
//     });

//     await newAccount.save();

//     return NextResponse.json({ account: newAccount });
//   } catch (error) {
//     console.error("Error creating/updating Instagram account:", error);
//     return NextResponse.json(
//       { error: "Failed to save account" },
//       { status: 500 }
//     );
//   }
// }
