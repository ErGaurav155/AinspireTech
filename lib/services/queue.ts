// app/lib/server/queue.ts
"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import { QueueItem, IQueueItem } from "@/lib/database/models/rate/Queue.model";

/**
 * Add item to queue
 */
export async function enqueueItem(
  accountId: string,
  userId: string,
  actionType: IQueueItem["actionType"],
  payload: any,
  priority: number = 3,
  metadata?: Partial<IQueueItem["metadata"]>
): Promise<{
  queued: boolean;
  queueId?: string;
  delayMs?: number;
  scheduledFor?: Date;
}> {
  await connectToDatabase();

  const now = new Date();
  const queueItem = await QueueItem.create({
    accountId,
    userId,
    actionType,
    payload,
    priority,
    status: "PENDING",
    scheduledFor: now,
    metadata,
  });

  return {
    queued: true,
    queueId: queueItem._id.toString(),
    scheduledFor: now,
  };
}

/**
 * Get queue statistics
 */
export async function getQueueStats(accountId?: string): Promise<{
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
export async function cleanupOldQueueItems(days: number = 7): Promise<number> {
  await connectToDatabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await QueueItem.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: { $in: ["COMPLETED", "FAILED"] },
  });

  return result.deletedCount;
}
