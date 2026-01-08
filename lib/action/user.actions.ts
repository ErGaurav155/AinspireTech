"use server";

import User from "@/lib/database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { CreateUserParams, UpdateUserParams } from "@/types/types";
import WebSubscription from "../database/models/web/Websubcription.model";
import InstaReplyLog from "../database/models/insta/ReplyLog.model";
import InstaSubscription from "../database/models/insta/InstaSubscription.model";
import InstagramAccount from "../database/models/insta/InstagramAccount.model";
import WebConversation from "../database/models/web/Conversation.model";
import WebAppointmentQuestions from "../database/models/web/AppointmentQuestions.model";
import InstaReplyTemplate from "../database/models/insta/ReplyTemplate.model";
import Razorpay from "razorpay";
import Affiliate from "../database/models/affiliate/Affiliate";
import AffiReferral from "../database/models/affiliate/Referral";
import RateUserRateLimit from "../database/models/Rate/UserRateLimit.model";
import RateLimitQueue from "../database/models/Rate/RateLimitQueue.model";
import { TIER_LIMITS } from "@/constant";
import { getCurrentWindow } from "../services/hourlyRateLimiter";
import WebChatbot from "../database/models/web/Chatbot.model";

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
}
export async function updateNumberByUserId(userId: string, newNumber: string) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { userId: userId },
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
}
export async function updateUserByDbId(userId: string, updates: any) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updates },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}
export async function setWebsiteScrapped(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
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
}
export async function setScrappedFile(userId: string, fileName: string) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
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

    // Data deletion promises
    const deletionPromises = [
      // Web-related data
      await WebSubscription?.deleteMany({ clerkId }),
      await WebConversation?.deleteMany({ clerkId }),
      await WebAppointmentQuestions?.deleteMany({ clerkId }),
      // Instagram-related data
      await InstaReplyTemplate?.deleteMany({ userId: clerkId }),
      await InstaReplyLog?.deleteMany({ userId: clerkId }),
      await InstaSubscription?.deleteMany({ clerkId }),
      await InstagramAccount?.deleteMany({ userId: clerkId }),
      await RateLimitQueue?.deleteMany({ clerkId }),
      await RateUserRateLimit?.deleteMany({ clerkId }),

      // Affiliate Data
      await Affiliate?.deleteMany({ userId: clerkId }),
      await AffiReferral?.deleteMany({ referredUserId: clerkId }),
      await AffiReferral?.deleteMany({ affiliateUserId: clerkId }),
      // User
      await User?.deleteOne({ clerkId }),
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
// export async function updateUserLimits(
//   buyerId: string,
//   replyLimit: number,
//   accountLimit: number
// ) {
//   try {
//     await connectToDatabase();

//     const updatedUser = await User.findOneAndUpdate(
//       { _id: buyerId },
//       {
//         accountLimit: accountLimit,
//         totalReplies: 0,
//         replyLimit: replyLimit,
//       },
//       { new: true }
//     );

//     return updatedUser;
//   } catch (error) {
//     handleError(error);
//   }
// }

export async function updateUserLimits(
  userId: string,
  replyLimit: number,
  accountLimit: number
) {
  try {
    await connectToDatabase();

    // Determine tier based on replyLimit
    let tier: "free" | "starter" | "grow" | "professional" = "free";
    let hourlyRateLimit = 100; // Free tier default

    if (replyLimit >= 5000) {
      tier = "professional";
      hourlyRateLimit = TIER_LIMITS.professional;
    } else if (replyLimit >= 2000) {
      tier = "grow";
      hourlyRateLimit = TIER_LIMITS.grow;
    } else if (replyLimit >= 500) {
      tier = "starter";
      hourlyRateLimit = TIER_LIMITS.starter;
    }

    // Update User model
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        // tier,
        // hourlyRateLimit,
        // replyLimit,
        accountLimit,
        $inc: { updatedAt: 1 }, // Force update
      },
      { upsert: true, new: true }
    );

    // Update UserRateLimit for current window
    const { start: windowStart } = await getCurrentWindow();

    await RateUserRateLimit.findOneAndUpdate(
      {
        clerkId: userId,
        // , windowStart
      },
      {
        tier,
        tierLimit: hourlyRateLimit,
        // $setOnInsert: {
        //   totalCallsMade: 0,
        //   isAutomationPaused: false,
        //   accountUsage: [],
        // },
      },
      { upsert: true, new: true }
    );

    console.log(
      `Updated user ${userId} to ${tier} tier with ${hourlyRateLimit} hourly calls limit`
    );

    return { success: true, tier, hourlyRateLimit };
  } catch (error) {
    console.error("Error updating user limits:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Function to update tier for existing users
export async function updateUserTier(
  clerkId: string,
  subscriptionType: string
): Promise<{ success: boolean; tier?: string; message?: string }> {
  try {
    await connectToDatabase();

    // Map subscription type to tier
    let tier: "free" | "starter" | "grow" | "professional" = "free";
    let tierLimit = TIER_LIMITS?.free || 100;
    let replyLimit = 500; // Default daily DM limit
    let accountLimit = 1; // Default account limit

    switch (subscriptionType) {
      case "Insta-Automation-Starter":
        tier = "starter";
        tierLimit = TIER_LIMITS.starter;
        replyLimit = 500; // Daily DM limit from pricing
        accountLimit = 1;
        break;
      case "Insta-Automation-Grow":
        tier = "grow";
        tierLimit = TIER_LIMITS.grow;
        replyLimit = 2000; // Daily DM limit from pricing
        accountLimit = 3;
        break;
      case "Insta-Automation-Professional":
        tier = "professional";
        tierLimit = TIER_LIMITS.professional;
        replyLimit = 5000; // Daily DM limit from pricing
        accountLimit = 5;
        break;
      default:
        tier = "free";
        tierLimit = TIER_LIMITS.free;
        replyLimit = 500;
        accountLimit = 1;
    }

    // Update User model
    await User.findOneAndUpdate(
      { clerkId },
      {
        // tier,
        // hourlyRateLimit: tierLimit,
        // replyLimit,
        accountLimit,
        $inc: { updatedAt: 1 }, // Force update
      },
      { upsert: true, new: true }
    );

    // Update UserRateLimit for current window
    // const { start: windowStart } = await getCurrentWindow();

    await RateUserRateLimit.findOneAndUpdate(
      {
        clerkId,
        // , windowStart
      },
      {
        tier,
        tierLimit,
        // $setOnInsert: {
        //   totalCallsMade: 0,
        //   isAutomationPaused: false,
        //   accountUsage: [],
        // },
      },
      { upsert: true, new: true }
    );

    // Also update any old UserRateLimit records for this user in current window
    // await RateUserRateLimit.updateMany(
    //   { clerkId, windowStart },
    //   { tier, tierLimit }
    // );

    console.log(
      `Updated user ${clerkId} to ${tier} tier with ${tierLimit} hourly calls limit`
    );

    return {
      success: true,
      tier,
      message: `User updated to ${tier} tier successfully`,
    };
  } catch (error) {
    console.error("Error updating user tier:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error updating user tier",
    };
  }
}
// export async function setPrimaryAccount(userId: string, accountId: string) {
//   try {
//     await connectToDatabase();

//     // Update user's primary account
//     const updatedUser = await User.findOneAndUpdate(
//       { clerkId: userId },
//       { primaryAccountId: accountId },
//       { new: true }
//     );

//     // If there are other accounts, deactivate them
//     await InstagramAccount.updateMany(
//       {
//         userId: userId,
//         _id: { $ne: accountId },
//       },
//       { isActive: false }
//     );

//     // Activate the primary account
//     await InstagramAccount.findByIdAndUpdate(accountId, { isActive: true });

//     return updatedUser;
//   } catch (error) {
//     handleError(error);
//   }
// }

// export async function handleSubscriptionChange(
//   userId: string,
//   subscriptionType: string | null
// ) {
//   try {
//     await connectToDatabase();

//     // If subscription is cancelled or downgraded
//     if (!subscriptionType) {
//       // Reset to free tier limits
//       await User.findOneAndUpdate(
//         { clerkId: userId },
//         {
//           accountLimit: 1,
//           replyLimit: 500,
//         }
//       );

//       // Get user's Instagram accounts
//       const accounts = await InstagramAccount.find({ userId });

//       if (accounts.length > 1) {
//         // Keep only the primary account if it exists
//         const user = await User.findOne({ clerkId: userId });
//         const primaryAccountId = user?.primaryAccountId;

//         if (primaryAccountId) {
//           // Delete all accounts except primary
//           await InstagramAccount.deleteMany({
//             userId,
//             _id: { $ne: primaryAccountId },
//           });
//         } else {
//           // If no primary account set, keep the first account and delete others
//           const firstAccount = accounts[0];
//           await InstagramAccount.deleteMany({
//             userId,
//             _id: { $ne: firstAccount._id },
//           });
//           // Set this as primary account
//           await setPrimaryAccount(userId, firstAccount._id);
//         }
//       }
//     } else {
//       // Update limits based on new subscription
//       await updateUserLimits(userId, subscriptionType);
//     }
//   } catch (error) {
//     handleError(error);
//   }
// }
// lib/action/user.actions.ts - Batch version
export async function resetFreeCouponsForAllUsers() {
  try {
    await connectToDatabase();

    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

    let processedCount = 0;
    const batchSize = 100;
    let hasMore = true;

    while (hasMore) {
      // Process in batches
      const result = await User.updateMany(
        {
          updatedAt: { $lte: twentyEightDaysAgo },
        },
        {
          $set: {
            totalReplies: 0,
            updatedAt: new Date(),
          },
          limit: batchSize,
        }
      );

      processedCount += result.modifiedCount;

      // If we processed less than batchSize, we're done
      if (result.modifiedCount < batchSize) {
        hasMore = false;
      }

      console.log(`Processed batch: ${result.modifiedCount} users`);
    }

    console.log(`Total free coupons reset for ${processedCount} users`);
    return processedCount;
  } catch (error) {
    console.error("Error resetting free coupons:", error);
    throw error;
  }
}
export async function getAffiliateUser(userId: string) {
  try {
    await connectToDatabase();

    const user = await Affiliate.findOne({ userId: userId });

    if (!user)
      return JSON.parse(
        JSON.stringify({ success: false, message: "User Not Found" })
      );
    return JSON.parse(JSON.stringify({ success: true, user: user }));
  } catch (error) {
    handleError(error);
  }
}

interface CheckScrapeInput {
  userId: string;
  url: string;
  chatbotId: string;
}

export async function checkAndPrepareScrape({
  userId,
  url,
  chatbotId,
}: CheckScrapeInput) {
  try {
    if (!url || !chatbotId) {
      return {
        success: false,
        error: "Missing required inputs",
      };
    }

    await connectToDatabase();

    const chatbot = await WebChatbot.findOne({
      _id: chatbotId,
      clerkId: userId,
    });

    if (!chatbot) {
      return {
        success: false,
        error: "Chatbot not found or unauthorized",
      };
    }

    // ✅ Already scraped
    if (chatbot.isScrapped) {
      return {
        success: true,
        alreadyScrapped: true,
        message: "Website already scraped, skipping process",
        data: {
          fileName: chatbot.scrappedFile || "",
          domain: new URL(chatbot.websiteUrl).hostname,
          userId,
          chatbotId,
          totalPages: 0,
          maxLevel: 0,
          scrapedPages: [],
        },
      };
    }

    // 🚀 Ready to scrape
    return {
      success: true,
      alreadyScrapped: false,
      message: "Ready to start scraping",
      data: {
        domain: new URL(url).hostname,
        userId,
        chatbotId,
      },
    };
  } catch (error) {
    console.error("SERVER_ACTION_ERROR:", error);

    return {
      success: false,
      error: "Something went wrong",
    };
  }
}
