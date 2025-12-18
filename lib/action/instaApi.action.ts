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
import { RateLimiterService } from "../services/rateLimiter";
import { QueueService } from "../services/queue";

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

// Rate Limiter Constants
const RATE_LIMIT_MAX_REQUESTS = 180;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_BLOCK_THRESHOLD = 170;
const RATE_LIMIT_BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

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
async function sendInitialAccessDM(
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
async function sendFollowReminderDM(
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
                text: `I noticed you have not followed us yet . It would mean a lot if you visit our profile and hit follow, then tap "I am following" to unlock your link!`,
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
async function sendFinalLinkDM(
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

async function replyToComment(
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

async function validateAccessToken(accessToken: string): Promise<boolean> {
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

// Handle postback (button clicks) with queue integration
export async function handlePostback(
  accountId: string,
  userId: string,
  recipientId: string,
  payload: string
): Promise<void> {
  try {
    await connectToDatabase();

    const account = await InstagramAccount.findOne({ instagramId: accountId });
    if (!account) {
      console.error("Account not found for postback");
      return;
    }

    // Check user's reply limit first
    const userInfo = await getUserById(userId);
    if (!userInfo) {
      console.error("User not found for postback");
      return;
    }

    if (userInfo.totalReplies >= userInfo.replyLimit) {
      console.warn(
        `Account ${accountId} has reached its reply limit (${userInfo.totalReplies}/${userInfo.replyLimit})`
      );
      return;
    }

    // Check rate limit before processing
    const rateStatus = await RateLimiterService.getAccountStatus(accountId);
    await updateAccountRateLimitInfo(accountId, rateStatus);

    // Handle CHECK_FOLLOW - when user clicks "Send me the access"
    if (payload.startsWith("CHECK_FOLLOW_")) {
      const targetTemplate = payload.replace("CHECK_FOLLOW_", "");

      const templates = await InstaReplyTemplate.find({
        mediaId: targetTemplate,
        isActive: true,
      }).sort({ priority: 1 });

      if (templates.length === 0) {
        console.error("No active templates found for postback");
        return;
      }

      if (templates[0].isFollow === false) {
        // Directly send link if no follow required - enqueue DM with high priority
        await QueueService.enqueue(
          accountId,
          userId,
          "DM",
          {
            dmType: "FINAL_LINK",
            accessToken: account.accessToken,
            recipientId: recipientId,
            content: templates[0].content,
          },
          1, // High priority for user-initiated actions
          {
            recipientId,
            templateId: templates[0]._id?.toString(),
            action: "CHECK_FOLLOW_DIRECT",
          }
        );
        return;
      }

      // First, check if user follows
      const followCheckResult = await QueueService.enqueue(
        accountId,
        userId,
        "FOLLOW_CHECK",
        {
          igScopedUserId: recipientId,
          pageAccessToken: account.accessToken,
        },
        1, // High priority
        {
          recipientId,
          templateId: templates[0]._id?.toString(),
          action: "CHECK_FOLLOW_VERIFY",
        }
      );

      if (followCheckResult.queued) {
        // After follow check completes, we need to handle the result
        // In a real implementation, you would set up a webhook or callback
        // For now, we'll simulate with a timeout
        setTimeout(async () => {
          try {
            const followStatus = await checkFollowRelationshipDBFirst(
              recipientId,
              account.accessToken
            );

            if (followStatus.is_user_follow_business) {
              // User follows - send final link
              await QueueService.enqueue(
                accountId,
                userId,
                "DM",
                {
                  dmType: "FINAL_LINK",
                  accessToken: account.accessToken,
                  recipientId: recipientId,
                  content: templates[0].content,
                },
                1,
                {
                  recipientId,
                  templateId: templates[0]._id?.toString(),
                  action: "CHECK_FOLLOW_SUCCESS",
                }
              );
            } else {
              // User doesn't follow - send follow reminder
              await QueueService.enqueue(
                accountId,
                userId,
                "DM",
                {
                  dmType: "FOLLOW_REMINDER",
                  accessToken: account.accessToken,
                  recipientId: recipientId,
                  targetUsername: account.username,
                  targetTemplate: targetTemplate,
                },
                1,
                {
                  recipientId,
                  templateId: templates[0]._id?.toString(),
                  action: "CHECK_FOLLOW_REMINDER",
                }
              );
            }
          } catch (error) {
            console.error("Error processing follow check result:", error);
          }
        }, 2000);
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
        return;
      }

      // Enqueue follow verification
      const verifyResult = await QueueService.enqueue(
        accountId,
        userId,
        "FOLLOW_CHECK",
        {
          igScopedUserId: recipientId,
          pageAccessToken: account.accessToken,
        },
        1,
        {
          recipientId,
          templateId: templates[0]._id?.toString(),
          action: "VERIFY_FOLLOW",
        }
      );

      if (verifyResult.queued) {
        setTimeout(async () => {
          try {
            const followStatus = await checkFollowRelationshipDBFirst(
              recipientId,
              account.accessToken
            );

            if (followStatus.is_user_follow_business) {
              // User is now following - send final link
              await QueueService.enqueue(
                accountId,
                userId,
                "DM",
                {
                  dmType: "FINAL_LINK",
                  accessToken: account.accessToken,
                  recipientId: recipientId,
                  content: templates[0].content,
                },
                1,
                {
                  recipientId,
                  templateId: templates[0]._id?.toString(),
                  action: "VERIFY_FOLLOW_SUCCESS",
                }
              );
            } else {
              // User still not following - send reminder again
              await QueueService.enqueue(
                accountId,
                userId,
                "DM",
                {
                  dmType: "FOLLOW_REMINDER",
                  accessToken: account.accessToken,
                  recipientId: recipientId,
                  targetUsername: account.username,
                  targetTemplate: targetTemplate,
                },
                1,
                {
                  recipientId,
                  templateId: templates[0]._id?.toString(),
                  action: "VERIFY_FOLLOW_REMINDER",
                }
              );
            }
          } catch (error) {
            console.error("Error processing verify follow result:", error);
          }
        }, 2000);
      }
    }

    // Update user's reply count for this postback action
    await User.findByIdAndUpdate(userInfo._id, { $inc: { totalReplies: 1 } });
  } catch (error) {
    console.error("Error handling postback:", error);
    return;
  }
}

// Core Comment Processing with Queue Integration
export async function processComment(
  accountId: string,
  userId: string,
  comment: InstagramComment
): Promise<void> {
  let success;
  let dmMessage = false;
  let responseTime = 0;
  let matchingTemplate: IReplyTemplate | null = null;

  try {
    await connectToDatabase();

    // Check duplicate processing
    const existingLog = await InstaReplyLog.findOne({ commentId: comment.id });
    if (existingLog) return;

    const account = await InstagramAccount.findOne({ instagramId: accountId });
    if (!account || !account.isActive) return;

    const userInfo = await getUserById(userId);
    if (!userInfo) return;

    if (userInfo.totalReplies >= userInfo.replyLimit) {
      console.warn(
        `Account ${accountId} has reached its reply limit (${userInfo.totalReplies}/${userInfo.replyLimit})`
      );
      return;
    }

    // Validate access token
    const isValidToken = await validateAccessToken(account.accessToken);
    if (!isValidToken) {
      account.isActive = false;
      await account.save();
      return;
    }

    // Find matching template
    const templates = await InstaReplyTemplate.find({
      userId,
      accountId,
      mediaId: comment.media_id,
      isActive: true,
    }).sort({ priority: 1 });

    matchingTemplate = await findMatchingTemplate(comment.text, templates);
    if (!matchingTemplate) return;

    const startTime = Date.now();

    // Check rate limit status before processing
    const rateStatus = await RateLimiterService.getAccountStatus(accountId);
    await updateAccountRateLimitInfo(accountId, rateStatus);

    if (rateStatus.isBlocked) {
      console.warn(
        `Account ${accountId} is blocked until ${rateStatus.blockedUntil}. Comment queued.`
      );
    }

    // Enqueue DM sending with medium priority (2) for comments
    const dmResult = await QueueService.enqueue(
      accountId,
      userId,
      "DM",
      {
        dmType: "INITIAL",
        accessToken: account.accessToken,
        recipientId: comment.id,
        targetUsername: account.username,
        templateMediaId: matchingTemplate.mediaId,
        openDm: matchingTemplate.openDm,
      },
      2, // Medium priority for automated comments
      {
        commentId: comment.id,
        mediaId: comment.media_id,
        templateId: matchingTemplate._id?.toString(),
        commenterUsername: comment.username,
        action: "COMMENT_INITIAL_DM",
        rateLimitStatus: {
          calls: rateStatus.calls,
          remaining: rateStatus.remaining,
          isBlocked: rateStatus.isBlocked,
          blockedUntil: rateStatus.blockedUntil,
        },
      }
    );

    if (dmResult.queued) {
      dmMessage = true;

      // Enqueue comment reply with same priority
      const replyResult = await QueueService.enqueue(
        accountId,
        userId,
        "COMMENT",
        {
          username: account.username,
          accessToken: account.accessToken,
          commentId: comment.id,
          mediaId: comment.media_id,
          message: matchingTemplate.reply,
        },
        2,
        {
          commentId: comment.id,
          mediaId: comment.media_id,
          templateId: matchingTemplate._id?.toString(),
          commenterUsername: comment.username,
          action: "COMMENT_REPLY",
          rateLimitStatus: {
            calls: rateStatus.calls,
            remaining: rateStatus.remaining,
            isBlocked: rateStatus.isBlocked,
            blockedUntil: rateStatus.blockedUntil,
          },
        }
      );

      success = replyResult.queued;
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
      replyText: success ? "Queued for processing" : "Failed to queue",
      success: !!success,
      responseTime,
      mediaId: comment.media_id,
      commenterUsername: comment.username,
      metadata: {
        queueId: dmResult.queueId,
        scheduledFor: dmResult.scheduledFor,
        delayMs: dmResult.delayMs,
        rateLimitStatus: {
          calls: rateStatus.calls,
          remaining: rateStatus.remaining,
          isBlocked: rateStatus.isBlocked,
          blockedUntil: rateStatus.blockedUntil,
        },
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

    // Update account activity and reply count
    await InstagramAccount.findByIdAndUpdate(account._id, {
      $inc: { accountReply: 1 },
      $set: {
        lastActivity: new Date(),
        "rateLimitInfo.calls": rateStatus.calls,
        "rateLimitInfo.remaining": rateStatus.remaining,
        "rateLimitInfo.isBlocked": rateStatus.isBlocked,
        "rateLimitInfo.blockedUntil": rateStatus.blockedUntil,
        "rateLimitInfo.resetAt": new Date(Date.now() + rateStatus.resetInMs),
        "rateLimitInfo.lastUpdated": new Date(),
      },
    });
  } catch (error) {
    console.error("Error processing comment:", error);
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

  const rateStatus = await RateLimiterService.getAccountStatus(accountId);
  const queueStats = await QueueService.getStats(accountId);

  const account = await InstagramAccount.findOne({ instagramId: accountId });

  return {
    calls: rateStatus.calls,
    remaining: rateStatus.remaining,
    isBlocked: rateStatus.isBlocked,
    blockedUntil: rateStatus.blockedUntil,
    resetAt: account?.rateLimitInfo?.resetAt,
    windowStart: rateStatus.windowStart,
    queueStats,
  };
}

// Reset account rate limit
export async function resetAccountRateLimit(
  accountId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDatabase();

    await RateLimiterService.resetAccount(accountId);

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

  const topUsers = await RateLimiterService.getTopUsers(10);
  const queueStats = await QueueService.getStats();

  return {
    totalAccounts,
    blockedAccounts,
    nearLimitAccounts,
    totalCallsToday,
    topUsers,
    queueStats,
  };
}

// Enhanced Webhook Handler to handle postbacks
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

    return { success: true, message: "Webhook processed" };
  } catch (error) {
    console.error("Webhook processing error:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}

// Clean up old queue items
export async function cleanupOldQueueItems(
  days: number = 7
): Promise<{ success: boolean; deletedCount: number }> {
  try {
    const deletedCount = await QueueService.cleanupOldItems(days);
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

// Export helper functions for direct use if needed
export {
  sendInitialAccessDM,
  sendFollowReminderDM,
  sendFinalLinkDM,
  replyToComment,
  validateAccessToken,
};
