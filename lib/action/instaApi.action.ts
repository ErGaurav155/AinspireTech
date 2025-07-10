"use server";

import crypto from "crypto";
import { connectToDatabase } from "../database/mongoose";
import InstagramAccount from "../database/models/insta/InstagramAccount.model";
import InstaReplyLog from "../database/models/insta/ReplyLog.model";
import InstaReplyTemplate from "../database/models/insta/ReplyTemplate.model";
import Analytics from "../database/models/insta/Analytics.model";

const CRYPTO_SECRET =
  process.env.CRYPTO_SECRET || "your-32-character-encryption-key-here";

// Encryption utilities for sensitive data (internal only)
const encrypt = (text: string): string => {
  const cipher = crypto.createCipher("aes-256-cbc", CRYPTO_SECRET);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (encryptedText: string): string => {
  const decipher = crypto.createDecipher("aes-256-cbc", CRYPTO_SECRET);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// Internal interfaces
interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  media_id: string;
  user_id: string;
}

interface InstagramMedia {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  comments_count: number;
  like_count: number;
}

interface InstagramProfile {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
  followers_count: number;
  follows_count: number;
  profile_picture_url: string;
}

// Rate Limiter implementation (converted to module-scoped functions)
const rateLimiterRequests = new Map<string, number[]>();
const RATE_LIMIT_MAX_REQUESTS = 200;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function canMakeRequest(accountId: string): boolean {
  const now = Date.now();
  const requests = rateLimiterRequests.get(accountId) || [];
  const validRequests = requests.filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS
  );

  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  validRequests.push(now);
  rateLimiterRequests.set(accountId, validRequests);
  return true;
}

function getRemainingRequests(accountId: string): number {
  const now = Date.now();
  const requests = rateLimiterRequests.get(accountId) || [];
  const validRequests = requests.filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS
  );
  return Math.max(0, RATE_LIMIT_MAX_REQUESTS - validRequests.length);
}

// Instagram API functions (converted from class)
async function getInstagramProfile(
  accessToken: string
): Promise<InstagramProfile> {
  return {
    id: "12345",
    username: "demo_account",
    account_type: "BUSINESS",
    media_count: 150,
    followers_count: Math.floor(Math.random() * 50000) + 1000,
    follows_count: Math.floor(Math.random() * 1000) + 100,
    profile_picture_url:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
  };
}

export async function getRecentMedia(
  accessToken: string,
  limit: number = 25
): Promise<InstagramMedia[]> {
  const mockMedia: InstagramMedia[] = [];
  for (let i = 0; i < limit; i++) {
    mockMedia.push({
      id: `media_${i}`,
      caption: `Sample post caption ${i + 1}`,
      media_type: "IMAGE",
      media_url: `https://images.pexels.com/photos/${
        1000000 + i
      }/pexels-photo-${1000000 + i}.jpeg?auto=compress&cs=tinysrgb&w=400`,
      permalink: `https://instagram.com/p/sample${i}`,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      comments_count: Math.floor(Math.random() * 50),
      like_count: Math.floor(Math.random() * 500),
    });
  }
  return mockMedia;
}

export async function getMediaComments(
  accessToken: string,
  mediaId: string
): Promise<InstagramComment[]> {
  const mockComments: InstagramComment[] = [];
  const commentTexts = [
    "Love this post! 😍",
    "Amazing content!",
    "Where can I buy this?",
    "Beautiful! 💕",
    "Can you share the recipe?",
    "What camera did you use?",
    "This is so inspiring!",
    "Hello! New follower here 👋",
    "Price please?",
    "Tutorial please!",
  ];

  for (let i = 0; i < Math.floor(Math.random() * 10) + 1; i++) {
    mockComments.push({
      id: `comment_${mediaId}_${i}`,
      text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
      username: `user_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      media_id: mediaId,
      user_id: `user_id_${i}`,
    });
  }
  return mockComments;
}

async function replyToComment(
  accessToken: string,
  commentId: string,
  message: string
): Promise<boolean> {
  console.log(`Replying to comment ${commentId} with: ${message}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return Math.random() > 0.05;
}

async function validateAccessToken(accessToken: string): Promise<boolean> {
  return true;
}

// Comment processing helper functions
async function findMatchingTemplate(
  commentText: string,
  templates: any[]
): Promise<any | null> {
  const lowerCommentText = commentText.toLowerCase();

  for (const template of templates) {
    for (const trigger of template.triggers) {
      if (lowerCommentText.includes(trigger.toLowerCase())) {
        return template;
      }
    }
  }

  return null;
}

async function updateAnalytics(
  accountId: string,
  success: boolean,
  responseTime: number
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let analytics = await Analytics.findOne({
    accountId: accountId,
    date: today,
  });

  if (!analytics) {
    analytics = new Analytics({
      accountId: accountId,
      date: today,
      totalReplies: 0,
      successfulReplies: 0,
      failedReplies: 0,
      avgResponseTime: 0,
      engagementRate: 0,
      topTemplates: [],
      commentsProcessed: 0,
      newFollowers: 0,
    });
  }

  analytics.totalReplies += 1;
  analytics.commentsProcessed += 1;

  if (success) {
    analytics.successfulReplies += 1;
  } else {
    analytics.failedReplies += 1;
  }

  const totalSuccessful = analytics.successfulReplies;
  if (totalSuccessful > 0) {
    analytics.avgResponseTime =
      (analytics.avgResponseTime * (totalSuccessful - 1) + responseTime) /
      totalSuccessful;
  }

  await analytics.save();
}

export async function processComment(
  accessToken: string,
  accountId: string,
  comment: InstagramComment,
  mediaId: string
): Promise<void> {
  try {
    const existingLog = await InstaReplyLog.findOne({ commentId: comment.id });
    if (existingLog) return;

    const templates = await InstaReplyTemplate.find({
      accountId: accountId,
      isActive: true,
    }).sort({ priority: 1 });

    const matchingTemplate = await findMatchingTemplate(
      comment.text,
      templates
    );
    if (!matchingTemplate) return;

    const startTime = Date.now();
    const success = await replyToComment(
      accessToken,
      comment.id,
      matchingTemplate.content
    );
    const responseTime = Date.now() - startTime;

    const replyLog = new InstaReplyLog({
      accountId: accountId,
      templateId: matchingTemplate._id,
      commentId: comment.id,
      commentText: comment.text,
      replyText: matchingTemplate.content,
      success,
      responseTime,
      mediaId,
      commenterUsername: comment.username,
      timestamp: new Date(comment.timestamp),
    });

    await replyLog.save();

    if (success) {
      matchingTemplate.usageCount += 1;
      matchingTemplate.lastUsed = new Date();
      await matchingTemplate.save();
    }

    await updateAnalytics(accountId, success, responseTime);
  } catch (error) {
    console.error("Error processing comment:", error);
  }
}

// Server Actions (exported)
export async function processAllAccountComments(): Promise<void> {
  try {
    await connectToDatabase();
    const activeAccounts = await InstagramAccount.find({ isActive: true });

    for (const account of activeAccounts) {
      const accessToken = "mock_access_token"; // Replace with: decrypt(account.accessToken)

      if (!canMakeRequest(account._id.toString())) {
        console.log(`Rate limit exceeded for account ${account._id}`);
        continue;
      }

      if (!account.isActive) continue;

      const recentMedia = await getRecentMedia(accessToken, 10);

      for (const media of recentMedia) {
        const comments = await getMediaComments(accessToken, media.id);
        for (const comment of comments) {
          await processComment(
            accessToken,
            account._id.toString(),
            comment,
            media.id
          );
        }
      }

      account.lastActivity = new Date();
      await account.save();

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error("Error processing all account comments:", error);
    throw error;
  }
}

export async function getInstagramProfileAction(
  accessToken: string
): Promise<InstagramProfile> {
  return await getInstagramProfile(accessToken);
}

export async function replyToCommentAction(
  accessToken: string,
  commentId: string,
  message: string
): Promise<boolean> {
  return await replyToComment(accessToken, commentId, message);
}

export async function validateAccessTokenAction(
  accessToken: string
): Promise<boolean> {
  return await validateAccessToken(accessToken);
}

export async function getRateLimitStatusAction(
  accountId: string
): Promise<{ canMakeRequest: boolean; remaining: number }> {
  return {
    canMakeRequest: canMakeRequest(accountId),
    remaining: getRemainingRequests(accountId),
  };
}
