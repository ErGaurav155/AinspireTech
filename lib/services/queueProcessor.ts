"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import { getCurrentWindow, canMakeCall, recordCall } from "./hourlyRateLimiter";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import RateLimitQueue from "../database/models/Rate/RateLimitQueue.model";

export async function processQueueBatch(batchSize: number = 50): Promise<{
  processed: number;
  failed: number;
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
            processResult = await processCommentReply(item);
            break;
          case "dm":
            processResult = await processDM(item);
            break;
          // Add other action types as needed
          default:
            processResult = { success: false, error: "Unknown action type" };
        }

        if (processResult.success) {
          // Record the successful call
          await recordCall(
            item.clerkId,
            item.instagramAccountId,
            item.actionType,
            item.actionPayload
          );

          // Mark as completed
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
              errorMessage: processResult.error,
              status:
                item.retryCount + 1 >= item.maxRetries ? "failed" : "pending",
            }
          );

          if (item.retryCount + 1 >= item.maxRetries) {
            failed++;
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
      }
    }
  }

  // Get remaining items
  const remaining = await RateLimitQueue.countDocuments({
    status: "pending",
    windowStart: { $lte: currentWindowStart },
  });

  return { processed, failed, remaining };
}

async function processCommentReply(
  item: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const { comment, template } = item.actionPayload;
    const account = await InstagramAccount.findOne({
      instagramId: item.instagramAccountId,
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    // Import and use your actual comment processing logic here
    // For now, return success for demonstration
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function processDM(
  item: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Implement DM processing logic
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
      $group: {
        _id: "$actionType",
        count: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
      },
    },
  ]);

  const oldestPending = await RateLimitQueue.findOne({
    status: "pending",
  })
    .sort({ createdAt: 1 })
    .select("createdAt clerkId actionType");

  return {
    totals: stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    byType,
    oldestPending,
    totalItems: stats.reduce((acc, stat) => acc + stat.count, 0),
  };
}
