// app/lib/services/hourlyRateLimiter.ts
"use server";

import { connectToDatabase } from "@/lib/database/mongoose";

import User from "@/lib/database/models/user.model";
import { RateGlobalRateLimit } from "../database/models/rate/GlobalRateLimit.model";
import InstaSubscription from "../database/models/insta/InstaSubscription.model";
import {
  IRateUserCall,
  RateUserCall,
} from "../database/models/rate/UserCall.model";
import { RateQueueItem } from "../database/models/rate/Queue.model";
import { triggerActionProcessing } from "./actionProcessor";

// Helper to get current fixed window
export async function getCurrentWindowInfo() {
  const now = new Date();
  const currentHour = now.getHours();
  const nextHour = (currentHour + 1) % 24;

  const windowStart = new Date(now);
  windowStart.setHours(currentHour, 0, 0, 0);

  const windowEnd = new Date(windowStart);
  windowEnd.setHours(windowEnd.getHours() + 1);

  return {
    windowLabel: `${currentHour}-${nextHour}`,
    currentHour,
    windowStart,
    windowEnd,
    now,
  };
}

// Get or create global window
async function getOrCreateGlobalWindow() {
  await connectToDatabase();
  const { windowLabel, currentHour, windowStart, windowEnd } =
    await getCurrentWindowInfo();

  let globalWindow = await RateGlobalRateLimit.findOne({
    windowLabel,
    windowStartHour: currentHour,
  });

  if (!globalWindow) {
    globalWindow = await RateGlobalRateLimit.create({
      windowLabel,
      windowStartHour: currentHour,
      totalCalls: 0,
      appLimit: 10000,
      isActive: true,
      startedAt: windowStart,
      endsAt: windowEnd,
      metadata: {
        accountsProcessed: [],
        blockedAccounts: [],
        queueSize: 0,
      },
    });
  }

  return globalWindow;
}

// Get user subscription info
async function getUserSubscriptionInfo(clerkId: string) {
  await connectToDatabase();

  const subscription = await InstaSubscription.findOne({
    clerkId,
    status: "active",
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!subscription) {
    return {
      plan: "Insta-Automation-Starter",
      accountLimit: 1,
      replyLimit: 500,
      dmLimit: 1000,
      isActive: false,
    };
  }

  const planDetails = {
    "Insta-Automation-Starter": { accounts: 1, replies: 500, dms: 1000 },
    "Insta-Automation-Grow": { accounts: 3, replies: 2000, dms: 3000 },
    "Insta-Automation-Professional": { accounts: 5, replies: 5000, dms: 10000 },
  };

  const details =
    planDetails[subscription.chatbotType as keyof typeof planDetails] ||
    planDetails["Insta-Automation-Starter"];

  return {
    plan: subscription.chatbotType,
    accountLimit: details.accounts,
    replyLimit: details.replies,
    dmLimit: details.dms,
    isActive: true,
  };
}

// Check Instagram account rate limit in RateUserCall
function checkAccountRateLimit(rateUserCall: IRateUserCall, accountId: string) {
  const accountCalls = rateUserCall.metadata.accountCalls.get(accountId);

  if (!accountCalls) {
    return {
      calls: 0,
      remaining: 180,
      isBlocked: false,
    };
  }

  // Check if blocked
  if (
    accountCalls.isBlocked &&
    accountCalls.blockedUntil &&
    accountCalls.blockedUntil > new Date()
  ) {
    return {
      calls: accountCalls.calls,
      remaining: Math.max(0, 180 - accountCalls.calls),
      isBlocked: true,
      blockedUntil: accountCalls.blockedUntil,
    };
  }

  // Check if exceeded 180 calls
  if (accountCalls.calls >= 180) {
    return {
      calls: accountCalls.calls,
      remaining: 0,
      isBlocked: true,
    };
  }

  // Check if approaching limit (170+ calls)
  if (accountCalls.calls >= 170) {
    return {
      calls: accountCalls.calls,
      remaining: Math.max(0, 180 - accountCalls.calls),
      isBlocked: false,
      warning: true,
    };
  }

  return {
    calls: accountCalls.calls,
    remaining: Math.max(0, 180 - accountCalls.calls),
    isBlocked: false,
  };
}

// Main rate limiting check
export async function canMakeCall(
  clerkId: string,
  accountId: string,
  actionType: "COMMENT" | "DM" | "POSTBACK" | "PROFILE" | "FOLLOW_CHECK",
  metadata?: any
): Promise<{
  allowed: boolean;
  reason?: string;
  shouldQueue: boolean;
  queueInfo?: {
    position: number;
    estimatedWait: number;
    windowLabel: string;
  };
  limits: {
    userLimit: number;
    userUsed: number;
    globalLimit: number;
    globalUsed: number;
    accountLimit: number;
    accountUsed: number;
  };
}> {
  await connectToDatabase();

  const { windowLabel, currentHour, now } = await getCurrentWindowInfo();
  const user = await User.findOne({ clerkId });

  if (!user) {
    return {
      allowed: false,
      reason: "User not found",
      shouldQueue: false,
      limits: {
        userLimit: 0,
        userUsed: 0,
        globalLimit: 0,
        globalUsed: 0,
        accountLimit: 180,
        accountUsed: 0,
      },
    };
  }

  // Get subscription info
  const subscription = await getUserSubscriptionInfo(clerkId);

  if (!subscription.isActive) {
    return {
      allowed: false,
      reason: "No active subscription",
      shouldQueue: false,
      limits: {
        userLimit: subscription.replyLimit,
        userUsed: 0,
        globalLimit: 0,
        globalUsed: 0,
        accountLimit: 180,
        accountUsed: 0,
      },
    };
  }

  // Get or create user call counter
  let rateUserCall = await RateUserCall.findOne({ userId: clerkId });

  if (!rateUserCall) {
    rateUserCall = await RateUserCall.create({
      userId: clerkId,
      instagramId: accountId,
      count: 0,
      currentWindow: windowLabel,
      windowStartHour: currentHour,
      subscriptionLimit: subscription.replyLimit,
      metadata: {
        subscriptionType: subscription.plan,
        accountLimit: subscription.accountLimit,
        replyLimit: subscription.replyLimit,
        accountsUsed: [],
        totalDmCount: 0,
        totalCommentCount: 0,
        accountCalls: new Map(),
      },
    });
  }

  // Check if window changed - reset counts if new window
  if (
    rateUserCall.currentWindow !== windowLabel ||
    rateUserCall.windowStartHour !== currentHour
  ) {
    // Reset user count for new window
    rateUserCall.count = 0;
    rateUserCall.currentWindow = windowLabel;
    rateUserCall.windowStartHour = currentHour;

    // Reset all account calls
    rateUserCall.metadata.accountCalls = new Map();

    await rateUserCall.save();
  }

  // Get global window
  const globalWindow = await getOrCreateGlobalWindow();

  // Check account rate limit
  const accountLimitInfo = checkAccountRateLimit(rateUserCall, accountId);

  // Check limits in order
  const checks = [
    {
      name: "globalAppLimit",
      condition: globalWindow.totalCalls >= globalWindow.appLimit,
      reason: "Global app limit reached",
    },
    {
      name: "userSubscriptionLimit",
      condition: rateUserCall.count >= subscription.replyLimit,
      reason: "User subscription limit reached",
    },
    {
      name: "accountRateLimit",
      condition: accountLimitInfo.isBlocked,
      reason: "Instagram API rate limit reached",
    },
    {
      name: "accountWarning",
      condition: accountLimitInfo.warning,
      reason: "Approaching Instagram API limit",
    },
  ];

  const failedCheck = checks.find((check) => check.condition);

  if (failedCheck) {
    // Check if we should queue this request
    const shouldQueue = [
      "userSubscriptionLimit",
      "accountRateLimit",
      "accountWarning",
    ].includes(failedCheck.name);

    if (shouldQueue && metadata) {
      // Add to queue with FIFO position
      const queueSize = await RateQueueItem.countDocuments({
        windowLabel,
        status: "QUEUED",
      });

      const queueItem = await RateQueueItem.create({
        accountId,
        userId: user._id.toString(),
        clerkId,
        actionType,
        payload: metadata,
        priority: actionType === "COMMENT" ? 2 : 3,
        status: "QUEUED",
        windowLabel,
        position: queueSize + 1,
        metadata: {
          ...metadata,
          originalTimestamp: now,
          source:
            failedCheck.name === "userSubscriptionLimit"
              ? "SUBSCRIPTION_LIMIT"
              : "RATE_LIMIT",
        },
      });

      // Update global window queue size
      await RateGlobalRateLimit.findByIdAndUpdate(globalWindow._id, {
        $inc: { "metadata.queueSize": 1 },
      });

      return {
        allowed: false,
        reason: failedCheck.reason,
        shouldQueue: true,
        queueInfo: {
          position: queueItem.position,
          estimatedWait: queueItem.position * 1000,
          windowLabel,
        },
        limits: {
          userLimit: subscription.replyLimit,
          userUsed: rateUserCall.count,
          globalLimit: globalWindow.appLimit,
          globalUsed: globalWindow.totalCalls,
          accountLimit: 180,
          accountUsed: accountLimitInfo.calls,
        },
      };
    }

    return {
      allowed: false,
      reason: failedCheck.reason,
      shouldQueue: false,
      limits: {
        userLimit: subscription.replyLimit,
        userUsed: rateUserCall.count,
        globalLimit: globalWindow.appLimit,
        globalUsed: globalWindow.totalCalls,
        accountLimit: 180,
        accountUsed: accountLimitInfo.calls,
      },
    };
  }

  // All checks passed - allow the call
  // Increment user call count
  rateUserCall.count += 1;

  // Increment account call count
  const accountCalls = rateUserCall.metadata.accountCalls.get(accountId) || {
    calls: 0,
    lastCall: new Date(),
    isBlocked: false,
  };

  accountCalls.calls += 1;
  accountCalls.lastCall = new Date();

  // Block if reached 170+ calls (Instagram limit)
  if (accountCalls.calls >= 170) {
    accountCalls.isBlocked = true;
    accountCalls.blockedUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
  }

  rateUserCall.metadata.accountCalls.set(accountId, accountCalls);

  // Increment appropriate metadata counter
  if (actionType === "DM") {
    rateUserCall.metadata.totalDmCount += 1;
  } else if (actionType === "COMMENT") {
    rateUserCall.metadata.totalCommentCount += 1;
  }

  // Add account to used accounts if not already
  if (!rateUserCall.metadata.accountsUsed.includes(accountId)) {
    rateUserCall.metadata.accountsUsed.push(accountId);
  }

  await rateUserCall.save();

  // Increment global call count
  await RateGlobalRateLimit.findByIdAndUpdate(globalWindow._id, {
    $inc: { totalCalls: 1 },
    $addToSet: { "metadata.accountsProcessed": accountId },
  });

  return {
    allowed: true,
    shouldQueue: false,
    limits: {
      userLimit: subscription.replyLimit,
      userUsed: rateUserCall.count,
      globalLimit: globalWindow.appLimit,
      globalUsed: globalWindow.totalCalls + 1,
      accountLimit: 180,
      accountUsed: accountCalls.calls,
    },
  };
}

// Process queued items when new window starts
export async function processQueuedItemsForNewWindow(): Promise<{
  processed: number;
  failed: number;
  skipped: number;
}> {
  await connectToDatabase();

  const { windowLabel, currentHour } = await getCurrentWindowInfo();
  const previousWindowLabel = `${(currentHour - 1 + 24) % 24}-${currentHour}`;

  // Find all queued items from previous window
  const queuedItems = await RateQueueItem.find({
    windowLabel: previousWindowLabel,
    status: "QUEUED",
  })
    .sort({ position: 1 })
    .limit(100);

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (const item of queuedItems) {
    try {
      // Check if we can process this item now
      const canProcess = await canMakeCall(
        item.clerkId,
        item.accountId,
        item.actionType,
        item.payload
      );

      if (canProcess.allowed) {
        // Update item to pending for processing
        item.status = "PENDING";
        item.windowLabel = windowLabel;
        await item.save();

        // Trigger the actual processing
        await triggerActionProcessing(item);
        processed++;
      } else if (canProcess.shouldQueue) {
        // Still can't process, keep in queue but update window
        item.windowLabel = windowLabel;
        await item.save();
        skipped++;
      } else {
        // Can't process and shouldn't queue - mark as failed
        item.status = "FAILED";
        item.error = canProcess.reason;
        await item.save();
        failed++;
      }
    } catch (error) {
      console.error(`Error processing queued item ${item._id}:`, error);
      item.status = "FAILED";
      item.error = error instanceof Error ? error.message : "Unknown error";
      await item.save();
      failed++;
    }
  }

  // Update global window queue size
  await RateGlobalRateLimit.findOneAndUpdate(
    { windowLabel: previousWindowLabel },
    { $set: { "metadata.queueSize": 0 } }
  );

  return { processed, failed, skipped };
}

// Get current window statistics
export async function getWindowStats(windowLabel?: string) {
  await connectToDatabase();

  const { windowLabel: currentWindow } = await getCurrentWindowInfo();
  const targetWindow = windowLabel || currentWindow;

  const globalWindow = await RateGlobalRateLimit.findOne({
    windowLabel: targetWindow,
  });
  const queuedItems = await RateQueueItem.countDocuments({
    windowLabel: targetWindow,
    status: "QUEUED",
  });

  const userCalls = await RateUserCall.find({ currentWindow: targetWindow });
  const totalUserCalls = userCalls.reduce((sum, uc) => sum + uc.count, 0);

  return {
    window: targetWindow,
    global: {
      totalCalls: globalWindow?.totalCalls || 0,
      appLimit: globalWindow?.appLimit || 10000,
      accountsProcessed: globalWindow?.metadata?.accountsProcessed?.length || 0,
      blockedAccounts: globalWindow?.metadata?.blockedAccounts?.length || 0,
      queueSize: globalWindow?.metadata?.queueSize || 0,
    },
    users: {
      totalUsers: userCalls.length,
      totalCalls: totalUserCalls,
      averageCallsPerUser:
        userCalls.length > 0 ? totalUserCalls / userCalls.length : 0,
    },
    queue: {
      queuedItems,
      byType: await RateQueueItem.aggregate([
        { $match: { windowLabel: targetWindow, status: "QUEUED" } },
        { $group: { _id: "$actionType", count: { $sum: 1 } } },
      ]),
    },
    isCurrentWindow: targetWindow === currentWindow,
  };
}

// Reset user counts for new window
export async function resetUserCountsForNewWindow() {
  await connectToDatabase();

  const { windowLabel, currentHour } = await getCurrentWindowInfo();

  // Update all users who are still in old window
  const result = await RateUserCall.updateMany(
    {
      $or: [
        { currentWindow: { $ne: windowLabel } },
        { windowStartHour: { $ne: currentHour } },
      ],
    },
    {
      $set: {
        count: 0,
        currentWindow: windowLabel,
        windowStartHour: currentHour,
        lastUpdated: new Date(),
        "metadata.accountCalls": {},
      },
    }
  );

  return {
    modifiedCount: result.modifiedCount,
    windowLabel,
    timestamp: new Date(),
  };
}
