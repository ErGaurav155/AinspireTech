"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import { getCurrentWindow, canMakeCall } from "./hourlyRateLimiter";
import InstagramAccount from "@/lib/database/models/insta/InstagramAccount.model";
import { processComment } from "@/lib/action/instaApi.action";
import { handlePostback } from "@/lib/action/instaApi.action";
import RateLimitQueue from "../database/models/Rate/RateLimitQueue.model";

export async function processQueueBatch(batchSize: number = 50): Promise<{
  processed: number;
  failed: number;
  skipped: number;
  remaining: number;
}> {
  await connectToDatabase();

  const { start: currentWindowStart } = await getCurrentWindow();

  // Get queue items for processing (FIFO: by createdAt)
  const queueItems = await RateLimitQueue.find({
    createdAt: { $lte: currentWindowStart },
  })
    .sort({ createdAt: 1 }) // FIFO ordering
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
        // Process based on action type
        let processResult;

        switch (item.actionType) {
          case "comment_reply":
            processResult = await processQueuedComment(item);
            break;
          case "dm":
            processResult = await processQueuedDM(item);
            break;

          default:
            processResult = { success: false, error: "Unknown action type" };
        }

        if (processResult.success) {
          try {
            await RateLimitQueue.deleteOne({ _id: item._id });
            processed++;
          } catch (recordError) {
            // DELETE the item on recording error
            await RateLimitQueue.deleteOne({ _id: item._id });
            failed++;
          }
        } else {
          // Processing failed - DELETE the item immediately
          await RateLimitQueue.deleteOne({ _id: item._id });
          failed++;
        }
      } else {
        // Can't process now - keep in queue
        skipped++;
      }
    } catch (error) {
      console.error(`Error processing queue item ${item._id}:`, error);

      // On any error, DELETE the item
      await RateLimitQueue.deleteOne({ _id: item._id });
      failed++;
    }
  }

  // Get remaining queue items
  const remaining = await RateLimitQueue.countDocuments({
    createdAt: { $lte: currentWindowStart },
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
    const { accountId, recipientId, payload } = item.actionPayload;

    // Validate required parameters
    if (!accountId || !recipientId || !payload) {
      return {
        success: false,
        error: "Missing required parameters for DM processing",
      };
    }

    const account = await InstagramAccount.findOne({
      instagramId: item.instagramAccountId,
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    // Handle postback action
    const result = await handlePostback(
      account.instagramId,
      item.clerkId,
      recipientId,
      payload
    );

    return {
      success: result.success,
      error: result.success
        ? undefined
        : result.message || "Failed to process postback",
    };
  } catch (error) {
    console.error("Error processing queued DM:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error in DM processing",
    };
  }
}

// Get queue statistics
export async function getQueueStats() {
  await connectToDatabase();

  const totalItems = await RateLimitQueue.countDocuments();

  const byType = await RateLimitQueue.aggregate([
    {
      $group: {
        _id: "$actionType",
        count: { $sum: 1 },
      },
    },
  ]);

  const oldestItem = await RateLimitQueue.findOne({})
    .sort({ createdAt: 1 })
    .select("createdAt clerkId instagramAccountId actionType");

  return {
    totalItems,
    byType,
    oldestItem,
  };
}

// Manual cleanup of old queue items (MongoDB TTL should handle this automatically)
export async function manualCleanupOldQueueItems(): Promise<{
  deleted: number;
}> {
  await connectToDatabase();

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  // Find all items older than 2 days
  const oldItems = await RateLimitQueue.find({
    createdAt: { $lt: twoDaysAgo },
  });

  const deletedCount = oldItems.length;

  // DELETE all old items
  for (const item of oldItems) {
    await RateLimitQueue.deleteOne({ _id: item._id });
  }

  if (deletedCount > 0) {
    console.log(`Manually cleaned up ${deletedCount} old queue items`);
  }

  return { deleted: deletedCount };
}
