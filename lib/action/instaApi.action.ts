// lib/action/instaApi.action.ts
"use server";

import { connectToDatabase } from "../database/mongoose";
import InstagramAccount from "../database/models/insta/InstagramAccount.model";
import InstaReplyLog from "../database/models/insta/ReplyLog.model";
import InstaReplyTemplate, {
  IReplyTemplate,
} from "../database/models/insta/ReplyTemplate.model";
import { getUserById } from "./user.actions";
import User from "../database/models/user.model";

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

// Instagram API Functions
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

// Check if user follows the account
async function checkFollowRelationship(
  accessToken: string,
  targetUserId: string,
  commenterUserId: string
): Promise<FollowRelationship> {
  try {
    // First, get the business account ID (our account)
    const businessAccountResponse = await fetch(
      `https://graph.instagram.com/v23.0/me?fields=id,username&access_token=${accessToken}`
    );

    if (!businessAccountResponse.ok) {
      throw new Error("Failed to fetch business account info");
    }

    const businessAccount = await businessAccountResponse.json();
    const businessAccountId = businessAccount.id;

    // Check if commenter follows our business account
    const followCheckResponse = await fetch(
      `https://graph.instagram.com/v23.0/${commenterUserId}?fields=follows&access_token=${accessToken}`
    );

    let follows = false;
    if (followCheckResponse.ok) {
      const followData = await followCheckResponse.json();
      follows =
        followData.follows?.data?.some(
          (follow: any) => follow.id === businessAccountId
        ) || false;
    }

    return {
      follows,
      followed_by: false,
    };
  } catch (error) {
    console.error("Error checking follow relationship:", error);
    return { follows: false, followed_by: false };
  }
}

// Follow user automatically
async function followUserAutomatically(
  accessToken: string,
  targetUserId: string
): Promise<boolean> {
  try {
    console.log(`Attempting to follow user ID: ${targetUserId}`);
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/follows`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          target_user_id: targetUserId,
        }),
      }
    );
    console.log(`Follow response status: ${response.status}`);
    if (!response.ok) {
      const error = await response.json();
      console.error("Instagram Follow Error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to follow user:", error);
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

// Send initial DM with follow button
async function sendFollowRequestDM(
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
                text: `Seems like you don't follow @${targetUsername} yet! Please follow to get your special link. Click the button below to follow automatically.`,
                buttons: [
                  {
                    type: "postback",
                    title: "Follow & Get Link",
                    payload: `FOLLOW_${targetUsername}`,
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
    console.error("Failed to send follow request DM:", error);
    return false;
  }
}

// Send link DM after follow
async function sendLinkDM(
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
      buttonTitle = "Get Your Link",
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
                text: `Thank you for following! ${text}`,
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
    console.error("Failed to send link DM:", error);
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

// Handle postback (follow button click)
export async function handlePostback(
  accountId: string,
  userId: string,
  recipientId: string,
  payload: string
): Promise<void> {
  try {
    await connectToDatabase();

    if (payload.startsWith("FOLLOW_")) {
      const targetUsername = payload.replace("FOLLOW_", "");

      const account = await InstagramAccount.findOne({
        instagramId: accountId,
      });
      if (!account) return;

      // Follow the user automatically
      const followSuccess = await followUserAutomatically(
        account.accessToken,
        recipientId
      );

      if (followSuccess) {
        // Wait a moment for follow to process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Get templates to send the link
        const templates = await InstaReplyTemplate.find({
          userId,
          accountId,
          isActive: true,
        }).sort({ priority: 1 });

        if (templates.length > 0) {
          // Send the link DM
          await sendLinkDM(
            account.instagramId,
            account.accessToken,
            recipientId,
            templates[0].content
          );
        }

        // Log the follow action
        await InstaReplyLog.create({
          userId,
          accountId,
          commentId: `postback_${Date.now()}`,
          commentText: `Follow postback: ${payload}`,
          replyText: "Followed and link sent",
          success: true,
          responseTime: 0,
          mediaId: "postback",
          commenterUsername: recipientId,
          followStatus: "followed_via_button",
          dmSent: true,
        });
      }
    }
  } catch (error) {
    console.error("Error handling postback:", error);
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
  let followStatus: FollowRelationship | null = null;

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

    // Check follow relationship
    try {
      followStatus = await checkFollowRelationship(
        account.accessToken,
        accountId,
        comment.user_id
      );
    } catch (error) {
      console.error("Error checking follow status:", error);
      followStatus = { follows: false, followed_by: false };
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

    // Process based on follow status
    try {
      if (followStatus?.follows) {
        // User follows - send link directly
        dmMessage = await sendLinkDM(
          account.instagramId,
          account.accessToken,
          comment.id,
          matchingTemplate.content
        );
      } else {
        // User doesn't follow - send follow request first
        dmMessage = await sendFollowRequestDM(
          account.instagramId,
          account.accessToken,
          comment.id,
          account.username
        );
      }

      // Always reply to comment
      if (dmMessage) {
        let replyMessages = matchingTemplate.reply;

        if (!followStatus?.follows) {
          // Custom reply for non-followers
          replyMessages = [
            "Thanks for your comment! I've sent you a DM with instructions to get your link. Please check your messages! 📩",
            "Awesome comment! Check your DMs - I've sent you the next steps to get your special link. 💌",
            "Thank you for engaging! Please check your direct messages for instructions. 🔗",
          ];
        }

        success = await replyToComment(
          account.username,
          account.instagramId,
          account.accessToken,
          comment.id,
          comment.media_id,
          replyMessages
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
      followStatus: followStatus?.follows ? "following" : "not_following",
      dmSent: dmMessage,
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
      if (!entry.changes?.length && !entry.messaging?.length) continue;
      if (entry.changes.length > 0) {
        for (const change of entry.changes) {
          // Handle comment changes
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
              instagramId: entry.id,
            });

            if (!account) {
              console.warn(`Account not found: ${entry.id}`);
              continue;
            }
            if (account.instagramId === comment.user_id) {
              continue;
            }

            await processComment(account.instagramId, account.userId, comment);
          }
        }
      }
      if (entry.messaging.length > 0) {
        for (const messageEvent of entry.messaging) {
          if (messageEvent.postback && messageEvent.postback.payload) {
            const account = await InstagramAccount.findOne({
              instagramId: entry.id,
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
