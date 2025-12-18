// app/lib/services/queue.service.ts
"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import { QueueItem, IQueueItem } from "@/lib/database/models/rate/Queue.model";
import RateLimiterService from "./rateLimiter";

export default class QueueService {
  private static readonly BATCH_SIZE = 5;
  private static readonly RETRY_DELAY_MS = 5000; // 5 seconds
  private static readonly MAX_PRIORITY_DELAY = 60000; // 1 minute for low priority

  /**
   * Add item to queue with rate limiting check
   */
  // app/lib/services/queue.service.ts - Updated enqueue method
  static async enqueue(
    accountId: string,
    userId: string,
    actionType: IQueueItem["actionType"],
    payload: any,
    priority: number = 3,
    metadata?: Partial<IQueueItem["metadata"]> // Now accepts the full metadata object
  ): Promise<{
    queued: boolean;
    queueId?: string;
    delayMs?: number;
    scheduledFor?: Date;
  }> {
    await connectToDatabase();

    // Check rate limit first
    const rateLimit = await RateLimiterService.canMakeCall(
      accountId,
      userId,
      actionType
    );

    if (rateLimit.allowed) {
      // If allowed, process immediately (but still through queue for tracking)
      const queueItem = await QueueItem.create({
        accountId,
        userId,
        actionType,
        payload,
        priority,
        status: "PENDING",
        scheduledFor: new Date(),
        metadata,
      });

      // Process immediately
      setTimeout(() => {
        this.processItem(queueItem._id.toString());
      }, 0);

      return {
        queued: true,
        queueId: queueItem._id.toString(),
        scheduledFor: new Date(),
      };
    } else if (rateLimit.delayMs) {
      // Calculate scheduled time based on priority and delay
      const baseDelay = rateLimit.delayMs;
      const priorityDelay = ((priority - 1) * this.MAX_PRIORITY_DELAY) / 4; // Scale by priority
      const totalDelay = baseDelay + priorityDelay;

      const scheduledFor = new Date(Date.now() + totalDelay);

      const queueItem = await QueueItem.create({
        accountId,
        userId,
        actionType,
        payload,
        priority,
        status: "QUEUED",
        scheduledFor,
        metadata,
      });

      // Schedule processing
      setTimeout(() => {
        this.processItem(queueItem._id.toString());
      }, totalDelay);

      return {
        queued: true,
        queueId: queueItem._id.toString(),
        delayMs: totalDelay,
        scheduledFor,
      };
    } else {
      // Rate limited but no specific delay - use exponential backoff based on priority
      const backoffDelay = Math.pow(2, 6 - priority) * 1000; // Higher priority = shorter delay
      const scheduledFor = new Date(Date.now() + backoffDelay);

      const queueItem = await QueueItem.create({
        accountId,
        userId,
        actionType,
        payload,
        priority,
        status: "QUEUED",
        scheduledFor,
        metadata,
      });

      setTimeout(() => {
        this.processItem(queueItem._id.toString());
      }, backoffDelay);

      return {
        queued: true,
        queueId: queueItem._id.toString(),
        delayMs: backoffDelay,
        scheduledFor,
      };
    }
  }
  /**
   * Process a single queue item
   */
  private static async processItem(queueItemId: string): Promise<void> {
    await connectToDatabase();

    const queueItem = await QueueItem.findById(queueItemId);
    if (!queueItem || queueItem.status !== "QUEUED") return;

    try {
      queueItem.status = "PROCESSING";
      queueItem.attempts += 1;
      await queueItem.save();

      // Check rate limit again before processing
      const rateLimit = await RateLimiterService.canMakeCall(
        queueItem.accountId,
        queueItem.userId,
        queueItem.actionType
      );

      if (!rateLimit.allowed) {
        // Still rate limited - reschedule
        const backoffDelay =
          Math.pow(2, queueItem.attempts) * this.RETRY_DELAY_MS;
        queueItem.status = "QUEUED";
        queueItem.scheduledFor = new Date(Date.now() + backoffDelay);
        await queueItem.save();

        setTimeout(() => {
          this.processItem(queueItemId);
        }, backoffDelay);
        return;
      }

      // Process based on action type
      const result = await this.executeAction(queueItem);

      queueItem.status = "COMPLETED";
      queueItem.processedAt = new Date();
      queueItem.result = result;
      await queueItem.save();
    } catch (error: any) {
      console.error(`Queue processing error for item ${queueItemId}:`, error);

      if (queueItem.attempts >= queueItem.maxAttempts) {
        queueItem.status = "FAILED";
        queueItem.error = error.message;
        await queueItem.save();
      } else {
        // Retry with exponential backoff
        const backoffDelay =
          Math.pow(2, queueItem.attempts) * this.RETRY_DELAY_MS;
        queueItem.status = "QUEUED";
        queueItem.scheduledFor = new Date(Date.now() + backoffDelay);
        await queueItem.save();

        setTimeout(() => {
          this.processItem(queueItemId);
        }, backoffDelay);
      }
    }
  }

  /**
   * Execute the actual action based on type
   */
  private static async executeAction(queueItem: IQueueItem): Promise<any> {
    const { actionType, payload, accountId, userId } = queueItem;

    // Import your existing functions
    const {
      sendInitialAccessDM,
      sendFollowReminderDM,
      sendFinalLinkDM,
      replyToComment,
      getInstagramProfile,
      checkFollowRelationshipDBFirst,
    } = require("@/lib/actions/instaApi.actions");

    switch (actionType) {
      case "COMMENT":
        return await replyToComment(
          payload.username,
          accountId,
          payload.accessToken,
          payload.commentId,
          payload.mediaId,
          payload.message
        );

      case "DM":
        if (payload.dmType === "INITIAL") {
          return await sendInitialAccessDM(
            accountId,
            payload.accessToken,
            payload.recipientId,
            payload.targetUsername,
            payload.templateMediaId,
            payload.openDm
          );
        } else if (payload.dmType === "FOLLOW_REMINDER") {
          return await sendFollowReminderDM(
            accountId,
            payload.accessToken,
            payload.recipientId,
            payload.targetUsername,
            payload.targetTemplate
          );
        } else if (payload.dmType === "FINAL_LINK") {
          return await sendFinalLinkDM(
            accountId,
            payload.accessToken,
            payload.recipientId,
            payload.content
          );
        }
        break;

      case "FOLLOW_CHECK":
        return await checkFollowRelationshipDBFirst(
          payload.igScopedUserId,
          payload.pageAccessToken
        );

      case "PROFILE":
        return await getInstagramProfile(payload.accessToken);

      case "POSTBACK":
        // Handle postback through your existing function
        const { handlePostback } = require("@/lib/actions/instaApi.actions");
        return await handlePostback(
          accountId,
          userId,
          payload.recipientId,
          payload.payload
        );

      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }

  /**
   * Get queue statistics
   */
  static async getStats(accountId?: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    queued: number;
    failed: number;
    byType: Record<string, number>;
    avgProcessingTime: number;
  }> {
    await connectToDatabase();

    const matchStage: any = {};
    if (accountId) {
      matchStage.accountId = accountId;
    }

    const stats = await QueueItem.aggregate([
      { $match: matchStage },
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          types: [
            {
              $group: {
                _id: "$actionType",
                count: { $sum: 1 },
              },
            },
          ],
          processingTimes: [
            {
              $match: {
                status: "COMPLETED",
                processedAt: { $exists: true },
                createdAt: { $exists: true },
              },
            },
            {
              $addFields: {
                processingTime: {
                  $subtract: ["$processedAt", "$createdAt"],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgTime: { $avg: "$processingTime" },
              },
            },
          ],
        },
      },
    ]);

    const result = {
      total: 0,
      pending: 0,
      processing: 0,
      queued: 0,
      failed: 0,
      byType: {} as Record<string, number>,
      avgProcessingTime: 0,
    };

    if (stats[0]?.counts) {
      stats[0].counts.forEach((item: any) => {
        result.total += item.count;
        switch (item._id) {
          case "PENDING":
            result.pending = item.count;
            break;
          case "PROCESSING":
            result.processing = item.count;
            break;
          case "QUEUED":
            result.queued = item.count;
            break;
          case "FAILED":
            result.failed = item.count;
            break;
        }
      });
    }

    if (stats[0]?.types) {
      stats[0].types.forEach((item: any) => {
        result.byType[item._id] = item.count;
      });
    }

    if (stats[0]?.processingTimes?.[0]?.avgTime) {
      result.avgProcessingTime = stats[0].processingTimes[0].avgTime;
    }

    return result;
  }

  /**
   * Clean up old queue items
   */
  static async cleanupOldItems(days: number = 7): Promise<number> {
    await connectToDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await QueueItem.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: { $in: ["COMPLETED", "FAILED"] },
    });

    return result.deletedCount;
  }
}
