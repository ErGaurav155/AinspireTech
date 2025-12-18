// app/lib/services/rateLimiter.service.ts
"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import {
  RateLimit,
  RateLimitLog,
} from "@/lib/database/models/rate/RateLimit.model";

export default class RateLimiterService {
  private static readonly CALLS_PER_HOUR = 180; // Using 180 to be safe (20 buffer)
  private static readonly WINDOW_MS = 60 * 60 * 1000; // 1 hour
  private static readonly BLOCK_THRESHOLD = 170; // Block at 170 calls to prevent hitting limit
  private static readonly BLOCK_DURATION_MS = 5 * 60 * 1000; // Block for 5 minutes if near limit

  /**
   * Check if account can make API call
   */
  static async canMakeCall(
    accountId: string,
    userId: string,
    action: string = "api_call"
  ): Promise<{
    allowed: boolean;
    remainingCalls: number;
    delayMs?: number;
    isBlocked: boolean;
    blockedUntil?: Date;
  }> {
    await connectToDatabase();

    const now = new Date();
    const windowStart = new Date(now.getTime() - this.WINDOW_MS);

    // Find or create rate limit record
    let rateLimit = await RateLimit.findOne({ accountId });

    if (!rateLimit) {
      rateLimit = await RateLimit.create({
        accountId,
        userId,
        calls: 0,
        windowStart: now,
        isBlocked: false,
      });
    }

    // Check if window has expired
    if (rateLimit.windowStart < windowStart) {
      rateLimit.calls = 0;
      rateLimit.windowStart = now;
      rateLimit.isBlocked = false;
      rateLimit.blockedUntil = undefined;
    }

    // Check if account is blocked
    if (
      rateLimit.isBlocked &&
      rateLimit.blockedUntil &&
      rateLimit.blockedUntil > now
    ) {
      const remainingBlockTime =
        rateLimit.blockedUntil.getTime() - now.getTime();

      await RateLimitLog.create({
        accountId,
        userId,
        action,
        timestamp: now,
        remainingCalls: this.CALLS_PER_HOUR - rateLimit.calls,
        status: "RATE_LIMITED",
        delayMs: remainingBlockTime,
      });

      return {
        allowed: false,
        remainingCalls: 0,
        delayMs: remainingBlockTime,
        isBlocked: true,
        blockedUntil: rateLimit.blockedUntil,
      };
    }

    // Check if we're approaching the limit
    if (rateLimit.calls >= this.BLOCK_THRESHOLD) {
      // Block account for 5 minutes to prevent hitting limit
      rateLimit.isBlocked = true;
      rateLimit.blockedUntil = new Date(now.getTime() + this.BLOCK_DURATION_MS);
      await rateLimit.save();

      await RateLimitLog.create({
        accountId,
        userId,
        action,
        timestamp: now,
        remainingCalls: this.CALLS_PER_HOUR - rateLimit.calls,
        status: "RATE_LIMITED",
        delayMs: this.BLOCK_DURATION_MS,
      });

      return {
        allowed: false,
        remainingCalls: this.CALLS_PER_HOUR - rateLimit.calls,
        delayMs: this.BLOCK_DURATION_MS,
        isBlocked: true,
        blockedUntil: rateLimit.blockedUntil,
      };
    }

    // Check regular rate limit
    if (rateLimit.calls >= this.CALLS_PER_HOUR) {
      await RateLimitLog.create({
        accountId,
        userId,
        action,
        timestamp: now,
        remainingCalls: 0,
        status: "RATE_LIMITED",
      });

      return {
        allowed: false,
        remainingCalls: 0,
        isBlocked: false,
      };
    }

    // Allowed - increment counter
    rateLimit.calls += 1;
    await rateLimit.save();

    const remainingCalls = this.CALLS_PER_HOUR - rateLimit.calls;

    await RateLimitLog.create({
      accountId,
      userId,
      action,
      timestamp: now,
      remainingCalls,
      status: "SUCCESS",
    });

    return {
      allowed: true,
      remainingCalls,
      isBlocked: false,
    };
  }

  /**
   * Get rate limit status for account
   */
  static async getAccountStatus(accountId: string): Promise<{
    calls: number;
    remaining: number;
    isBlocked: boolean;
    blockedUntil?: Date;
    windowStart: Date;
    resetInMs: number;
  }> {
    await connectToDatabase();

    const rateLimit = await RateLimit.findOne({ accountId });
    const now = new Date();

    if (!rateLimit) {
      return {
        calls: 0,
        remaining: this.CALLS_PER_HOUR,
        isBlocked: false,
        windowStart: now,
        resetInMs: this.WINDOW_MS,
      };
    }

    const windowStart = new Date(
      rateLimit.windowStart.getTime() + this.WINDOW_MS
    );
    const resetInMs = Math.max(0, windowStart.getTime() - now.getTime());

    return {
      calls: rateLimit.calls,
      remaining: Math.max(0, this.CALLS_PER_HOUR - rateLimit.calls),
      isBlocked: rateLimit.isBlocked || false,
      blockedUntil: rateLimit.blockedUntil,
      windowStart: rateLimit.windowStart,
      resetInMs,
    };
  }

  /**
   * Reset rate limit for account
   */
  static async resetAccount(accountId: string): Promise<void> {
    await connectToDatabase();
    await RateLimit.deleteOne({ accountId });
  }

  /**
   * Get top users by API usage
   */
  static async getTopUsers(limit: number = 10): Promise<
    Array<{
      userId: string;
      accountId: string;
      totalCalls: number;
      avgCallsPerHour: number;
    }>
  > {
    await connectToDatabase();

    const result = await RateLimit.aggregate([
      {
        $group: {
          _id: { userId: "$userId", accountId: "$accountId" },
          totalCalls: { $sum: "$calls" },
          records: { $sum: 1 },
        },
      },
      {
        $project: {
          userId: "$_id.userId",
          accountId: "$_id.accountId",
          totalCalls: 1,
          avgCallsPerHour: { $divide: ["$totalCalls", "$records"] },
        },
      },
      { $sort: { totalCalls: -1 } },
      { $limit: limit },
    ]);

    return result;
  }
}
