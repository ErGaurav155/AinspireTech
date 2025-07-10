"use server";

import InstaAnalytics from "../database/models/insta/Analytics.model";
import InstagramAccount from "../database/models/insta/InstagramAccount.model";
import InstaReplyLog from "../database/models/insta/ReplyLog.model";
import InstaReplyTemplate from "../database/models/insta/ReplyTemplate.model";
import { connectToDatabase } from "../database/mongoose";

// Type definitions
interface InstagramProfile {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
  followers_count: number;
  follows_count: number;
  profile_picture_url: string;
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

interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
}

// Rate limiter implementation
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

// Instagram API functions
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

async function getRecentMedia(
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

async function getMediaComments(
  accessToken: string,
  mediaId: string
): Promise<InstagramComment[]> {
  return [
    {
      id: `comment_${mediaId}_1`,
      text: "Great post!",
      username: "user1",
      timestamp: new Date().toISOString(),
    },
    {
      id: `comment_${mediaId}_2`,
      text: "Love this content",
      username: "user2",
      timestamp: new Date().toISOString(),
    },
  ];
}

async function replyToComment(
  accessToken: string,
  commentId: string,
  message: string
): Promise<boolean> {
  console.log(`Replying to comment ${commentId}: ${message}`);
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

  let analytics = await InstaAnalytics.findOne({
    accountId: accountId,
    date: today,
  });

  if (!analytics) {
    analytics = new InstaAnalytics({
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

async function processComment(
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

// Main server action
export async function processAllAccountComments(): Promise<void> {
  try {
    await connectToDatabase();

    const activeAccounts = await InstagramAccount.find({ isActive: true });

    for (const account of activeAccounts) {
      const accessToken = "mock_access_token";

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
