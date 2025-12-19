// app/lib/services/rateLimiter.service.ts
"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import {
  RateLimit,
  RateLimitLog,
} from "@/lib/database/models/rate/RateLimit.model";

export default class RateLimiterService {
  private static readonly CALLS_PER_HOUR = 180;
  private static readonly WINDOW_MS = 60 * 60 * 1000;
  private static readonly BLOCK_THRESHOLD = 170;
  private static readonly BLOCK_DURATION_MS = 5 * 60 * 1000;

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

    if (rateLimit.windowStart < windowStart) {
      rateLimit.calls = 0;
      rateLimit.windowStart = now;
      rateLimit.isBlocked = false;
      rateLimit.blockedUntil = undefined;
      await rateLimit.save();
    }

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

    if (rateLimit.calls >= this.BLOCK_THRESHOLD) {
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

    const windowStartTime = new Date(
      rateLimit.windowStart.getTime() + this.WINDOW_MS
    );
    const resetInMs = Math.max(0, windowStartTime.getTime() - now.getTime());

    if (windowStartTime < now) {
      return {
        calls: 0,
        remaining: this.CALLS_PER_HOUR,
        isBlocked: false,
        windowStart: now,
        resetInMs: this.WINDOW_MS,
      };
    }

    return {
      calls: rateLimit.calls,
      remaining: Math.max(0, this.CALLS_PER_HOUR - rateLimit.calls),
      isBlocked: rateLimit.isBlocked || false,
      blockedUntil: rateLimit.blockedUntil,
      windowStart: rateLimit.windowStart,
      resetInMs,
    };
  }

  static async resetAccount(accountId: string): Promise<void> {
    await connectToDatabase();
    await RateLimit.deleteOne({ accountId });
  }

  static async getTopUsers(limit: number = 10): Promise<
    Array<{
      userId: string;
      accountId: string;
      totalCalls: number;
      avgCallsPerHour: number;
    }>
  > {
    await connectToDatabase();

    try {
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
            avgCallsPerHour: {
              $divide: ["$totalCalls", { $max: ["$records", 1] }],
            },
          },
        },
        { $sort: { totalCalls: -1 } },
        { $limit: limit },
      ]);

      return result;
    } catch (error) {
      console.error("Error getting top users:", error);
      return [];
    }
  }

  static async getSystemStats(): Promise<{
    totalAccounts: number;
    blockedAccounts: number;
    nearLimitAccounts: number;
    totalCallsToday: number;
    avgCallsPerAccount: number;
  }> {
    await connectToDatabase();

    try {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const allRateLimits = await RateLimit.find();

      let totalCallsToday = 0;
      let blockedAccounts = 0;
      let nearLimitAccounts = 0;

      allRateLimits.forEach((limit) => {
        if (limit.windowStart >= todayStart) {
          totalCallsToday += limit.calls || 0;
        }

        if (limit.isBlocked && limit.blockedUntil && limit.blockedUntil > now) {
          blockedAccounts++;
        }

        if (
          limit.calls >= this.BLOCK_THRESHOLD &&
          limit.windowStart >= oneHourAgo
        ) {
          nearLimitAccounts++;
        }
      });

      const totalAccounts = allRateLimits.length;
      const avgCallsPerAccount =
        totalAccounts > 0 ? totalCallsToday / totalAccounts : 0;

      return {
        totalAccounts,
        blockedAccounts,
        nearLimitAccounts,
        totalCallsToday,
        avgCallsPerAccount,
      };
    } catch (error) {
      console.error("Error getting system stats:", error);
      return {
        totalAccounts: 0,
        blockedAccounts: 0,
        nearLimitAccounts: 0,
        totalCallsToday: 0,
        avgCallsPerAccount: 0,
      };
    }
  }
}
