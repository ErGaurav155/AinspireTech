// app/lib/services/hourlyRateLimiter.ts
"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import InstaSubscription from "../database/models/insta/InstaSubscription.model";
import {
  checkFollowRelationshipDBFirst,
  replyToComment,
  sendFinalLinkDM,
  sendFollowReminderDM,
  sendInitialAccessDM,
} from "../action/instaApi.action";
import { RateGlobalRateLimit } from "../database/models/rate/GlobalRateLimit.model";
import { RateQueueItem } from "../database/models/rate/Queue.model";
import { RateUserCall } from "../database/models/rate/UserCall.model";

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
      appLimit: 10000, // Default global limit
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
    // Return default starter plan
    return {
      plan: "Insta-Automation-Starter",
      accountLimit: 1,
      replyLimit: 500,
      dmLimit: 1000,
      isActive: false,
    };
  }

  // Get plan details
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

// Check if call can be made (main function)
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
  let userCall = await RateUserCall.findOne({ clerkId });

  if (!userCall) {
    userCall = await RateUserCall.create({
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
      },
    });
  }

  // Check if window changed
  if (
    userCall.currentWindow !== windowLabel ||
    userCall.windowStartHour !== currentHour
  ) {
    // Reset user count for new window
    userCall.count = 0;
    userCall.currentWindow = windowLabel;
    userCall.windowStartHour = currentHour;
    await userCall.save();
  }

  // Get global window
  const globalWindow = await getOrCreateGlobalWindow();

  // Get account rate limit info
  const account = await InstagramAccount.findOne({ instagramId: accountId });
  const accountCalls = account?.rateLimitInfo?.calls || 0;
  const accountRemaining = 180 - accountCalls;

  // Check limits in order
  const checks = [
    {
      name: "globalAppLimit",
      condition: globalWindow.totalCalls >= globalWindow.appLimit,
      reason: "Global app limit reached",
    },
    {
      name: "userSubscriptionLimit",
      condition: userCall.count >= subscription.replyLimit,
      reason: "User subscription limit reached",
    },
    {
      name: "accountRateLimit",
      condition: accountCalls >= 180,
      reason: "Instagram API rate limit reached",
    },
  ];

  const failedCheck = checks.find((check) => check.condition);

  if (failedCheck) {
    // Check if we should queue this request
    const shouldQueue = ["userSubscriptionLimit", "accountRateLimit"].includes(
      failedCheck.name
    );

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
          estimatedWait: queueItem.position * 1000, // 1 second per item estimate
          windowLabel,
        },
        limits: {
          userLimit: subscription.replyLimit,
          userUsed: userCall.count,
          globalLimit: globalWindow.appLimit,
          globalUsed: globalWindow.totalCalls,
          accountLimit: 180,
          accountUsed: accountCalls,
        },
      };
    }

    return {
      allowed: false,
      reason: failedCheck.reason,
      shouldQueue: false,
      limits: {
        userLimit: subscription.replyLimit,
        userUsed: userCall.count,
        globalLimit: globalWindow.appLimit,
        globalUsed: globalWindow.totalCalls,
        accountLimit: 180,
        accountUsed: accountCalls,
      },
    };
  }

  // All checks passed - allow the call
  // Increment user call count
  userCall.count += 1;

  // Increment appropriate metadata counter
  if (actionType === "DM") {
    userCall.metadata.totalDmCount += 1;
  } else if (actionType === "COMMENT") {
    userCall.metadata.totalCommentCount += 1;
  }

  // Add account to used accounts if not already
  if (!userCall.metadata.accountsUsed.includes(accountId)) {
    userCall.metadata.accountsUsed.push(accountId);
  }

  await userCall.save();

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
      userUsed: userCall.count,
      globalLimit: globalWindow.appLimit,
      globalUsed: globalWindow.totalCalls + 1,
      accountLimit: 180,
      accountUsed: accountCalls,
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
    .limit(100); // Process 100 at a time

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
        item.windowLabel = windowLabel; // Move to current window
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

// Trigger actual action processing
async function triggerActionProcessing(queueItem: any) {
  // This function would trigger the actual API calls
  // Based on your existing code structure
  const { actionType, payload, accountId, userId, clerkId } = queueItem;

  try {
    let result = null;

    switch (actionType) {
      case "COMMENT":
        result = await replyToComment(
          payload.username,
          accountId,
          payload.accessToken,
          payload.commentId,
          payload.mediaId,
          payload.message
        );
        break;

      case "DM":
        switch (payload.dmType) {
          case "INITIAL":
            result = await sendInitialAccessDM(
              accountId,
              payload.accessToken,
              payload.recipientId,
              payload.targetUsername,
              payload.templateMediaId,
              payload.openDm
            );
            break;
          case "FOLLOW_REMINDER":
            result = await sendFollowReminderDM(
              accountId,
              payload.accessToken,
              payload.recipientId,
              payload.targetUsername,
              payload.targetTemplate
            );
            break;
          case "FINAL_LINK":
            result = await sendFinalLinkDM(
              accountId,
              payload.accessToken,
              payload.recipientId,
              payload.content
            );
            break;
        }
        break;

      case "FOLLOW_CHECK":
        result = await checkFollowRelationshipDBFirst(
          payload.igScopedUserId,
          payload.pageAccessToken
        );
        break;

      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }

    // Update queue item as completed
    queueItem.status = "COMPLETED";
    queueItem.processedAt = new Date();
    queueItem.result = result;
    await queueItem.save();

    console.log(
      `Successfully processed queued item ${queueItem._id} for action ${actionType}`
    );
  } catch (error) {
    console.error(`Error executing action for ${queueItem._id}:`, error);
    queueItem.status = "FAILED";
    queueItem.error = error instanceof Error ? error.message : "Unknown error";
    await queueItem.save();

    // Retry logic
    if (queueItem.attempts < queueItem.maxAttempts) {
      queueItem.attempts += 1;
      queueItem.status = "QUEUED";
      queueItem.metadata.retryCount += 1;
      await queueItem.save();
      console.log(
        `Retry scheduled for item ${queueItem._id}, attempt ${queueItem.attempts}`
      );
    } else {
      console.log(
        `Max retries reached for item ${queueItem._id}, marking as failed`
      );
    }
  }
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

// Reset user counts for new window (cron job)
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
      },
    }
  );

  return {
    modifiedCount: result.modifiedCount,
    windowLabel,
    timestamp: new Date(),
  };
}
