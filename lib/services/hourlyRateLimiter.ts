"use server";

import { connectToDatabase } from "@/lib/database/mongoose";

import User from "@/lib/database/models/user.model";
import InstaSubscription from "../database/models/insta/InstaSubscription.model";
import RateUserRateLimit from "../database/models/Rate/UserRateLimit.model";
import RateLimitWindow from "../database/models/Rate/RateLimitWindow.model";
import RateLimitQueue, {
  IRateLimitQueue,
} from "../database/models/Rate/RateLimitQueue.model";
import { TIER_LIMITS } from "@/constant";

// Helper to get current GMT hour window
export function getCurrentWindow(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const windowStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      currentHour,
      0,
      0,
      0
    )
  );
  const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000);

  const label = `${currentHour.toString().padStart(2, "0")}:00-${(
    currentHour + 1
  )
    .toString()
    .padStart(2, "0")}:00 GMT`;

  return { start: windowStart, end: windowEnd, label };
}

// Helper to get next window
export function getNextWindow(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const nextHour = now.getUTCHours() + 1;
  const windowStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      nextHour,
      0,
      0,
      0
    )
  );
  const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000);

  const label = `${nextHour.toString().padStart(2, "0")}:00-${(nextHour + 1)
    .toString()
    .padStart(2, "0")}:00 GMT`;

  return { start: windowStart, end: windowEnd, label };
}

// Get user's tier
export async function getUserTier(
  clerkId: string
): Promise<keyof typeof TIER_LIMITS> {
  await connectToDatabase();

  // Check active subscription
  const subscription = await InstaSubscription.findOne({
    clerkId,
    status: "active",
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (subscription) {
    const chatbotType = subscription.chatbotType;
    if (chatbotType.includes("Professional")) return "professional";
    if (chatbotType.includes("Grow")) return "grow";
    if (chatbotType.includes("Starter")) return "starter";
  }

  return "free";
}

// Check if user can make a call
export async function canMakeCall(
  clerkId: string,
  instagramAccountId?: string
): Promise<{
  allowed: boolean;
  reason?: string;
  remainingCalls?: number;
  tier?: string;
  queueId?: string;
}> {
  await connectToDatabase();

  const { start: windowStart } = getCurrentWindow();
  const tier = await getUserTier(clerkId);
  const tierLimit = TIER_LIMITS[tier];

  // Get or create user rate limit record
  let userLimit = await RateUserRateLimit.findOne({
    clerkId,
    windowStart,
  });

  if (!userLimit) {
    // Create new record for this window
    userLimit = await RateUserRateLimit.create({
      clerkId,
      windowStart,
      callsMade: 0,
      tier,
      tierLimit,
      isAutomationPaused: false,
      instagramAccounts: instagramAccountId ? [instagramAccountId] : [],
    });
  }

  // Check if user has reached their tier limit
  if (userLimit.callsMade >= userLimit.tierLimit) {
    // Pause automation for this user if not already paused
    if (!userLimit.isAutomationPaused) {
      await RateUserRateLimit.updateOne(
        { _id: userLimit._id },
        { isAutomationPaused: true }
      );
    }

    return {
      allowed: false,
      reason: `User reached hourly limit (${userLimit.callsMade}/${userLimit.tierLimit})`,
      remainingCalls: 0,
      tier,
    };
  }

  // Get current window global limit
  const totalUsers = await User.countDocuments();
  const appLimit = totalUsers * 200; // Each user gets 200 calls from Meta

  let window = await RateLimitWindow.findOne({
    windowStart,
    status: "active",
  });

  if (!window) {
    window = await RateLimitWindow.create({
      windowStart,
      windowEnd: new Date(windowStart.getTime() + 60 * 60 * 1000),
      globalCalls: 0,
      appLimit,
      accountsProcessed: 0,
      status: "active",
    });
  }

  // Check if we've reached app limit
  if (window.globalCalls >= window.appLimit) {
    return {
      allowed: false,
      reason: `App reached global limit (${window.globalCalls}/${window.appLimit})`,
      remainingCalls: Math.max(0, userLimit.tierLimit - userLimit.callsMade),
      tier,
    };
  }

  return {
    allowed: true,
    remainingCalls: Math.max(0, userLimit.tierLimit - userLimit.callsMade),
    tier,
  };
}

// Record a successful call
export async function recordCall(
  clerkId: string,
  instagramAccountId: string,
  actionType: IRateLimitQueue["actionType"],
  metadata?: any
): Promise<{ success: boolean; queued?: boolean; queueId?: string }> {
  await connectToDatabase();

  const { start: windowStart } = getCurrentWindow();

  // Check if call is allowed
  const canCall = await canMakeCall(clerkId, instagramAccountId);

  if (!canCall.allowed) {
    // Queue the call
    const queueItem = await RateLimitQueue.create({
      clerkId,
      instagramAccountId,
      actionType,
      actionPayload: metadata || {},
      priority: 5,
      status: "pending",
      windowStart,
      metadata: metadata?.metadata,
    });

    return {
      success: false,
      queued: true,
      queueId: queueItem._id.toString(),
    };
  }

  // Record the call in user limit
  await RateUserRateLimit.findOneAndUpdate(
    { clerkId, windowStart },
    {
      $inc: { callsMade: 1 },
      $addToSet: { instagramAccounts: instagramAccountId },
    },
    { upsert: true, new: true }
  );

  // Record the call in global window
  await RateLimitWindow.findOneAndUpdate(
    { windowStart, status: "active" },
    {
      $inc: { globalCalls: 1, accountsProcessed: 1 },
    },
    { upsert: true, new: true }
  );

  return { success: true };
}

// Queue a call for later processing
export async function queueCall(
  clerkId: string,
  instagramAccountId: string,
  actionType: IRateLimitQueue["actionType"],
  actionPayload: any,
  priority: number = 5
): Promise<string> {
  await connectToDatabase();

  const { start: windowStart } = getCurrentWindow();

  const queueItem = await RateLimitQueue.create({
    clerkId,
    instagramAccountId,
    actionType,
    actionPayload,
    priority,
    status: "pending",
    windowStart,
    retryCount: 0,
    maxRetries: 3,
  });

  return queueItem._id.toString();
}

// Reset window and process queue (to be called by cron)
export async function resetWindowAndProcessQueue(): Promise<{
  success: boolean;
  processed: number;
  remaining: number;
}> {
  await connectToDatabase();

  const currentWindow = getCurrentWindow();
  const previousWindowStart = new Date(
    currentWindow.start.getTime() - 60 * 60 * 1000
  );

  // Mark previous window as completed
  await RateLimitWindow.updateOne(
    { windowStart: previousWindowStart },
    { status: "completed" }
  );

  // Reset user rate limits for new window
  // Note: We don't delete old records, we'll create new ones as needed

  // Process queue from previous window
  const queueItems = await RateLimitQueue.find({
    windowStart: previousWindowStart,
    status: "pending",
  })
    .sort({ priority: 1, createdAt: 1 })
    .limit(100); // Process 100 at a time

  let processed = 0;

  for (const item of queueItems) {
    try {
      // Check if user can make the call in new window
      const canCall = await canMakeCall(item.clerkId, item.instagramAccountId);

      if (canCall.allowed) {
        // Update queue item status
        await RateLimitQueue.updateOne(
          { _id: item._id },
          {
            status: "processing",
            processingStartedAt: new Date(),
            windowStart: currentWindow.start, // Move to current window
          }
        );

        // Here you would actually process the queued action
        // For now, we'll just mark it as completed
        await RateLimitQueue.updateOne(
          { _id: item._id },
          {
            status: "completed",
            processingCompletedAt: new Date(),
          }
        );

        // Record the call
        await recordCall(
          item.clerkId,
          item.instagramAccountId,
          item.actionType,
          item.actionPayload
        );

        processed++;
      } else {
        // Keep in queue for next window
        await RateLimitQueue.updateOne(
          { _id: item._id },
          {
            windowStart: currentWindow.start,
          }
        );
      }
    } catch (error) {
      console.error("Error processing queue item:", error);
      await RateLimitQueue.updateOne(
        { _id: item._id },
        {
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        }
      );
    }
  }

  // Resume automation for users who were paused
  await RateUserRateLimit.updateMany(
    {
      windowStart: { $lt: currentWindow.start },
      isAutomationPaused: true,
    },
    { isAutomationPaused: false }
  );

  // Get remaining queue items
  const remaining = await RateLimitQueue.countDocuments({
    status: "pending",
    windowStart: { $lt: currentWindow.start },
  });

  return {
    success: true,
    processed,
    remaining,
  };
}

// Get statistics for dashboard
export async function getWindowStats(windowStart?: Date) {
  await connectToDatabase();

  const { start: currentWindowStart, label: currentLabel } = getCurrentWindow();
  const targetWindowStart = windowStart || currentWindowStart;

  // Get window data
  const window = await RateLimitWindow.findOne({
    windowStart: targetWindowStart,
  });

  if (!window) {
    // Create window if it doesn't exist
    const totalUsers = await User.countDocuments();
    const appLimit = totalUsers * 200;

    return {
      window: currentLabel,
      isCurrentWindow: true,
      global: {
        totalCalls: 0,
        appLimit,
        accountsProcessed: 0,
      },
      queue: {
        queuedItems: 0,
        byType: [],
      },
      users: {
        totalUsers,
        totalCalls: 0,
        averageCallsPerUser: 0,
      },
    };
  }

  // Get user statistics
  const userLimits = await RateUserRateLimit.find({
    windowStart: targetWindowStart,
  });

  const totalUserCalls = userLimits.reduce((sum, ul) => sum + ul.callsMade, 0);
  const activeUsers = userLimits.length;

  // Get queue statistics
  const queueStats = await RateLimitQueue.aggregate([
    {
      $match: {
        windowStart: targetWindowStart,
        status: { $in: ["pending", "processing"] },
      },
    },
    {
      $group: {
        _id: "$actionType",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalQueued = await RateLimitQueue.countDocuments({
    windowStart: targetWindowStart,
    status: { $in: ["pending", "processing"] },
  });

  return {
    window: currentLabel,
    isCurrentWindow:
      targetWindowStart.getTime() === currentWindowStart.getTime(),
    global: {
      totalCalls: window.globalCalls,
      appLimit: window.appLimit,
      accountsProcessed: window.accountsProcessed,
    },
    queue: {
      queuedItems: totalQueued,
      byType: queueStats,
      processing: await RateLimitQueue.countDocuments({
        windowStart: targetWindowStart,
        status: "processing",
      }),
      pending: await RateLimitQueue.countDocuments({
        windowStart: targetWindowStart,
        status: "pending",
      }),
      failed: await RateLimitQueue.countDocuments({
        windowStart: targetWindowStart,
        status: "failed",
      }),
    },
    users: {
      totalUsers: activeUsers,
      totalCalls: totalUserCalls,
      averageCallsPerUser: activeUsers > 0 ? totalUserCalls / activeUsers : 0,
    },
  };
}

// Get user-specific stats
export async function getUserRateLimitStats(clerkId: string) {
  await connectToDatabase();

  const { start: windowStart } = getCurrentWindow();
  const tier = await getUserTier(clerkId);
  const tierLimit = TIER_LIMITS[tier];

  const userLimit = await RateUserRateLimit.findOne({
    clerkId,
    windowStart,
  });

  const callsMade = userLimit?.callsMade || 0;
  const isPaused = userLimit?.isAutomationPaused || false;

  // Get queued items for this user
  const queuedItems = await RateLimitQueue.countDocuments({
    clerkId,
    windowStart,
    status: { $in: ["pending", "processing"] },
  });

  return {
    tier,
    tierLimit,
    callsMade,
    remainingCalls: Math.max(0, tierLimit - callsMade),
    usagePercentage: tierLimit > 0 ? (callsMade / tierLimit) * 100 : 0,
    isAutomationPaused: isPaused,
    queuedItems,
  };
}
