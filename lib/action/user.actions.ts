"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import User from "@/lib/database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { CreateUserParams, UpdateUserParams } from "@/types/types";
import WebSubscription from "../database/models/web/Websubcription.model";
import InstaReplyLog from "../database/models/insta/ReplyLog.model";
import InstaSubscription from "../database/models/insta/InstaSubscription.model";
import InstagramAccount from "../database/models/insta/InstagramAccount.model";
import WebsiteData from "../database/models/web/WebsiteData.model";
import WebConversation from "../database/models/web/Conversation.model";
import WebAppointment from "../database/models/web/Appointment.model";
import WebAppointmentQuestions from "../database/models/web/AppointmentQuestions.model";
import InstaReplyTemplate from "../database/models/insta/ReplyTemplate.model";
import File from "../database/models/web/scrappeddata.model";
import Razorpay from "razorpay";
import { revokeInstagramAccess } from "./insta.action";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
  revalidateTag("users");
}
export async function getUserByDbId(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ _id: userId });

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
  revalidateTag("users");
}
export async function updateNumberByDbId(buyerId: string, newNumber: string) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { _id: buyerId },
      { $set: { phone: newNumber } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }

  revalidateTag("users");
}
export async function updateUserByDbId(userId: string, newUrl: string) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { websiteUrl: newUrl } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }

  revalidateTag("users");
}
export async function setWebsiteScrapped(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { isScrapped: true } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
  revalidateTag("users");
}
export async function setScrappedFile(userId: string, fileName: string) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { scrappedFile: fileName } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }

  revalidateTag("users");
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function cleanupUserData(clerkId: string) {
  try {
    await connectToDatabase();

    // Check for active subscriptions and cancel them
    const { webSubscriptionIds, instaSubscriptionIds } =
      await hasActiveSubscriptions(clerkId);
    const subscriptionIds = [...webSubscriptionIds, ...instaSubscriptionIds];

    // Cancel all subscriptions
    await Promise.all(
      subscriptionIds.map(
        async (id) => await razorpay.subscriptions.cancel(id, false)
      )
    );

    // Get all Instagram accounts before deletion to revoke access
    const instagramAccounts = await InstagramAccount?.find({ userId: clerkId });

    // Revoke Instagram access for all accounts
    if (instagramAccounts && instagramAccounts.length > 0) {
      const revocationPromises = instagramAccounts.map(async (account) => {
        if (account.accessToken) {
          try {
            // For production: ONLY use the standard revocation endpoint
            await revokeInstagramAccess(
              account.instagramId,
              account.accessToken
            );
          } catch (error) {
            console.error(
              `Failed to revoke access for Instagram account ${account.instagramId}:`,
              error
            );
            // Continue with cleanup even if revocation fails
          }
        }
      });

      await Promise.allSettled(revocationPromises);
    }

    // Data deletion promises
    const deletionPromises = [
      // Web-related data
      WebSubscription?.deleteMany({ clerkId }),
      WebsiteData?.deleteMany({ clerkId }),
      WebConversation?.deleteMany({ clerkId }),
      WebAppointment?.deleteMany({ clerkId }),
      WebAppointmentQuestions?.deleteMany({ clerkId }),
      File?.deleteMany({ userId: clerkId }),

      // Instagram-related data
      InstaReplyTemplate?.deleteMany({ userId: clerkId }),
      InstaReplyLog?.deleteMany({ userId: clerkId }),
      InstaSubscription?.deleteMany({ clerkId }),
      InstagramAccount?.deleteMany({ userId: clerkId }),

      // User
      User?.deleteOne({ clerkId }),
    ];

    const results = await Promise.allSettled(deletionPromises);

    const failedDeletions = results.filter(
      (result) => result.status === "rejected"
    );

    if (failedDeletions.length > 0) {
      throw new Error(
        `Failed to delete ${failedDeletions.length} data collections`
      );
    }

    return { success: true, message: "All user data cleaned up successfully" };
  } catch (error) {
    console.error("Error in cleanupUserData:", error);
    throw error;
  }
}
// export async function seedSubscriptions() {
//   try {
//     await connectToDatabase();

//     // Insert dummy data
//     const created = await InstaSubscription.insertMany(dummySubscriptions);
//     console.log(`Created ${created.length} dummy subscriptions`);
//   } catch (error) {
//     console.error("Error seeding subscriptions:", error);
//   }
// }
// Add these new functions
export async function hasActiveSubscriptions(clerkId: string): Promise<{
  webSubscriptionIds: string[];
  instaSubscriptionIds: string[];
}> {
  try {
    await connectToDatabase();

    let webSubscriptions: any[] = [];
    let instaSubscriptions: any[] = [];

    // Check Web Subscriptions
    try {
      webSubscriptions = await WebSubscription.find({
        clerkId,
        status: "active",
      });
    } catch (error: any) {
      handleError(error);
    }

    // Check Instagram Subscriptions
    try {
      instaSubscriptions = await InstaSubscription.find({
        clerkId,
        status: "active",
      });
    } catch (error: any) {
      handleError(error);
    }

    return {
      webSubscriptionIds: webSubscriptions.map(
        (sub: any) => sub.subscriptionId
      ),
      instaSubscriptionIds: instaSubscriptions.map(
        (sub: any) => sub.subscriptionId
      ),
    };
  } catch (error) {
    console.error("Error checking subscriptions:", error);
    return {
      webSubscriptionIds: [],
      instaSubscriptionIds: [],
    };
  }
}
export async function updateUserLimits(
  userId: string,
  subscriptionType: string
) {
  try {
    await connectToDatabase();

    let accountLimit = 1;
    let replyLimit = 500;

    // Set limits based on subscription type
    switch (subscriptionType) {
      case "Insta-Automation-Starter":
        accountLimit = 1;
        replyLimit = 1000;
        break;
      case "Insta-Automation-Grow":
        accountLimit = 3;
        replyLimit = 3000;
        break;
      case "Insta-Automation-Professional":
        accountLimit = 5;
        replyLimit = 5000;
        break;
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        accountLimit,
        replyLimit,
      },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    handleError(error);
  }
}

export async function setPrimaryAccount(userId: string, accountId: string) {
  try {
    await connectToDatabase();

    // Update user's primary account
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { primaryAccountId: accountId },
      { new: true }
    );

    // If there are other accounts, deactivate them
    await InstagramAccount.updateMany(
      {
        userId: userId,
        _id: { $ne: accountId },
      },
      { isActive: false }
    );

    // Activate the primary account
    await InstagramAccount.findByIdAndUpdate(accountId, { isActive: true });

    return updatedUser;
  } catch (error) {
    handleError(error);
  }
}

export async function handleSubscriptionChange(
  userId: string,
  subscriptionType: string | null
) {
  try {
    await connectToDatabase();

    // If subscription is cancelled or downgraded
    if (!subscriptionType) {
      // Reset to free tier limits
      await User.findOneAndUpdate(
        { clerkId: userId },
        {
          accountLimit: 1,
          replyLimit: 500,
        }
      );

      // Get user's Instagram accounts
      const accounts = await InstagramAccount.find({ userId });

      if (accounts.length > 1) {
        // Keep only the primary account if it exists
        const user = await User.findOne({ clerkId: userId });
        const primaryAccountId = user?.primaryAccountId;

        if (primaryAccountId) {
          // Delete all accounts except primary
          await InstagramAccount.deleteMany({
            userId,
            _id: { $ne: primaryAccountId },
          });
        } else {
          // If no primary account set, keep the first account and delete others
          const firstAccount = accounts[0];
          await InstagramAccount.deleteMany({
            userId,
            _id: { $ne: firstAccount._id },
          });
          // Set this as primary account
          await setPrimaryAccount(userId, firstAccount._id);
        }
      }
    } else {
      // Update limits based on new subscription
      await updateUserLimits(userId, subscriptionType);
    }
  } catch (error) {
    handleError(error);
  }
}
