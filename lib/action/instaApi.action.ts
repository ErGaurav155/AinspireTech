// app/lib/actions/instaApi.actions.ts
"use server";

import { connectToDatabase } from "../database/mongoose";
import InstagramAccount from "../database/models/insta/InstagramAccount.model";
import InstaReplyLog from "../database/models/insta/ReplyLog.model";
import InstaReplyTemplate, {
  IReplyTemplate,
} from "../database/models/insta/ReplyTemplate.model";
import { getUserById } from "./user.actions";
import User from "../database/models/user.model";
import {
  canMakeCall,
  getCurrentWindowInfo,
} from "../services/hourlyRateLimiter";
import {
  cleanupOldQueueItems,
  enqueueItem,
  getQueueStats,
} from "../services/queue";
import { hybridQueueProcessor } from "../services/hybridQueueProcessor";

// Interfaces
interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  media_id: string;
  user_id: string;
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

interface FollowRelationship {
  is_user_follow_business?: boolean;
}

// Extended metadata interface to include rateLimitStatus
interface ExtendedMetadata {
  commentId?: string;
  mediaId?: string;
  recipientId?: string;
  templateId?: string;
  action?: string;
  commenterUsername?: string;
  rateLimitStatus?: {
    calls: number;
    remaining: number;
    isBlocked: boolean;
    blockedUntil?: Date;
  };
}

// Constants
const RATE_LIMIT_MAX_REQUESTS = 180;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_BLOCK_THRESHOLD = 170;

function isMeaningfulComment(text: string): boolean {
  const cleanedText = text.replace(/\s+/g, "").replace(/[^\w]/g, "");
  const emojiOnly = /^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]+$/u.test(text);
  const isGifComment =
    text.includes("sent a GIF") || text.includes("GIF") || text.match(/gif/i);

  return cleanedText.length > 0 && !emojiOnly && !isGifComment;
}

// ----------------- Instagram API Functions -----------------

export async function getInstagramProfile(
  accessToken: string
): Promise<InstagramProfile> {
  const response = await fetch(
    `https://graph.instagram.com/v23.0/me?fields=id,username,account_type,media_count,followers_count,follows_count,profile_picture_url&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch profile: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function checkFollowRelationshipDBFirst(
  igScopedUserId: string,
  pageAccessToken: string
): Promise<FollowRelationship> {
  const url = `https://graph.instagram.com/v23.0/${igScopedUserId}?fields=is_user_follow_business&access_token=${pageAccessToken}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Instagram user follow status: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data as FollowRelationship;
}

// Send initial DM with access button
export async function sendInitialAccessDM(
  accountId: string,
  accessToken: string,
  recipientId: string,
  targetUsername: string,
  templateMediaId: string,
  openDm: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v23.0/${accountId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipient: { comment_id: recipientId },
          message: {
            attachment: {
              type: "template",
              payload: {
                template_type: "button",
                text: openDm,
                buttons: [
                  {
                    type: "postback",
                    title: "Send me the access",
                    payload: `CHECK_FOLLOW_${templateMediaId}`,
                  },
                ],
              },
            },
          },
        }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.error("Instagram DM Error:", result);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send initial access DM:", error);
    return false;
  }
}

// Send follow reminder DM
export async function sendFollowReminderDM(
  accountId: string,
  accessToken: string,
  recipientId: string,
  targetUsername: string,
  targetTemplate: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v23.0/${accountId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: {
            attachment: {
              type: "template",
              payload: {
                template_type: "button",
                text: `I noticed you have not followed us yet. It would mean a lot if you visit our profile and hit follow, then tap "I am following" to unlock your link!`,
                buttons: [
                  {
                    type: "web_url",
                    title: "Visit Profile",
                    url: `https://www.instagram.com/${targetUsername}/`,
                    webview_height_ratio: "full",
                  },
                  {
                    type: "postback",
                    title: "I am following",
                    payload: `VERIFY_FOLLOW_${targetTemplate}`,
                  },
                ],
              },
            },
          },
        }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.error("Instagram DM Error:", result);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send follow reminder DM:", error);
    return false;
  }
}

// Send final link DM
export async function sendFinalLinkDM(
  accountId: string,
  accessToken: string,
  recipientId: string,
  content: { text: string; link: string; buttonTitle?: string }[]
): Promise<boolean> {
  try {
    const randomNumber = Math.floor(Math.random() * content.length);
    const {
      text,
      link: buttonUrl,
      buttonTitle = "Get Your Access",
    } = content[randomNumber];

    const response = await fetch(
      `https://graph.instagram.com/v23.0/${accountId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: {
            attachment: {
              type: "template",
              payload: {
                template_type: "button",
                text: `Awesome! Thanks for following! ${text}`,
                buttons: [
                  {
                    type: "web_url",
                    url: buttonUrl,
                    title: buttonTitle,
                  },
                ],
              },
            },
          },
        }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.error("Instagram DM Error:", result);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send final link DM:", error);
    return false;
  }
}

export async function replyToComment(
  username: string,
  accountId: string,
  accessToken: string,
  commentId: string,
  mediaId: string,
  message: string[]
): Promise<string | boolean> {
  try {
    // Verify media ownership
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v23.0/${mediaId}?fields=id,username&access_token=${accessToken}`
    );

    if (!mediaResponse.ok) {
      const error = await mediaResponse.json();
      throw new Error(
        `Failed to verify media ownership: ${JSON.stringify(error)}`
      );
    }

    const mediaData = await mediaResponse.json();
    const isOwner = mediaData.username === username;

    if (!isOwner) {
      throw new Error("User is not the owner of this media");
    }

    const ranNumber = Math.floor(Math.random() * message.length);
    const replyMessage = message[ranNumber];

    // Reply to comment
    const replyResponse = await fetch(
      `https://graph.instagram.com/v23.0/${commentId}/replies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: replyMessage,
        }),
      }
    );

    if (!replyResponse.ok) {
      const error = await replyResponse.json();
      console.error("Instagram Reply Error:", error);
      return false;
    }

    return replyMessage;
  } catch (error) {
    console.error("Failed to reply to comment:", error);
    return false;
  }
}

export async function validateAccessToken(
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me?fields=id&access_token=${accessToken}`
    );
    return response.ok;
  } catch (error) {
    return false;
  }
}

// AI Template Matching
async function findMatchingTemplate(
  commentText: string,
  templates: IReplyTemplate[]
): Promise<IReplyTemplate | null> {
  const lowerComment = commentText.toLowerCase();

  for (const template of templates) {
    if (!template.isActive) continue;

    const hasMatch = template.triggers?.some((trigger) => {
      if (!trigger) return false;
      return lowerComment.includes(trigger.toLowerCase().replace(/\s+/g, ""));
    });

    if (!hasMatch) continue;
    return template;
  }
  return null;
}

// Update account rate limit info in database
async function updateAccountRateLimitInfo(
  accountId: string,
  rateLimitStatus: {
    calls: number;
    remaining: number;
    isBlocked: boolean;
    blockedUntil?: Date;
    resetInMs: number;
  }
): Promise<void> {
  await connectToDatabase();

  await InstagramAccount.findOneAndUpdate(
    { instagramId: accountId },
    {
      $set: {
        "rateLimitInfo.calls": rateLimitStatus.calls,
        "rateLimitInfo.remaining": rateLimitStatus.remaining,
        "rateLimitInfo.isBlocked": rateLimitStatus.isBlocked,
        "rateLimitInfo.blockedUntil": rateLimitStatus.blockedUntil,
        "rateLimitInfo.resetAt": new Date(
          Date.now() + rateLimitStatus.resetInMs
        ),
        "rateLimitInfo.lastUpdated": new Date(),
        lastActivity: new Date(),
      },
    }
  );
}

// Helper function to safely add metadata with rateLimitStatus
async function enqueueWithMetadata(
  accountId: string,
  userId: string,
  clerkId: string,
  actionType: "COMMENT" | "DM" | "POSTBACK" | "PROFILE" | "FOLLOW_CHECK",
  payload: any,
  priority: number = 3,
  metadata?: ExtendedMetadata
) {
  // Extract only the known properties for the queue metadata
  const queueMetadata = {
    commentId: metadata?.commentId,
    mediaId: metadata?.mediaId,
    recipientId: metadata?.recipientId,
    templateId: metadata?.templateId,
    action: metadata?.action,
    commenterUsername: metadata?.commenterUsername,
  };

  return await enqueueItem(
    accountId,
    userId,
    clerkId,
    actionType,
    payload,
    priority,
    queueMetadata
  );
}

// Handle postback (button clicks) with queue integration
export async function handlePostback(
  accountId: string,
  userId: string,
  recipientId: string,
  payload: string
): Promise<{
  success: boolean;
  queued: boolean;
  queueInfo?: any;
  reason?: string;
}> {
  try {
    await connectToDatabase();

    const account = await InstagramAccount.findOne({ instagramId: accountId });
    if (!account) {
      return { success: false, queued: false, reason: "Account not found" };
    }

    // Check user's reply limit first
    const userInfo = await getUserById(userId);
    if (!userInfo) {
      return { success: false, queued: false, reason: "User not found" };
    }

    if (userInfo.totalReplies >= userInfo.replyLimit) {
      console.warn(
        `Account ${accountId} has reached its reply limit (${userInfo.totalReplies}/${userInfo.replyLimit})`
      );
      return {
        success: false,
        queued: false,
        reason: "User reply limit reached",
      };
    }

    // Check rate limit before processing
    const rateCheck = await canMakeCall(
      userInfo.clerkId,
      accountId,
      "POSTBACK",
      {
        recipientId,
        payload,
        accountId,
      }
    );

    if (!rateCheck.allowed) {
      // Log the rate limit status
      console.log(`Postback rate limited: ${rateCheck.reason}`);

      // Trigger queue processing check (fallback mechanism)
      const shouldCheckQueue = Math.random() < 0.1; // 10% chance
      if (shouldCheckQueue) {
        await hybridQueueProcessor();
      }

      return {
        success: false,
        queued: rateCheck.shouldQueue,
        queueInfo: rateCheck.queueInfo,
        reason: rateCheck.reason,
      };
    }

    // Handle CHECK_FOLLOW - when user clicks "Send me the access"
    if (payload.startsWith("CHECK_FOLLOW_")) {
      const targetTemplate = payload.replace("CHECK_FOLLOW_", "");

      const templates = await InstaReplyTemplate.find({
        mediaId: targetTemplate,
        isActive: true,
      }).sort({ priority: 1 });

      if (templates.length === 0) {
        console.error("No active templates found for postback");
        return { success: false, queued: false, reason: "No active templates" };
      }

      if (templates[0].isFollow === false) {
        // Directly send link if no follow required
        const dmResult = await sendFinalLinkDM(
          accountId,
          account.accessToken,
          recipientId,
          templates[0].content
        );

        if (dmResult) {
          // Update user reply count
          await User.findByIdAndUpdate(userInfo._id, {
            $inc: { totalReplies: 1 },
          });

          // Trigger queue processing check
          const shouldCheckQueue = Math.random() < 0.1;
          if (shouldCheckQueue) {
            await hybridQueueProcessor();
          }

          return { success: true, queued: false };
        }
        return { success: false, queued: false, reason: "Failed to send DM" };
      }

      // First, check if user follows
      try {
        const followStatus = await checkFollowRelationshipDBFirst(
          recipientId,
          account.accessToken
        );

        if (followStatus.is_user_follow_business) {
          // User follows - send final link
          const dmResult = await sendFinalLinkDM(
            accountId,
            account.accessToken,
            recipientId,
            templates[0].content
          );

          if (dmResult) {
            await User.findByIdAndUpdate(userInfo._id, {
              $inc: { totalReplies: 1 },
            });

            // Trigger queue processing check
            const shouldCheckQueue = Math.random() < 0.1;
            if (shouldCheckQueue) {
              await hybridQueueProcessor();
            }

            return { success: true, queued: false };
          }
        } else {
          // User doesn't follow - send follow reminder
          const reminderResult = await sendFollowReminderDM(
            accountId,
            account.accessToken,
            recipientId,
            account.username,
            targetTemplate
          );

          if (reminderResult) {
            await User.findByIdAndUpdate(userInfo._id, {
              $inc: { totalReplies: 1 },
            });

            // Trigger queue processing check
            const shouldCheckQueue = Math.random() < 0.1;
            if (shouldCheckQueue) {
              await hybridQueueProcessor();
            }

            return { success: true, queued: false };
          }
        }
      } catch (error) {
        console.error("Error checking follow relationship:", error);
        return { success: false, queued: false, reason: "Follow check failed" };
      }
    }

    // Handle VERIFY_FOLLOW - when user clicks "I am following"
    else if (payload.startsWith("VERIFY_FOLLOW_")) {
      const targetTemplate = payload.replace("VERIFY_FOLLOW_", "");

      const templates = await InstaReplyTemplate.find({
        mediaId: targetTemplate,
        isActive: true,
      }).sort({ priority: 1 });

      if (templates.length === 0) {
        console.error("No active templates found for postback");
        return { success: false, queued: false, reason: "No active templates" };
      }

      try {
        const followStatus = await checkFollowRelationshipDBFirst(
          recipientId,
          account.accessToken
        );

        if (followStatus.is_user_follow_business) {
          // User is now following - send final link
          const dmResult = await sendFinalLinkDM(
            accountId,
            account.accessToken,
            recipientId,
            templates[0].content
          );

          if (dmResult) {
            await User.findByIdAndUpdate(userInfo._id, {
              $inc: { totalReplies: 1 },
            });

            // Trigger queue processing check
            const shouldCheckQueue = Math.random() < 0.1;
            if (shouldCheckQueue) {
              await hybridQueueProcessor();
            }

            return { success: true, queued: false };
          }
        } else {
          // User still not following - send reminder again
          const reminderResult = await sendFollowReminderDM(
            accountId,
            account.accessToken,
            recipientId,
            account.username,
            targetTemplate
          );

          if (reminderResult) {
            await User.findByIdAndUpdate(userInfo._id, {
              $inc: { totalReplies: 1 },
            });

            // Trigger queue processing check
            const shouldCheckQueue = Math.random() < 0.1;
            if (shouldCheckQueue) {
              await hybridQueueProcessor();
            }

            return { success: true, queued: false };
          }
        }
      } catch (error) {
        console.error("Error verifying follow relationship:", error);
        return {
          success: false,
          queued: false,
          reason: "Follow verification failed",
        };
      }
    }

    // Update user's reply count for this postback action
    await User.findByIdAndUpdate(userInfo._id, { $inc: { totalReplies: 1 } });

    // Trigger queue processing check (every 10th postback)
    const shouldCheckQueue = Math.random() < 0.1; // 10% chance
    if (shouldCheckQueue) {
      await hybridQueueProcessor();
    }

    return { success: true, queued: false };
  } catch (error) {
    console.error("Error handling postback:", error);
    return {
      success: false,
      queued: false,
      reason: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Core Comment Processing with Queue Integration - COMPLETE VERSION
export async function processComment(
  accountId: string,
  userId: string,
  comment: InstagramComment
): Promise<{
  success: boolean;
  queued: boolean;
  queueInfo?: any;
  reason?: string;
}> {
  let success = false;
  let dmMessage = false;
  let responseTime = 0;
  let matchingTemplate: IReplyTemplate | null = null;

  try {
    await connectToDatabase();

    // Check duplicate processing
    const existingLog = await InstaReplyLog.findOne({ commentId: comment.id });
    if (existingLog) {
      return { success: false, queued: false, reason: "Already processed" };
    }

    const account = await InstagramAccount.findOne({ instagramId: accountId });
    if (!account || !account.isActive) {
      return { success: false, queued: false, reason: "Account not active" };
    }

    const userInfo = await getUserById(userId);
    if (!userInfo) {
      return { success: false, queued: false, reason: "User not found" };
    }

    if (userInfo.totalReplies >= userInfo.replyLimit) {
      console.warn(
        `Account ${accountId} has reached its reply limit (${userInfo.totalReplies}/${userInfo.replyLimit})`
      );
      return {
        success: false,
        queued: false,
        reason: "User reply limit reached",
      };
    }

    // Validate access token
    const isValidToken = await validateAccessToken(account.accessToken);
    if (!isValidToken) {
      account.isActive = false;
      await account.save();
      return { success: false, queued: false, reason: "Invalid token" };
    }

    // Find matching template
    const templates = await InstaReplyTemplate.find({
      userId,
      accountId,
      mediaId: comment.media_id,
      isActive: true,
    }).sort({ priority: 1 });

    matchingTemplate = await findMatchingTemplate(comment.text, templates);
    if (!matchingTemplate) {
      return { success: false, queued: false, reason: "No matching template" };
    }

    const startTime = Date.now();

    // Check rate limit before processing
    const rateCheck = await canMakeCall(
      userInfo.clerkId,
      accountId,
      "COMMENT",
      {
        commentId: comment.id,
        mediaId: comment.media_id,
        templateId: matchingTemplate._id?.toString(),
        commenterUsername: comment.username,
        username: account.username,
        accessToken: account.accessToken,
        message: matchingTemplate.reply,
      }
    );

    if (!rateCheck.allowed) {
      // Log that this was queued
      await InstaReplyLog.create({
        userId,
        accountId,
        templateId: matchingTemplate._id,
        templateName: matchingTemplate.name,
        commentId: comment.id,
        commentText: comment.text,
        replyText: "Queued due to rate limit",
        success: false,
        responseTime: 0,
        mediaId: comment.media_id,
        commenterUsername: comment.username,
        metadata: {
          rateLimitStatus: rateCheck.limits,
          queueInfo: rateCheck.queueInfo,
          templateName: matchingTemplate.name,
        },
      });

      // Trigger queue processing check (fallback mechanism)
      const shouldCheckQueue = Math.random() < 0.1; // 10% chance
      if (shouldCheckQueue) {
        await hybridQueueProcessor();
      }

      return {
        success: false,
        queued: rateCheck.shouldQueue,
        queueInfo: rateCheck.queueInfo,
        reason: rateCheck.reason,
      };
    }

    // Rate limit passed, proceed with actual processing
    // Enqueue DM sending
    const dmResult = await sendInitialAccessDM(
      accountId,
      account.accessToken,
      comment.id,
      account.username,
      matchingTemplate.mediaId,
      matchingTemplate.openDm
    );

    if (dmResult) {
      dmMessage = true;

      // Send comment reply
      const replyResult = await replyToComment(
        account.username,
        accountId,
        account.accessToken,
        comment.id,
        comment.media_id,
        matchingTemplate.reply
      );

      success = !!replyResult;
    }

    responseTime = Date.now() - startTime;

    // Create log entry
    await InstaReplyLog.create({
      userId,
      accountId,
      templateId: matchingTemplate._id,
      templateName: matchingTemplate.name,
      commentId: comment.id,
      commentText: comment.text,
      replyText: success ? "Success" : "Failed",
      success,
      responseTime,
      mediaId: comment.media_id,
      commenterUsername: comment.username,
      metadata: {
        rateLimitStatus: rateCheck.limits,
        dmSent: dmMessage,
        replySuccess: success,
        templateName: matchingTemplate.name,
      },
    });

    // Update template usage
    if (matchingTemplate._id) {
      await InstaReplyTemplate.findByIdAndUpdate(matchingTemplate._id, {
        $inc: { usageCount: 1 },
        $set: { lastUsed: new Date() },
      });
    }

    // Update user reply count
    await User.findByIdAndUpdate(userInfo._id, { $inc: { totalReplies: 1 } });

    // Update account activity
    await InstagramAccount.findByIdAndUpdate(account._id, {
      $inc: { accountReply: 1 },
      $set: {
        lastActivity: new Date(),
        "rateLimitInfo.calls": (account.rateLimitInfo?.calls || 0) + 1,
        "rateLimitInfo.remaining": Math.max(
          0,
          180 - ((account.rateLimitInfo?.calls || 0) + 1)
        ),
        "rateLimitInfo.lastUpdated": new Date(),
      },
    });

    // Trigger queue processing check (every 10th comment)
    const shouldCheckQueue = Math.random() < 0.1; // 10% chance
    if (shouldCheckQueue) {
      await hybridQueueProcessor();
    }

    return {
      success: true,
      queued: false,
    };
  } catch (error) {
    console.error("Error processing comment:", error);

    // Log the error
    if (matchingTemplate) {
      await InstaReplyLog.create({
        userId,
        accountId,
        templateId: matchingTemplate._id,
        templateName: matchingTemplate.name,
        commentId: comment.id,
        commentText: comment.text,
        replyText: "Error occurred",
        success: false,
        responseTime,
        mediaId: comment.media_id,
        commenterUsername: comment.username,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          templateName: matchingTemplate.name,
        },
      });
    }

    return {
      success: false,
      queued: false,
      reason: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get account rate limit status
export async function getAccountRateLimitStatus(accountId: string): Promise<{
  calls: number;
  remaining: number;
  isBlocked: boolean;
  blockedUntil?: Date;
  resetAt?: Date;
  windowStart: Date;
  queueStats: any;
}> {
  await connectToDatabase();

  // Use the new hourly rate limiter
  const { windowLabel } = await getCurrentWindowInfo();

  const account = await InstagramAccount.findOne({ instagramId: accountId });
  const queueStats = await getQueueStats(accountId);

  return {
    calls: account?.rateLimitInfo?.calls || 0,
    remaining: account?.rateLimitInfo?.remaining || 180,
    isBlocked: account?.rateLimitInfo?.isBlocked || false,
    blockedUntil: account?.rateLimitInfo?.blockedUntil,
    resetAt: account?.rateLimitInfo?.resetAt,
    windowStart: account?.rateLimitInfo?.windowStart || new Date(),
    queueStats,
  };
}

// Reset account rate limit
export async function resetAccountRateLimit(
  accountId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDatabase();

    // Also reset in account document
    await InstagramAccount.findOneAndUpdate(
      { instagramId: accountId },
      {
        $set: {
          "rateLimitInfo.calls": 0,
          "rateLimitInfo.remaining": 180,
          "rateLimitInfo.isBlocked": false,
          "rateLimitInfo.blockedUntil": null,
          "rateLimitInfo.resetAt": null,
          "rateLimitInfo.windowStart": new Date(),
          "rateLimitInfo.lastUpdated": new Date(),
        },
      }
    );

    return {
      success: true,
      message: `Rate limit reset for account ${accountId}`,
    };
  } catch (error) {
    console.error("Error resetting rate limit:", error);
    return {
      success: false,
      message: "Failed to reset rate limit",
    };
  }
}

// Get system-wide rate limit statistics
export async function getSystemRateLimitStats(): Promise<{
  totalAccounts: number;
  blockedAccounts: number;
  nearLimitAccounts: number;
  totalCallsToday: number;
  topUsers: Array<{
    userId: string;
    accountId: string;
    totalCalls: number;
    avgCallsPerHour: number;
  }>;
  queueStats: any;
}> {
  await connectToDatabase();

  const totalAccounts = await InstagramAccount.countDocuments({
    isActive: true,
  });

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const blockedAccounts = await InstagramAccount.countDocuments({
    "rateLimitInfo.isBlocked": true,
    "rateLimitInfo.blockedUntil": { $gt: now },
  });

  const nearLimitAccounts = await InstagramAccount.countDocuments({
    "rateLimitInfo.calls": { $gte: RATE_LIMIT_BLOCK_THRESHOLD },
    "rateLimitInfo.windowStart": { $gte: oneHourAgo },
  });

  // Calculate total calls today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const activeAccounts = await InstagramAccount.find({ isActive: true });
  const totalCallsToday = activeAccounts.reduce((sum, account) => {
    if (
      account.rateLimitInfo?.windowStart &&
      account.rateLimitInfo.windowStart >= todayStart
    ) {
      return sum + (account.rateLimitInfo.calls || 0);
    }
    return sum;
  }, 0);

  // Get queue stats
  const queueStats = await getQueueStats();

  // Get top users (simplified version)
  const topUsers = await InstagramAccount.aggregate([
    {
      $match: {
        isActive: true,
        "rateLimitInfo.windowStart": { $gte: oneHourAgo },
      },
    },
    {
      $group: {
        _id: {
          userId: "$userId",
          accountId: "$instagramId",
        },
        totalCalls: { $sum: "$rateLimitInfo.calls" },
      },
    },
    {
      $project: {
        userId: "$_id.userId",
        accountId: "$_id.accountId",
        totalCalls: 1,
        avgCallsPerHour: { $divide: ["$totalCalls", 1] },
      },
    },
    { $sort: { totalCalls: -1 } },
    { $limit: 10 },
  ]);

  return {
    totalAccounts,
    blockedAccounts,
    nearLimitAccounts,
    totalCallsToday,
    topUsers,
    queueStats,
  };
}

// Enhanced Webhook Handler to handle postbacks - COMPLETE VERSION
export async function handleInstagramWebhook(
  payload: any
): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDatabase();

    // Validate payload structure
    if (
      !payload.object ||
      payload.object !== "instagram" ||
      !payload.entry?.length
    ) {
      return { success: false, message: "Invalid payload structure" };
    }

    for (const entry of payload.entry) {
      const ownerIgId = entry.id;

      // Handle messaging events (postbacks)
      if (entry.messaging && entry.messaging.length > 0) {
        for (const messageEvent of entry.messaging) {
          if (messageEvent.postback && messageEvent.postback.payload) {
            const account = await InstagramAccount.findOne({
              instagramId: ownerIgId,
            });

            if (account) {
              await handlePostback(
                account.instagramId,
                account.userId,
                messageEvent.sender.id,
                messageEvent.postback.payload
              );
            }
          }

          // Also handle quick replies if any
          if (
            messageEvent.message &&
            messageEvent.message.quick_reply &&
            messageEvent.message.quick_reply.payload
          ) {
            const account = await InstagramAccount.findOne({
              instagramId: ownerIgId,
            });

            if (account) {
              await handlePostback(
                account.instagramId,
                account.userId,
                messageEvent.sender.id,
                messageEvent.message.quick_reply.payload
              );
            }
          }
        }
      }

      // Handle comment changes
      if (entry.changes && entry.changes.length > 0) {
        for (const change of entry.changes) {
          // COMMENTS
          if (change.field === "comments") {
            const commentData = change.value;

            if (!commentData?.id || !commentData.text) continue;

            const comment: InstagramComment = {
              id: commentData.id,
              text: commentData.text,
              username: commentData.from?.username || "unknown",
              timestamp: commentData.timestamp,
              media_id: commentData.media?.id || "",
              user_id: commentData.from?.id || "",
            };

            // Skip non-meaningful comments
            if (!isMeaningfulComment(comment.text)) {
              continue;
            }

            const account = await InstagramAccount.findOne({
              instagramId: ownerIgId,
            });

            if (!account) {
              console.warn(`Account not found: ${ownerIgId}`);
              continue;
            }
            if (account.instagramId === comment.user_id) {
              // comment from owner itself - ignore
              continue;
            }

            await processComment(account.instagramId, account.userId, comment);
          }
        }
      }
    }

    // Trigger queue processing check after webhook processing
    await hybridQueueProcessor();

    return { success: true, message: "Webhook processed" };
  } catch (error) {
    console.error("Webhook processing error:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}

// Clean up old queue items - FIXED: Properly handles the return type
export async function cleanupQueueItems(
  days: number = 7
): Promise<{ success: boolean; deletedCount: number }> {
  try {
    const deletedCount = await cleanupOldQueueItems(days);
    return {
      success: true,
      deletedCount,
    };
  } catch (error) {
    console.error("Error cleaning up queue items:", error);
    return {
      success: false,
      deletedCount: 0,
    };
  }
}
