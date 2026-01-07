"use server";

import { connectToDatabase } from "@/lib/database/mongoose";

import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import { META_API_LIMIT_PER_ACCOUNT, TIER_LIMITS, TierType } from "@/constant";
import InstaSubscription from "../database/models/insta/InstaSubscription.model";
import RateLimitWindow from "../database/models/Rate/RateLimitWindow.model";
import RateUserRateLimit, {
  IAccountUsage,
} from "../database/models/Rate/UserRateLimit.model";
import RateLimitQueue, {
  IRateLimitQueue,
} from "../database/models/Rate/RateLimitQueue.model";

// Helper to get current GMT hour window
export async function getCurrentWindow(): Promise<{
  start: Date;
  end: Date;
  label: string;
}> {
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
export async function getNextWindow(): Promise<{
  start: Date;
  end: Date;
  label: string;
}> {
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
export async function getUserTier(clerkId: string): Promise<TierType> {
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

// Check app limit status
export async function isAppLimitReached(): Promise<{
  reached: boolean;
  globalCalls: number;
  appLimit: number;
  percentage: number;
}> {
  await connectToDatabase();

  const { start: windowStart } = await getCurrentWindow();
  const window = await RateLimitWindow.findOne({
    windowStart,
    status: "active",
  });

  if (!window) {
    return { reached: false, globalCalls: 0, appLimit: 0, percentage: 0 };
  }

  const percentage = (window.globalCalls / window.appLimit) * 100;
  const reached = window.globalCalls >= window.appLimit;

  return {
    reached,
    globalCalls: window.globalCalls,
    appLimit: window.appLimit,
    percentage,
  };
}

// Pause app automation globally
export async function pauseAppAutomation(): Promise<void> {
  await connectToDatabase();

  const { start: windowStart } = await getCurrentWindow();

  await RateLimitWindow.updateOne(
    { windowStart, status: "active" },
    { isAutomationPaused: true }
  );

  // Also pause all active Instagram accounts
  await InstagramAccount.updateMany({ isActive: true }, { isActive: false });

  console.log(`App automation paused globally due to app limit reached`);
}

// Resume app automation
export async function resumeAppAutomation(): Promise<void> {
  await connectToDatabase();

  const { start: windowStart } = await getCurrentWindow();

  await RateLimitWindow.updateOne(
    { windowStart, status: "active" },
    { isAutomationPaused: false }
  );

  // Resume Instagram accounts that were paused by system
  await InstagramAccount.updateMany({ isActive: false }, { isActive: true });

  console.log(`App automation resumed`);
}

// Check if user can make a call
export async function canMakeCall(
  clerkId: string,
  instagramAccountId?: string
): Promise<{
  allowed: boolean;
  reason?:
    | "user_limit_reached"
    | "app_limit_reached"
    | "automation_paused"
    | "account_inactive";
  remainingCalls?: number;
  tier?: TierType;
  queueId?: string;
}> {
  await connectToDatabase();

  const { start: windowStart } = await getCurrentWindow();
  const tier = await getUserTier(clerkId);
  const tierLimit = TIER_LIMITS[tier];

  // First check if app automation is paused
  const window = await RateLimitWindow.findOne({
    windowStart,
    status: "active",
  });
  if (window?.isAutomationPaused) {
    return {
      allowed: false,
      reason: "automation_paused",
      tier,
    };
  }

  // Check if app limit is reached
  const appLimitStatus = await isAppLimitReached();
  if (appLimitStatus.reached) {
    // Pause app automation if not already paused
    if (!window?.isAutomationPaused) {
      await pauseAppAutomation();
    }

    return {
      allowed: false,
      reason: "app_limit_reached",
      tier,
    };
  }

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
      totalCallsMade: 0,
      tier,
      tierLimit,
      isAutomationPaused: false,
      accountUsage: [],
    });
  }

  // Check if user has reached their tier limit
  if (userLimit.totalCallsMade >= userLimit.tierLimit) {
    // Pause automation for this user if not already paused
    if (!userLimit.isAutomationPaused) {
      await RateUserRateLimit.updateOne(
        { _id: userLimit._id },
        { isAutomationPaused: true }
      );

      // Pause user's Instagram accounts
      if (instagramAccountId) {
        await InstagramAccount.updateOne(
          { instagramId: instagramAccountId },
          { isActive: false }
        );
      } else {
        // Pause all user's Instagram accounts
        await InstagramAccount.updateMany(
          { userId: clerkId },
          { isActive: false }
        );
      }
    }

    return {
      allowed: false,
      reason: "user_limit_reached",
      remainingCalls: 0,
      tier,
    };
  }

  // Check if specific Instagram account is active
  if (instagramAccountId) {
    const account = await InstagramAccount.findOne({
      instagramId: instagramAccountId,
    });
    if (!account?.isActive) {
      return {
        allowed: false,
        reason: "account_inactive",
        remainingCalls: Math.max(
          0,
          userLimit.tierLimit - userLimit.totalCallsMade
        ),
        tier,
      };
    }
  }

  return {
    allowed: true,
    remainingCalls: Math.max(0, userLimit.tierLimit - userLimit.totalCallsMade),
    tier,
  };
}

// Record a successful call with account tracking
export async function recordCall(
  clerkId: string,
  instagramAccountId: string,
  actionType: IRateLimitQueue["actionType"],
  metadata?: any,
  incrementBy?: number
): Promise<{
  success: boolean;
  queued?: boolean;
  queueId?: string;
  reason?: string;
}> {
  await connectToDatabase();

  const { start: windowStart } = await getCurrentWindow();

  // Check if call is allowed
  const canCall = await canMakeCall(clerkId, instagramAccountId);

  if (!canCall.allowed) {
    // Queue the call with reason
    const queueItem = await RateLimitQueue.create({
      clerkId,
      instagramAccountId,
      actionType,
      actionPayload: metadata || {},
    });

    return {
      success: false,
      queued: true,
      queueId: queueItem._id.toString(),
      reason: canCall.reason,
    };
  }

  // Get Instagram account info for tracking
  let accountInfo: { username?: string; profilePicture?: string } = {};
  try {
    const instaAccount = await InstagramAccount.findOne({
      instagramId: instagramAccountId,
    });
    if (instaAccount) {
      accountInfo = {
        username: instaAccount.username,
        profilePicture: instaAccount.profilePicture,
      };
    }
  } catch (error) {
    console.error("Error fetching Instagram account info:", error);
  }

  // Calculate app limit based on ACTIVE Instagram accounts
  const totalInstagramAccounts = await InstagramAccount.countDocuments({
    isActive: true,
  });
  const appLimit = totalInstagramAccounts * META_API_LIMIT_PER_ACCOUNT;

  // Get or create window record
  let window = await RateLimitWindow.findOne({ windowStart, status: "active" });
  if (!window) {
    window = await RateLimitWindow.create({
      windowStart,
      windowEnd: new Date(windowStart.getTime() + 60 * 60 * 1000),
      globalCalls: 0,
      appLimit,
      accountsProcessed: 0,
      isAutomationPaused: false,
      status: "active",
    });
  } else {
    // Update app limit in case number of accounts changed
    if (window.appLimit !== appLimit) {
      window.appLimit = appLimit;
      await window.save();
    }
  }

  // Check app limit again right before recording
  if (window.globalCalls >= window.appLimit) {
    // Pause app automation
    await pauseAppAutomation();

    // Queue the call
    const queueItem = await RateLimitQueue.create({
      clerkId,
      instagramAccountId,
      actionType,
      actionPayload: metadata || {},
      priority: 5,
      status: "pending",
      windowStart,
      metadata: {
        ...metadata?.metadata,
        reason: "app_limit_reached",
      },
    });

    return {
      success: false,
      queued: true,
      queueId: queueItem._id.toString(),
      reason: "app_limit_reached",
    };
  }

  // Record the call in user rate limit with account-level tracking
  const userLimit = await RateUserRateLimit.findOneAndUpdate(
    { clerkId, windowStart },
    {
      $inc: { totalCallsMade: incrementBy },
      $setOnInsert: {
        tier: await getUserTier(clerkId),
        tierLimit: TIER_LIMITS[await getUserTier(clerkId)],
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  // Update or add account usage
  if (userLimit) {
    const accountIndex = userLimit.accountUsage.findIndex(
      (acc: IAccountUsage) => acc.instagramAccountId === instagramAccountId
    );

    if (accountIndex >= 0) {
      // Update existing account usage
      userLimit.accountUsage[accountIndex].callsMade += incrementBy;
      userLimit.accountUsage[accountIndex].lastCallAt = new Date();
    } else {
      // Add new account usage
      userLimit.accountUsage.push({
        instagramAccountId,
        callsMade: incrementBy,
        lastCallAt: new Date(),
        accountUsername: accountInfo.username,
        accountProfile: accountInfo.profilePicture,
      });
    }

    await userLimit.save();
  }

  // Record the call in global window
  await RateLimitWindow.findOneAndUpdate(
    { windowStart, status: "active" },
    {
      $inc: { globalCalls: 1, accountsProcessed: 1 },
    }
  );

  // Check if app limit reached after this call
  const updatedWindow = await RateLimitWindow.findOne({
    windowStart,
    status: "active",
  });
  if (updatedWindow && updatedWindow.globalCalls >= updatedWindow.appLimit) {
    await pauseAppAutomation();
  }

  return { success: true };
}

// Queue a call for later processing
export async function queueCall(
  clerkId: string,
  instagramAccountId: string,
  actionType: IRateLimitQueue["actionType"],
  actionPayload: any,
  priority: number = 5,
  reason?: string
): Promise<string> {
  await connectToDatabase();

  const { start: windowStart } = await getCurrentWindow();

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
    metadata: {
      ...actionPayload.metadata,
      reason: reason || "rate_limit",
    },
  });

  return queueItem._id.toString();
}

// Reset window and process queue (to be called by cron)
export async function resetWindowAndProcessQueue(): Promise<{
  success: boolean;
  processed: number;
  remaining: number;
  resumedAccounts: number;
  appLimit: number;
}> {
  await connectToDatabase();

  const currentWindow = await getCurrentWindow();
  const previousWindowStart = new Date(
    currentWindow.start.getTime() - 60 * 60 * 1000
  );

  // Mark previous window as completed
  await RateLimitWindow.updateOne(
    { windowStart: previousWindowStart },
    { status: "completed" }
  );

  // Calculate new app limit based on current active Instagram accounts
  const totalInstagramAccounts = await InstagramAccount.countDocuments({
    isActive: true,
  });
  const appLimit = totalInstagramAccounts * META_API_LIMIT_PER_ACCOUNT;

  // Create new window
  await RateLimitWindow.create({
    windowStart: currentWindow.start,
    windowEnd: currentWindow.end,
    globalCalls: 0,
    appLimit,
    accountsProcessed: 0,
    isAutomationPaused: false,
    status: "active",
  });

  // Resume ALL Instagram accounts (both user-paused and system-paused)
  const resumeResult = await InstagramAccount.updateMany(
    {},
    { isActive: true }
  );

  const resumedAccounts = resumeResult.modifiedCount;

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

        // Process the queued action
        let processSuccess = false;

        try {
          // You would implement actual processing logic here
          // For now, we'll just simulate success
          processSuccess = true;

          // Record the call in new window
          await recordCall(
            item.clerkId,
            item.instagramAccountId,
            item.actionType,
            item.actionPayload,
            1
          );
        } catch (processError) {
          console.error(
            `Error processing queue item ${item._id}:`,
            processError
          );
          processSuccess = false;
        }

        if (processSuccess) {
          await RateLimitQueue.updateOne(
            { _id: item._id },
            {
              status: "completed",
              processingCompletedAt: new Date(),
            }
          );

          processed++;
        } else {
          // Increment retry count
          await RateLimitQueue.updateOne(
            { _id: item._id },
            {
              retryCount: item.retryCount + 1,
              status:
                item.retryCount + 1 >= item.maxRetries ? "failed" : "pending",
              errorMessage: "Processing failed",
            }
          );
        }
      } else {
        // Keep in queue for current window
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

  console.log(
    `Window reset: ${currentWindow.label}, Processed: ${processed}, Remaining: ${remaining}, Resumed: ${resumedAccounts} accounts`
  );

  return {
    success: true,
    processed,
    remaining,
    resumedAccounts,
    appLimit,
  };
}

// Get statistics for dashboard
export async function getWindowStats(windowStart?: Date) {
  await connectToDatabase();

  const { start: currentWindowStart, label: currentLabel } =
    await getCurrentWindow();
  const targetWindowStart = windowStart || currentWindowStart;

  // Get window data
  const window = await RateLimitWindow.findOne({
    windowStart: targetWindowStart,
  });

  // Get total active Instagram accounts for app limit calculation
  const totalInstagramAccounts = await InstagramAccount.countDocuments({
    isActive: true,
  });
  const appLimit = totalInstagramAccounts * META_API_LIMIT_PER_ACCOUNT;

  if (!window) {
    return {
      window: currentLabel,
      isCurrentWindow: true,
      global: {
        totalCalls: 0,
        appLimit,
        accountsProcessed: 0,
        isAutomationPaused: false,
      },
      queue: {
        queuedItems: 0,
        byType: [],
        byReason: [],
      },
      users: {
        totalUsers: 0,
        totalCalls: 0,
        averageCallsPerUser: 0,
      },
      accounts: {
        totalActive: totalInstagramAccounts,
        appLimitPerAccount: META_API_LIMIT_PER_ACCOUNT,
      },
    };
  }

  // Get user statistics
  const userLimits = await RateUserRateLimit.find({
    windowStart: targetWindowStart,
  });

  const totalUserCalls = userLimits.reduce(
    (sum, ul) => sum + ul.totalCallsMade,
    0
  );
  const activeUsers = userLimits.length;

  // Get queue statistics by type
  const queueStatsByType = await RateLimitQueue.aggregate([
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

  // Get queue statistics by reason
  const queueStatsByReason = await RateLimitQueue.aggregate([
    {
      $match: {
        windowStart: targetWindowStart,
        status: { $in: ["pending", "processing"] },
        "metadata.reason": { $exists: true },
      },
    },
    {
      $group: {
        _id: "$metadata.reason",
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
      isAutomationPaused: window.isAutomationPaused,
      usagePercentage:
        window.appLimit > 0 ? (window.globalCalls / window.appLimit) * 100 : 0,
    },
    queue: {
      queuedItems: totalQueued,
      byType: queueStatsByType,
      byReason: queueStatsByReason,
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
    accounts: {
      totalActive: totalInstagramAccounts,
      appLimitPerAccount: META_API_LIMIT_PER_ACCOUNT,
    },
  };
}

// Get user-specific stats
export async function getUserRateLimitStats(clerkId: string) {
  await connectToDatabase();

  const { start: windowStart } = await getCurrentWindow();
  const tier = await getUserTier(clerkId);
  const tierLimit = TIER_LIMITS[tier];

  const userLimit = await RateUserRateLimit.findOne({
    clerkId,
    windowStart,
  });

  const callsMade = userLimit?.totalCallsMade || 0;
  const isPaused = userLimit?.isAutomationPaused || false;
  const accountUsage = userLimit?.accountUsage || [];

  // Sort account usage by calls made (descending)
  const sortedAccountUsage = [...accountUsage].sort(
    (a, b) => b.callsMade - a.callsMade
  );

  // Get queued items for this user
  const queuedItems = await RateLimitQueue.countDocuments({
    clerkId,
    windowStart,
    status: { $in: ["pending", "processing"] },
  });

  // Get queued items by reason
  const queuedByReason = await RateLimitQueue.aggregate([
    {
      $match: {
        clerkId,
        windowStart,
        status: { $in: ["pending", "processing"] },
        "metadata.reason": { $exists: true },
      },
    },
    {
      $group: {
        _id: "$metadata.reason",
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    tier,
    tierLimit,
    callsMade,
    remainingCalls: Math.max(0, tierLimit - callsMade),
    usagePercentage: tierLimit > 0 ? (callsMade / tierLimit) * 100 : 0,
    isAutomationPaused: isPaused,
    queuedItems,
    queuedByReason,
    accountUsage: sortedAccountUsage.map((acc) => ({
      instagramAccountId: acc.instagramAccountId,
      username: acc.accountUsername,
      profile: acc.accountProfile,
      callsMade: acc.callsMade,
      percentage: tierLimit > 0 ? (acc.callsMade / tierLimit) * 100 : 0,
      lastCallAt: acc.lastCallAt,
    })),
  };
}

// Get all accounts usage for admin dashboard
export async function getAllAccountsUsage(windowStart?: Date): Promise<{
  windowStart: Date;
  totalAccounts: number;
  totalCalls: number;
  accounts: Array<{
    instagramAccountId: string;
    username?: string;
    callsMade: number;
    clerkId: string;
    tier: TierType;
    lastCallAt: Date;
  }>;
}> {
  await connectToDatabase();

  const { start: currentWindowStart } = await getCurrentWindow();
  const targetWindowStart = windowStart || currentWindowStart;

  const userLimits = await RateUserRateLimit.find({
    windowStart: targetWindowStart,
  });

  let totalCalls = 0;
  const allAccounts: Array<{
    instagramAccountId: string;
    username?: string;
    callsMade: number;
    clerkId: string;
    tier: TierType;
    lastCallAt: Date;
  }> = [];

  for (const userLimit of userLimits) {
    totalCalls += userLimit.totalCallsMade;

    for (const accountUsage of userLimit.accountUsage) {
      allAccounts.push({
        instagramAccountId: accountUsage.instagramAccountId,
        username: accountUsage.accountUsername,
        callsMade: accountUsage.callsMade,
        clerkId: userLimit.clerkId,
        tier: userLimit.tier as TierType,
        lastCallAt: accountUsage.lastCallAt,
      });
    }
  }

  // Sort by calls made (descending)
  allAccounts.sort((a, b) => b.callsMade - a.callsMade);

  return {
    windowStart: targetWindowStart,
    totalAccounts: allAccounts.length,
    totalCalls,
    accounts: allAccounts,
  };
}

// Manually pause/resume user automation
export async function toggleUserAutomation(
  clerkId: string,
  pause: boolean
): Promise<{ success: boolean; message: string }> {
  await connectToDatabase();

  const { start: windowStart } = await getCurrentWindow();

  const userLimit = await RateUserRateLimit.findOneAndUpdate(
    { clerkId, windowStart },
    { isAutomationPaused: pause },
    { upsert: true, new: true }
  );

  // Also update Instagram accounts
  await InstagramAccount.updateMany({ userId: clerkId }, { isActive: !pause });

  return {
    success: true,
    message: `User automation ${pause ? "paused" : "resumed"} successfully`,
  };
}

// Get queue items for a specific Instagram account
export async function getAccountQueueItems(
  instagramAccountId: string,
  limit: number = 50
): Promise<
  Array<{
    id: string;
    clerkId: string;
    actionType: string;
    status: string;
    createdAt: Date;
    priority: number;
    retryCount: number;
    reason?: string;
  }>
> {
  await connectToDatabase();

  const queueItems = await RateLimitQueue.find({
    instagramAccountId,
    status: { $in: ["pending", "processing"] },
  })
    .sort({ priority: 1, createdAt: 1 })
    .limit(limit);

  return queueItems.map((item) => ({
    id: item._id.toString(),
    clerkId: item.clerkId,
    actionType: item.actionType,
    status: item.status,
    createdAt: item.createdAt,
    priority: item.priority,
    retryCount: item.retryCount,
    reason: item.metadata?.reason,
  }));
}
