"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import { getCurrentWindow, canMakeCall, recordCall } from "./hourlyRateLimiter";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import { processComment } from "@/lib/action/instaApi.action";
import RateLimitQueue from "../database/models/Rate/RateLimitQueue.model";

export async function processQueueBatch(batchSize: number = 50): Promise<{
  processed: number;
  failed: number;
  skipped: number;
  remaining: number;
}> {
  await connectToDatabase();

  const { start: currentWindowStart } = await getCurrentWindow();

  // Get pending queue items for processing
  const queueItems = await RateLimitQueue.find({
    status: "pending",
    windowStart: { $lte: currentWindowStart },
    retryCount: { $lt: 3 },
  })
    .sort({ priority: 1, createdAt: 1 })
    .limit(batchSize);

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (const item of queueItems) {
    try {
      // Check if we can process this item now
      const canProcess = await canMakeCall(
        item.clerkId,
        item.instagramAccountId
      );

      if (canProcess.allowed) {
        // Mark as processing
        await RateLimitQueue.updateOne(
          { _id: item._id },
          {
            status: "processing",
            processingStartedAt: new Date(),
          }
        );

        // Process based on action type
        let processResult;

        switch (item.actionType) {
          case "comment_reply":
            processResult = await processQueuedComment(item);
            break;
          case "dm":
            processResult = await processQueuedDM(item);
            break;
          case "follow_check":
            processResult = await processQueuedFollowCheck(item);
            break;
          default:
            processResult = { success: false, error: "Unknown action type" };
        }

        if (processResult.success) {
          // Record the successful call
          const recordResult = await recordCall(
            item.clerkId,
            item.instagramAccountId,
            item.actionType,
            item.actionPayload
          );

          if (recordResult.success) {
            // Mark as completed
            await RateLimitQueue.updateOne(
              { _id: item._id },
              {
                status: "completed",
                processingCompletedAt: new Date(),
              }
            );

            processed++;
          } else if (recordResult.queued) {
            // Got queued again - update retry count
            await RateLimitQueue.updateOne(
              { _id: item._id },
              {
                retryCount: item.retryCount + 1,
                errorMessage: "Re-queued during processing",
                status:
                  item.retryCount + 1 >= item.maxRetries ? "failed" : "pending",
              }
            );

            if (item.retryCount + 1 >= item.maxRetries) {
              failed++;
            } else {
              skipped++;
            }
          } else {
            // Failed to record
            await RateLimitQueue.updateOne(
              { _id: item._id },
              {
                status: "failed",
                errorMessage: "Failed to record call",
                retryCount: item.retryCount + 1,
              }
            );

            failed++;
          }
        } else {
          // Increment retry count
          await RateLimitQueue.updateOne(
            { _id: item._id },
            {
              retryCount: item.retryCount + 1,
              errorMessage: processResult.error,
              status:
                item.retryCount + 1 >= item.maxRetries ? "failed" : "pending",
            }
          );

          if (item.retryCount + 1 >= item.maxRetries) {
            failed++;
          } else {
            skipped++;
          }
        }
      } else {
        // Update window start to current window if it's from previous window
        if (item.windowStart.getTime() < currentWindowStart.getTime()) {
          await RateLimitQueue.updateOne(
            { _id: item._id },
            { windowStart: currentWindowStart }
          );
        }
        skipped++;
      }
    } catch (error) {
      console.error(`Error processing queue item ${item._id}:`, error);

      await RateLimitQueue.updateOne(
        { _id: item._id },
        {
          retryCount: item.retryCount + 1,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          status: item.retryCount + 1 >= item.maxRetries ? "failed" : "pending",
        }
      );

      if (item.retryCount + 1 >= item.maxRetries) {
        failed++;
      } else {
        skipped++;
      }
    }
  }

  // Get remaining queue items
  const remaining = await RateLimitQueue.countDocuments({
    status: "pending",
    windowStart: { $lte: currentWindowStart },
  });

  return { processed, failed, skipped, remaining };
}

async function processQueuedComment(
  item: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const { comment } = item.actionPayload;
    const account = await InstagramAccount.findOne({
      instagramId: item.instagramAccountId,
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    // Use the existing processComment function
    const result = await processComment(
      account.instagramId,
      item.clerkId,
      comment
    );

    return {
      success: result.success,
      error: result.success
        ? undefined
        : result.message || "Failed to process comment",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function processQueuedDM(
  item: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Implement DM processing logic
    // For now, return success for demonstration
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate processing
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function processQueuedFollowCheck(
  item: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Implement follow check processing logic
    // For now, return success for demonstration
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate processing
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get queue statistics
export async function getQueueStats() {
  await connectToDatabase();

  const stats = await RateLimitQueue.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgRetryCount: { $avg: "$retryCount" },
      },
    },
  ]);

  const byType = await RateLimitQueue.aggregate([
    {
      $match: {
        status: { $in: ["pending", "processing"] },
      },
    },
    {
      $group: {
        _id: "$actionType",
        count: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
      },
    },
  ]);

  const byReason = await RateLimitQueue.aggregate([
    {
      $match: {
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

  const oldestPending = await RateLimitQueue.findOne({
    status: "pending",
  })
    .sort({ createdAt: 1 })
    .select("createdAt clerkId instagramAccountId actionType metadata");

  return {
    totals: stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>),
    byType,
    byReason,
    oldestPending,
    totalItems: stats.reduce((acc, stat) => acc + stat.count, 0),
  };
}

// Clean up old queue items (older than 7 days)
export async function cleanupOldQueueItems(): Promise<{
  deleted: number;
  kept: number;
}> {
  await connectToDatabase();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Delete completed items older than 7 days
  const deleteResult = await RateLimitQueue.deleteMany({
    status: "completed",
    createdAt: { $lt: sevenDaysAgo },
  });

  // Get count of remaining items
  const remainingCount = await RateLimitQueue.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  return {
    deleted: deleteResult.deletedCount,
    kept: remainingCount,
  };
}
