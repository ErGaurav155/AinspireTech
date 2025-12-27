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
  queueCall,
  canMakeCall,
  recordCall,
} from "@/lib/services/hourlyRateLimiter";
import RateLimitQueue from "../database/models/Rate/RateLimitQueue.model";

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

// Rate Limiter (for Meta API calls per account)
const rateLimiterRequests = new Map<string, number[]>();
const RATE_LIMIT_MAX_REQUESTS = 180;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function canMakeMetaRequest(accountId: string): boolean {
  const now = Date.now();
  const requests = rateLimiterRequests.get(accountId) || [];
  const validRequests = requests.filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS
  );

  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  rateLimiterRequests.set(accountId, [...validRequests, now]);
  return true;
}

function getRemainingMetaRequests(accountId: string): number {
  const now = Date.now();
  const requests = rateLimiterRequests.get(accountId) || [];
  const validRequests = requests.filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS
  );
  return Math.max(0, RATE_LIMIT_MAX_REQUESTS - validRequests.length);
}

function isMeaningfulComment(text: string): boolean {
  const cleanedText = text.replace(/\s+/g, "").replace(/[^\w]/g, "");
  const emojiOnly = /^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]+$/u.test(text);
  const isGifComment =
    text.includes("sent a GIF") || text.includes("GIF") || text.match(/gif/i);

  return cleanedText.length > 0 && !emojiOnly && !isGifComment;
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

// Send initial DM with access button
async function sendInitialAccessDM(
  accountId: string,
  accessToken: string,
  recipientId: string,
  targetUsername: string,
  templateMediaId: string
): Promise<boolean> {
  try {
    // Check Meta API rate limit for this account
    if (!canMakeMetaRequest(accountId)) {
      console.warn(`Meta API rate limit reached for account ${accountId}`);
      return false;
    }

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
                text: "Hey thanks a ton for the comment! 😊 Now simply tap below and I will send you the access right now!",
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
    // Check Meta API rate limit for this account
    if (!canMakeMetaRequest(accountId)) {
      console.warn(`Meta API rate limit reached for account ${accountId}`);
      return false;
    }

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
    // Check Meta API rate limit for this account
    if (!canMakeMetaRequest(accountId)) {
      console.warn(`Meta API rate limit reached for account ${accountId}`);
      return false;
    }

    // choose a random content item
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
    // Check Meta API rate limit for this account
    if (!canMakeMetaRequest(accountId)) {
      console.warn(`Meta API rate limit reached for account ${accountId}`);
      return false;
    }

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

// AI Template Matching
async function findMatchingTemplate(
  commentText: string,
  templates: IReplyTemplate[]
): Promise<IReplyTemplate | null> {
  const lowerComment = commentText.toLowerCase();

  // Database trigger matching
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

// Handle postback (button clicks)
export async function handlePostback(
  accountId: string,
  userId: string,
  recipientId: string,
  payload: string
): Promise<{ success: boolean; queued?: boolean; message?: string }> {
  try {
    await connectToDatabase();

    const account = await InstagramAccount.findOne({ instagramId: accountId });
    if (!account) {
      console.error("Account not found for postback");
      return { success: false, message: "Account not found" };
    }

    // Handle CHECK_FOLLOW - when user clicks "Send me the access"
    if (payload.startsWith("CHECK_FOLLOW_")) {
      const targetTemplate = payload.replace("CHECK_FOLLOW_", "");
      // Get templates for this user/account
      const templates = await InstaReplyTemplate.find({
        mediaId: targetTemplate,
        isActive: true,
      }).sort({ priority: 1 });

      if (templates.length === 0) {
        console.error("No active templates found for postback");
        return { success: false, message: "No active templates found" };
      }

      if (templates[0].isFollow === false) {
        // Record the call
        const recordResult = await recordCall(
          userId,
          account.instagramId,
          "dm",
          {
            accountId,
            recipientId,
            payload,
            action: "postback",
          },
          1
        );

        if (!recordResult.success && recordResult.queued) {
          return {
            success: false,
            queued: true,
            message: `Postback queued. Queue ID: ${recordResult.queueId}`,
          };
        }
        // Directly send link if no follow required
        const dmSent = await sendFinalLinkDM(
          account.instagramId,
          account.accessToken,
          recipientId,
          templates[0].content
        );

        return {
          success: dmSent,
          message: dmSent ? "Link sent successfully" : "Failed to send link",
        };
      }
      // Record the call
      const recordResult = await recordCall(
        userId,
        account.instagramId,
        "dm",
        {
          accountId,
          recipientId,
          payload,
          action: "postback",
        },
        2
      );

      if (!recordResult.success && recordResult.queued) {
        return {
          success: false,
          queued: true,
          message: `Postback queued. Queue ID: ${recordResult.queueId}`,
        };
      }
      // Check if user follows - DB-first method
      const followStatus = await checkFollowRelationshipDBFirst(
        recipientId,
        account.accessToken
      );

      if (followStatus.is_user_follow_business) {
        // User follows - send link directly
        const dmSent = await sendFinalLinkDM(
          account.instagramId,
          account.accessToken,
          recipientId,
          templates[0].content
        );

        return {
          success: dmSent,
          message: dmSent ? "Link sent to follower" : "Failed to send link",
        };
      } else {
        // User doesn't follow - send follow reminder
        const dmSent = await sendFollowReminderDM(
          account.instagramId,
          account.accessToken,
          recipientId,
          account.username,
          targetTemplate
        );

        return {
          success: dmSent,
          message: dmSent
            ? "Follow reminder sent"
            : "Failed to send follow reminder",
        };
      }
    }

    // Handle VERIFY_FOLLOW - when user clicks "I am following"
    else if (payload.startsWith("VERIFY_FOLLOW_")) {
      const targetTemplate = payload.replace("VERIFY_FOLLOW_", "");
      // Get templates for this user/account
      const templates = await InstaReplyTemplate.find({
        mediaId: targetTemplate,
        isActive: true,
      }).sort({ priority: 1 });

      if (templates.length === 0) {
        console.error("No active templates found for postback");
        return { success: false, message: "No active templates found" };
      }
      // Record the call
      const recordResult = await recordCall(
        userId,
        account.instagramId,
        "dm",
        {
          accountId,
          recipientId,
          payload,
          action: "postback",
        },
        2
      );

      if (!recordResult.success && recordResult.queued) {
        return {
          success: false,
          queued: true,
          message: `Postback queued. Queue ID: ${recordResult.queueId}`,
        };
      }

      // Verify if user actually followed (DB-first)
      const followStatus = await checkFollowRelationshipDBFirst(
        recipientId,
        account.accessToken
      );

      if (followStatus.is_user_follow_business) {
        // User is now following - send the link
        const dmSent = await sendFinalLinkDM(
          account.instagramId,
          account.accessToken,
          recipientId,
          templates[0].content
        );

        return {
          success: dmSent,
          message: dmSent
            ? "Link sent after follow verification"
            : "Failed to send link",
        };
      } else {
        // User still not following - send reminder again
        const dmSent = await sendFollowReminderDM(
          account.instagramId,
          account.accessToken,
          recipientId,
          account.username,
          targetTemplate
        );

        return {
          success: dmSent,
          message: dmSent
            ? "Follow reminder sent again"
            : "Failed to send follow reminder",
        };
      }
    }

    return { success: true, message: "Postback handled successfully" };
  } catch (error) {
    console.error("Error handling postback:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error in postback",
    };
  }
}

// Core Comment Processing
export async function processComment(
  accountId: string,
  userId: string,
  comment: InstagramComment
): Promise<{ success: boolean; queued?: boolean; message?: string }> {
  let success: string | boolean = false;
  let dmMessage = false;
  let responseTime = 0;
  let matchingTemplate: IReplyTemplate | null = null;

  try {
    await connectToDatabase();

    // Check duplicate processing
    const existingLog = await InstaReplyLog.findOne({ commentId: comment.id });
    if (existingLog) {
      return { success: false, message: "Comment already processed" };
    }

    const account = await InstagramAccount.findOne({ instagramId: accountId });
    if (!account || !account.isActive) {
      return { success: false, message: "Account not found or not active" };
    }

    const userInfo = await getUserById(userId);
    if (!userInfo) {
      return { success: false, message: "User not found" };
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
      return { success: false, message: "No matching template found" };
    }

    // In the processComment function, update the rate limiting section:

    // Check rate limit before proceeding
    const rateLimitResult = await recordCall(
      userId,
      account.instagramId,
      "comment_reply",
      {
        comment,
        template: matchingTemplate,
        metadata: {
          commentId: comment.id,
          mediaId: comment.media_id,
          userId: comment.user_id,
          username: comment.username,
        },
      },
      2
    );

    if (!rateLimitResult.success) {
      if (rateLimitResult.queued) {
        console.log(
          `Comment queued due to ${rateLimitResult.reason}: ${comment.id}`
        );

        // Log reason for queueing
        if (rateLimitResult.reason === "app_limit_reached") {
          console.warn(
            `App limit reached! Global automation paused until next window.`
          );
        } else if (rateLimitResult.reason === "user_limit_reached") {
          console.warn(`User ${userId} reached tier limit. Automation paused.`);
        }

        return {
          success: false,
          queued: true,
          message: `Rate limit reached (${rateLimitResult.reason}), comment queued`,
        };
      }
      return { success: false, message: "Rate limit check failed" };
    }
    const startTime = Date.now();

    // Process comment - send initial DM to everyone
    try {
      // Send initial DM with access button to everyone
      dmMessage = await sendInitialAccessDM(
        account.instagramId,
        account.accessToken,
        comment.id,
        account.username,
        matchingTemplate.mediaId
      );

      // Always reply to comment
      if (dmMessage) {
        success = await replyToComment(
          account.username,
          account.instagramId,
          account.accessToken,
          comment.id,
          comment.media_id,
          matchingTemplate.reply
        );
      }
    } catch (error) {
      console.error(`Error processing comment:`, error);
    }

    responseTime = Date.now() - startTime;

    // Create reply log
    await InstaReplyLog.create({
      userId,
      accountId,
      templateId: matchingTemplate._id,
      templateName: matchingTemplate.name,
      commentId: comment.id,
      commentText: comment.text,
      replyText: success,
      success: !!success,
      responseTime,
      mediaId: comment.media_id,
      commenterUsername: comment.username,
      createdAt: new Date(),
    });

    // Update template usage
    if (matchingTemplate._id) {
      await InstaReplyTemplate.findByIdAndUpdate(matchingTemplate._id, {
        $inc: { usageCount: 1 },
        $set: { lastUsed: new Date() },
      });
    }

    // Update account activity
    account.lastActivity = new Date();
    account.accountReply = (account.accountReply || 0) + 1;
    await account.save();

    return {
      success: !!success,
      message: success
        ? "Comment processed successfully"
        : "Failed to process comment",
    };
  } catch (error) {
    console.error("Error processing comment:", error);

    // If we have a matching template but failed, queue it for retry
    if (matchingTemplate) {
      try {
        const queueId = await queueCall(
          userId,
          accountId,
          "comment_reply",
          {
            comment,
            template: matchingTemplate,
            error: error instanceof Error ? error.message : "Unknown error",
            retry: true,
          },
          3 // Higher priority for retries
        );

        return {
          success: false,
          queued: true,
          message: `Processing failed, queued for retry. Queue ID: ${queueId}`,
        };
      } catch (queueError) {
        console.error("Failed to queue failed comment:", queueError);
      }
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error in comment processing",
    };
  }
}

// Enhanced Webhook Handler to handle postbacks
export async function handleInstagramWebhook(
  payload: any
): Promise<{ success: boolean; message: string; queued?: number }> {
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

    let queuedCount = 0;
    let processedCount = 0;
    let errors: string[] = [];

    for (const entry of payload.entry) {
      // Each entry.id is the owner Instagram Business Account ID (ownerIgId)
      const ownerIgId = entry.id;

      // Handle messaging events (postbacks)
      if (entry.messaging && entry.messaging.length > 0) {
        for (const messageEvent of entry.messaging) {
          if (messageEvent.postback && messageEvent.postback.payload) {
            const account = await InstagramAccount.findOne({
              instagramId: ownerIgId,
            });

            if (account) {
              const result = await handlePostback(
                account.instagramId,
                account.userId,
                messageEvent.sender.id,
                messageEvent.postback.payload
              );

              if (result.queued) {
                queuedCount++;
              }

              if (!result.success && !result.queued) {
                errors.push(`Postback failed: ${result.message}`);
              } else if (result.success) {
                processedCount++;
              }
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
              const result = await handlePostback(
                account.instagramId,
                account.userId,
                messageEvent.sender.id,
                messageEvent.message.quick_reply.payload
              );

              if (result.queued) {
                queuedCount++;
              }

              if (!result.success && !result.queued) {
                errors.push(`Quick reply failed: ${result.message}`);
              } else if (result.success) {
                processedCount++;
              }
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
              errors.push(`Account not found: ${ownerIgId}`);
              continue;
            }

            if (account.instagramId === comment.user_id) {
              // comment from owner itself - ignore
              continue;
            }

            const result = await processComment(
              account.instagramId,
              account.userId,
              comment
            );
            if (result.queued) {
              queuedCount++;
            } else if (result.success) {
              processedCount++;
            } else {
              errors.push(`Comment processing failed: ${result.message}`);
            }
          }

          // Handle other change types if needed
          // Example: Handle likes, follows, etc.
        }
      }
    }

    const message = `Webhook processed. Processed: ${processedCount}, Queued: ${queuedCount}${
      errors.length > 0 ? `. Errors: ${errors.length}` : ""
    }`;

    return {
      success: processedCount > 0 || queuedCount > 0,
      message,
      queued: queuedCount,
    };
  } catch (error) {
    console.error("Webhook processing error:", error);
    return {
      success: false,
      message: `Internal server error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Function to manually retry queued items
export async function retryQueuedComment(queueItemId: string): Promise<{
  success: boolean;
  message: string;
  retried?: boolean;
}> {
  try {
    await connectToDatabase();

    const queueItem = await RateLimitQueue.findById(queueItemId);
    if (!queueItem) {
      return { success: false, message: "Queue item not found" };
    }

    if (queueItem.actionType !== "comment_reply") {
      return {
        success: false,
        message: "Only comment_reply items can be retried",
      };
    }

    const { comment, template } = queueItem.actionPayload;
    const account = await InstagramAccount.findOne({
      instagramId: queueItem.instagramAccountId,
    });

    if (!account) {
      return { success: false, message: "Account not found" };
    }

    // Check if we can make the call now
    const rateLimitCheck = await canMakeCall(
      queueItem.clerkId,
      account.instagramId
    );
    if (!rateLimitCheck.allowed) {
      // Update retry count and keep in queue
      await RateLimitQueue.findByIdAndUpdate(queueItemId, {
        retryCount: queueItem.retryCount + 1,
        status:
          queueItem.retryCount + 1 >= queueItem.maxRetries
            ? "failed"
            : "pending",
        errorMessage: `Retry ${queueItem.retryCount + 1}: Still rate limited`,
      });

      return {
        success: false,
        message: "Still rate limited, item remains in queue",
        retried: false,
      };
    }

    // Mark as processing
    await RateLimitQueue.findByIdAndUpdate(queueItemId, {
      status: "processing",
      processingStartedAt: new Date(),
    });

    // Process the comment
    const result = await processComment(
      account.instagramId,
      queueItem.clerkId,
      comment
    );

    if (result.success) {
      // Mark as completed
      await RateLimitQueue.findByIdAndUpdate(queueItemId, {
        status: "completed",
        processingCompletedAt: new Date(),
      });

      return {
        success: true,
        message: "Queued comment retried successfully",
        retried: true,
      };
    } else if (result.queued) {
      // Item got queued again
      return {
        success: false,
        message: "Item re-queued during retry",
        retried: false,
      };
    } else {
      // Mark as failed
      await RateLimitQueue.findByIdAndUpdate(queueItemId, {
        status: "failed",
        errorMessage: result.message,
        retryCount: queueItem.retryCount + 1,
      });

      return {
        success: false,
        message: `Retry failed: ${result.message}`,
        retried: true,
      };
    }
  } catch (error) {
    console.error("Error retrying queued comment:", error);

    return {
      success: false,
      message: `Internal error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Function to get user's queue status
export async function getUserQueueStatus(clerkId: string): Promise<{
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  items: Array<{
    id: string;
    actionType: string;
    status: string;
    createdAt: Date;
    retryCount: number;
    errorMessage?: string;
  }>;
}> {
  try {
    await connectToDatabase();

    const queueItems = await RateLimitQueue.find({ clerkId })
      .sort({ createdAt: -1 })
      .limit(50);

    const stats = {
      total: queueItems.length,
      pending: queueItems.filter((item) => item.status === "pending").length,
      processing: queueItems.filter((item) => item.status === "processing")
        .length,
      completed: queueItems.filter((item) => item.status === "completed")
        .length,
      failed: queueItems.filter((item) => item.status === "failed").length,
      items: queueItems.map((item) => ({
        id: item._id.toString(),
        actionType: item.actionType,
        status: item.status,
        createdAt: item.createdAt,
        retryCount: item.retryCount,
        errorMessage: item.errorMessage,
      })),
    };

    return stats;
  } catch (error) {
    console.error("Error getting user queue status:", error);

    return {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      items: [],
    };
  }
}

// Function to force process a comment (bypass rate limit - for admin only)
export async function forceProcessComment(
  accountId: string,
  userId: string,
  comment: InstagramComment,
  bypassRateLimit: boolean = false
): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDatabase();

    const account = await InstagramAccount.findOne({ instagramId: accountId });
    if (!account) {
      return { success: false, message: "Account not found" };
    }

    // Find matching template
    const templates = await InstaReplyTemplate.find({
      userId,
      accountId,
      mediaId: comment.media_id,
      isActive: true,
    }).sort({ priority: 1 });

    const matchingTemplate = await findMatchingTemplate(
      comment.text,
      templates
    );
    if (!matchingTemplate) {
      return { success: false, message: "No matching template found" };
    }

    if (bypassRateLimit) {
      console.warn(
        `BYPASSING RATE LIMIT for account ${accountId}, comment ${comment.id}`
      );
      // Admin bypass - don't record in rate limit system
    } else {
      // Normal rate limit check
      const rateLimitResult = await recordCall(
        userId,
        account.instagramId,
        "comment_reply",
        {
          comment,
          template: matchingTemplate,
          forced: true,
        },
        1
      );

      if (!rateLimitResult.success && !rateLimitResult.queued) {
        return { success: false, message: "Rate limit check failed" };
      }
    }

    // Process the comment
    const result = await processComment(
      account.instagramId,
      account.userId,
      comment
    );

    return {
      success: result.success,
      message:
        result.message ||
        (result.success
          ? "Forced processing completed"
          : "Forced processing failed"),
    };
  } catch (error) {
    console.error("Error in forceProcessComment:", error);

    return {
      success: false,
      message: `Internal error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
