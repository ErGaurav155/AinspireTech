// app/lib/services/hybridQueueProcessor.ts
"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import { getCurrentWindowInfo } from "./hourlyRateLimiter";
import { processQueuedItemsForNewWindow } from "./hourlyRateLimiter";
import { RateQueueItem } from "../database/models/rate/Queue.model";

let processingInProgress = false;
let lastProcessedWindow = "";

export async function hybridQueueProcessor() {
  // Prevent concurrent processing
  if (processingInProgress) {
    return {
      processed: false,
      reason: "Processing already in progress",
      timestamp: new Date().toISOString(),
    };
  }

  try {
    processingInProgress = true;
    await connectToDatabase();

    const { windowLabel } = await getCurrentWindowInfo();

    // Skip if we already processed this window
    if (lastProcessedWindow === windowLabel) {
      return {
        processed: false,
        reason: "Already processed this window",
        window: windowLabel,
        timestamp: new Date().toISOString(),
      };
    }

    // Check if we need to process queue from previous window
    const previousWindowHour =
      (parseInt(windowLabel.split("-")[0]) - 1 + 24) % 24;
    const nextWindowHour = (previousWindowHour + 1) % 24;
    const previousWindowLabel = `${previousWindowHour}-${nextWindowHour}`;

    const queuedItemsCount = await RateQueueItem.countDocuments({
      windowLabel: previousWindowLabel,
      status: "QUEUED",
    });

    if (queuedItemsCount === 0) {
      lastProcessedWindow = windowLabel;
      return {
        processed: false,
        reason: "No items to process",
        window: windowLabel,
        timestamp: new Date().toISOString(),
      };
    }

    console.log(
      `Hybrid Queue Processor: Processing ${queuedItemsCount} items from window ${previousWindowLabel} to ${windowLabel}`
    );

    // Process queue items
    const result = await processQueuedItemsForNewWindow();
    lastProcessedWindow = windowLabel;

    return {
      queueProcessed: true,
      itemsProcessed: result.processed,
      itemsFailed: result.failed,
      itemsSkipped: result.skipped,
      currentWindow: windowLabel,
      previousWindow: previousWindowLabel,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in hybrid queue processing:", error);
    return {
      processed: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  } finally {
    processingInProgress = false;
  }
}

// Function to manually trigger queue processing
export async function manualTriggerQueueProcessing() {
  return await hybridQueueProcessor();
}

// Check if queue processing is needed
export async function checkAndProcessQueueIfNeeded() {
  const { windowLabel } = await getCurrentWindowInfo();

  const queuedItems = await RateQueueItem.countDocuments({
    windowLabel: { $ne: windowLabel },
    status: "QUEUED",
  });

  if (queuedItems > 0) {
    console.log(
      `Found ${queuedItems} queued items from previous windows, triggering processing...`
    );
    return await hybridQueueProcessor();
  }

  return {
    processed: false,
    reason: "No queued items found",
    window: windowLabel,
    timestamp: new Date().toISOString(),
  };
}
