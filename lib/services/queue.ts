// app/lib/services/queue.ts
"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import {
  IRateQueueItem,
  RateQueueItem,
} from "../database/models/rate/Queue.model";

export async function enqueueItem(
  accountId: string,
  userId: string,
  clerkId: string,
  actionType: IRateQueueItem["actionType"],
  payload: any,
  priority: number = 3,
  metadata?: Partial<IRateQueueItem["metadata"]>
): Promise<{
  queued: boolean;
  queueId?: string;
  delayMs?: number;
  scheduledFor?: Date;
}> {
  await connectToDatabase();

  const now = new Date();

  // Get current window
  const currentHour = now.getHours();
  const nextHour = (currentHour + 1) % 24;
  const windowLabel = `${currentHour}-${nextHour}`;

  // Get queue position
  const queueSize = await RateQueueItem.countDocuments({
    windowLabel,
    status: "QUEUED",
  });

  const queueItem = await RateQueueItem.create({
    accountId,
    userId,
    clerkId,
    actionType,
    payload,
    priority,
    status: "QUEUED",
    scheduledFor: now,
    windowLabel,
    position: queueSize + 1,
    metadata: {
      ...metadata,
      originalTimestamp: now,
      retryCount: 0,
    },
  });

  return {
    queued: true,
    queueId: queueItem._id.toString(),
    scheduledFor: now,
    delayMs: 0,
  };
}

export async function getQueueStats(accountId?: string): Promise<{
  total: number;
  pending: number;
  processing: number;
  queued: number;
  failed: number;
  byType: Record<string, number>;
  avgProcessingTime: number;
  byWindow: Record<string, number>;
}> {
  await connectToDatabase();

  const matchStage: any = {};
  if (accountId) {
    matchStage.accountId = accountId;
  }

  const stats = await RateQueueItem.aggregate([
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
        windows: [
          {
            $group: {
              _id: "$windowLabel",
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
    byWindow: {} as Record<string, number>,
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

  if (stats[0]?.windows) {
    stats[0].windows.forEach((item: any) => {
      result.byWindow[item._id] = item.count;
    });
  }

  if (stats[0]?.processingTimes?.[0]?.avgTime) {
    result.avgProcessingTime = stats[0].processingTimes[0].avgTime;
  }

  return result;
}

export async function cleanupOldQueueItems(days: number = 7): Promise<number> {
  await connectToDatabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await RateQueueItem.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: { $in: ["COMPLETED", "FAILED"] },
  });

  return result.deletedCount;
}

export async function getNextQueueItem(
  limit: number = 10
): Promise<IRateQueueItem[]> {
  await connectToDatabase();

  const currentHour = new Date().getHours();
  const windowLabel = `${currentHour}-${(currentHour + 1) % 24}`;

  return await RateQueueItem.find({
    status: "QUEUED",
    windowLabel,
  })
    .sort({ priority: 1, position: 1 })
    .limit(limit);
}
