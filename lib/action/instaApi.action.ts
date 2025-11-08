"use server";

import { connectToDatabase } from "../database/mongoose";
import InstagramAccount from "../database/models/insta/InstagramAccount.model";
import InstaReplyLog from "../database/models/insta/ReplyLog.model";
import InstaReplyTemplate, {
  IReplyTemplate,
} from "../database/models/insta/ReplyTemplate.model";
import { getUserById } from "./user.actions";
import User from "../database/models/user.model";
import Follower from "../database/models/insta/Follower.model";

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
  follows: boolean;
  followed_by: boolean;
}

// Rate Limiter
const rateLimiterRequests = new Map<string, number[]>();
const RATE_LIMIT_MAX_REQUESTS = 180;
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

  rateLimiterRequests.set(accountId, [...validRequests, now]);
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

function isMeaningfulComment(text: string): boolean {
  const cleanedText = text.replace(/\s+/g, "").replace(/[^\w]/g, "");
  const emojiOnly = /^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]+$/u.test(text);
  const isGifComment =
    text.includes("sent a GIF") || text.includes("GIF") || text.match(/gif/i);

  return cleanedText.length > 0 && !emojiOnly && !isGifComment;
}

// ----------------- FOLLOWER HELPERS (NEW) -----------------

/**
 * Upsert follower document when a follow webhook is received.
 * ownerIgId = the IG BUSINESS account that was followed
 * igUserId = the follower's IG ID
 */
async function markFollowerAdded(ownerIgId: string, igUserId: string) {
  try {
    await Follower.updateOne(
      { ownerIgId, igUserId },
      {
        $set: { isFollowing: true, updatedAt: new Date() },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("markFollowerAdded error:", err);
  }
}

/** Mark follower as unfollowed (set flag) */
async function markFollowerRemoved(ownerIgId: string, igUserId: string) {
  try {
    await Follower.updateOne(
      { ownerIgId, igUserId },
      { $set: { isFollowing: false, updatedAt: new Date() } }
    );
  } catch (err) {
    console.error("markFollowerRemoved error:", err);
  }
}

/**
 * Touch follower on comment/interaction:
 * - If record exists, update updatedAt (and optionally keep isFollowing unchanged).
 * - If not exists, create a minimal record with isFollowing:false so we can track engagement,
 *   and let a future follow webhook flip it to true.
 */
async function touchFollowerOnInteraction(ownerIgId: string, igUserId: string) {
  try {
    await Follower.updateOne(
      { ownerIgId, igUserId, isFollowing: { $exists: true } },
      {
        $set: { updatedAt: new Date() },
      },
      { upsert: false }
    );
  } catch (err) {
    console.error("touchFollowerOnInteraction error:", err);
  }
}

/**
 * Local DB-first follower check. If DB says they're following => return true.
 * Otherwise fallback to remote API check (and update DB if remote confirms).
 */
async function checkFollowRelationshipDBFirst(
  ownerIgId: string,
  accessToken: string,
  commenterUserId: string
): Promise<FollowRelationship> {
  try {
    // Ensure DB connected
    await connectToDatabase();

    // Check local DB
    const local = await Follower.findOne({
      ownerIgId,
      igUserId: commenterUserId,
      isFollowing: true,
    }).lean();
    if (local) {
      return { follows: true, followed_by: false };
    }

    return { follows: false, followed_by: false };
  } catch (err) {
    console.error("checkFollowRelationshipDBFirst error:", err);
    return { follows: false, followed_by: false };
  }
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

// // Check if user follows the account - original Graph API fallback (kept for compatibility)
// async function checkFollowRelationship(
//   accessToken: string,
//   targetUserId: string,
//   commenterUserId: string
// ): Promise<FollowRelationship> {
//   try {
//     // Graph API fallback logic.
//     // NOTE: this endpoint and fields are not guaranteed to return follower lists for arbitrary users.
//     // Keep as a fallback only.
//     const businessAccountResponse = await fetch(
//       `https://graph.instagram.com/v23.0/me?fields=id,username&access_token=${accessToken}`
//     );
//     if (!businessAccountResponse.ok) {
//       throw new Error("Failed to fetch business account info");
//     }

//     // Attempt to fetch commenter user data and their "follows" list (best-effort)
//     const followCheckResponse = await fetch(
//       `https://graph.instagram.com/v23.0/${commenterUserId}?fields=follows&access_token=${accessToken}`
//     );

//     let follows = false;
//     if (followCheckResponse.ok) {
//       const followData = await followCheckResponse.json();
//       follows =
//         followData.follows?.data?.some(
//           (follow: any) => follow.id === targetUserId
//         ) || false;
//     }

//     return {
//       follows,
//       followed_by: false,
//     };
//   } catch (error) {
//     console.error(
//       "Error checking follow relationship (Graph fallback):",
//       error
//     );
//     return { follows: false, followed_by: false };
//   }
// }

// Send initial DM with access button
async function sendInitialAccessDM(
  accountId: string,
  accessToken: string,
  recipientId: string,
  targetUsername: string
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
                text: "Hey thanks a ton for the comment! 😊 Now simply tap below and I will send you the access right now!",
                buttons: [
                  {
                    type: "postback",
                    title: "Send me the access",
                    payload: `CHECK_FOLLOW_${targetUsername}`,
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
  targetUsername: string
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
                text: `I noticed you have not followed us yet 😔 It would mean a lot if you visit our profile and hit follow, then tap "I am following" to unlock your link!`,
                buttons: [
                  {
                    type: "web_url",
                    title: "Visit Profile",
                    url: `https://www.instagram.com/${targetUsername}/`,
                    webview_height_ratio: "full",
                  },
                  {
                    type: "postback",
                    title: "I am following ✅",
                    payload: `VERIFY_FOLLOW_${targetUsername}`,
                  },
                ],
              },
            },
          },
        }),
      }
    );
    // logging a bit of response
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
          recipient: { comment_id: recipientId },
          message: {
            attachment: {
              type: "template",
              payload: {
                template_type: "button",
                text: `Awesome! Thanks for following! 🎉 ${text}`,
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
): Promise<void> {
  try {
    await connectToDatabase();
    console.log(`Processing postback: ${payload}`);

    const account = await InstagramAccount.findOne({ instagramId: accountId });
    if (!account) {
      console.error("Account not found for postback");
      return;
    }

    // Get templates for this user/account
    const templates = await InstaReplyTemplate.find({
      userId,
      accountId,
      isActive: true,
    }).sort({ priority: 1 });

    if (templates.length === 0) {
      console.error("No active templates found for postback");
      return;
    }

    // Handle CHECK_FOLLOW - when user clicks "Send me the access"
    if (payload.startsWith("CHECK_FOLLOW_")) {
      const targetUsername = payload.replace("CHECK_FOLLOW_", "");

      // Check if user follows - DB-first method
      const followStatus = await checkFollowRelationshipDBFirst(
        account.instagramId,
        account.accessToken,
        recipientId
      );
      console.log("Follow status:", followStatus);
      if (followStatus.follows) {
        // User follows - send link directly
        await sendFinalLinkDM(
          account.instagramId,
          account.accessToken,
          recipientId,
          templates[0].content
        );

        // Log successful access
        await InstaReplyLog.create({
          userId,
          accountId,
          commentId: `postback_check_${Date.now()}`,
          commentText: `Check follow postback: ${payload}`,
          replyText: "User followed - link sent",
          success: true,
          responseTime: 0,
          mediaId: "postback",
          commenterUsername: recipientId,
          followStatus: "following",
          dmSent: true,
          action: "check_follow_approved",
        });
      } else {
        // User doesn't follow - send follow reminder
        await sendFollowReminderDM(
          account.instagramId,
          account.accessToken,
          recipientId,
          account.username
        );

        // Log follow reminder sent
        await InstaReplyLog.create({
          userId,
          accountId,
          commentId: `postback_reminder_${Date.now()}`,
          commentText: `Follow reminder sent: ${payload}`,
          replyText: "User not following - reminder sent",
          success: true,
          responseTime: 0,
          mediaId: "postback",
          commenterUsername: recipientId,
          followStatus: "not_following",
          dmSent: true,
          action: "follow_reminder_sent",
        });
      }
    }

    // Handle VERIFY_FOLLOW - when user clicks "I am following"
    else if (payload.startsWith("VERIFY_FOLLOW_")) {
      const targetUsername = payload.replace("VERIFY_FOLLOW_", "");

      // Verify if user actually followed (DB-first)
      const followStatus = await checkFollowRelationshipDBFirst(
        account.instagramId,
        account.accessToken,
        recipientId
      );

      if (followStatus.follows) {
        // User is now following - send the link
        await sendFinalLinkDM(
          account.instagramId,
          account.accessToken,
          recipientId,
          templates[0].content
        );

        // Log successful follow verification
        await InstaReplyLog.create({
          userId,
          accountId,
          commentId: `postback_verify_${Date.now()}`,
          commentText: `Verify follow postback: ${payload}`,
          replyText: "Follow verified - link sent",
          success: true,
          responseTime: 0,
          mediaId: "postback",
          commenterUsername: recipientId,
          followStatus: "verified_following",
          dmSent: true,
          action: "follow_verified_approved",
        });
      } else {
        // User still not following - send reminder again
        await sendFollowReminderDM(
          account.instagramId,
          account.accessToken,
          recipientId,
          account.username
        );

        // Log follow verification failed
        await InstaReplyLog.create({
          userId,
          accountId,
          commentId: `postback_verify_fail_${Date.now()}`,
          commentText: `Follow verification failed: ${payload}`,
          replyText: "User still not following - reminder sent again",
          success: false,
          responseTime: 0,
          mediaId: "postback",
          commenterUsername: recipientId,
          followStatus: "still_not_following",
          dmSent: true,
          action: "follow_verification_failed",
        });
      }
    }
  } catch (error) {
    console.error("Error handling postback:", error);

    // Log postback error
    try {
      await InstaReplyLog.create({
        userId,
        accountId,
        commentId: `postback_error_${Date.now()}`,
        commentText: `Postback error: ${payload}`,
        replyText: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        success: false,
        responseTime: 0,
        mediaId: "postback",
        commenterUsername: recipientId,
        followStatus: "error",
        dmSent: false,
        action: "postback_error",
      });
    } catch (logError) {
      console.error("Failed to log postback error:", logError);
    }
  }
}

// Core Comment Processing
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
      if (account.isActive) {
        account.isActive = false;
        await account.save();
        return;
      }
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

    // TOUCH or UPsert follower interaction record (so we track engaged users)
    // If user is not following yet, we create a record with isFollowing:false so future follow webhook can flip it.
    try {
      if (comment.user_id) {
        await touchFollowerOnInteraction(account.instagramId, comment.user_id);
      }
    } catch (err) {
      console.error("Error touching follower interaction:", err);
    }

    // Process comment - send initial DM to everyone
    try {
      // Send initial DM with access button to everyone
      dmMessage = await sendInitialAccessDM(
        account.instagramId,
        account.accessToken,
        comment.id,
        account.username
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
      followStatus: "initial_dm_sent",
      dmSent: dmMessage,
      action: "initial_comment_processed",
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
    account.lastActivity = new Date();
    account.accountReply = (account.accountReply || 0) + 1;
    await account.save();
  } catch (error) {
    console.error("Error processing comment:", error);
  }
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
      // Each entry.id is the owner Instagram Business Account ID (ownerIgId)
      const ownerIgId = entry.id;

      // Handle messaging events (postbacks)
      if (entry.messaging && entry.messaging.length > 0) {
        console.log("Processing messaging events:", entry.messaging);

        for (const messageEvent of entry.messaging) {
          if (messageEvent.postback && messageEvent.postback.payload) {
            const account = await InstagramAccount.findOne({
              instagramId: ownerIgId,
            });

            if (account) {
              console.log(
                `Handling postback for account ${account.instagramId}`
              );
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
        console.log("Processing comment/follow changes:", entry.changes);

        for (const change of entry.changes) {
          // FOLLOWER CHANGES (NEW)
          if (change.field === "followers") {
            try {
              const verb = change.value?.verb; // "add" or "remove"
              const followerId = change.value?.follower?.id;
              if (!followerId) continue;

              if (verb === "add") {
                // mark follower added for this owner account
                await markFollowerAdded(ownerIgId, followerId);
                console.log(
                  `Follower added recorded owner=${ownerIgId} follower=${followerId}`
                );
              } else if (verb === "remove") {
                await markFollowerRemoved(ownerIgId, followerId);
                console.log(
                  `Follower removed recorded owner=${ownerIgId} follower=${followerId}`
                );
              }
            } catch (err) {
              console.error("Error processing follower change:", err);
            }
          }

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
