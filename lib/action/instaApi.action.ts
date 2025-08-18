// lib/action/instaApi.action.ts
"use server";

import { connectToDatabase } from "../database/mongoose";
import InstagramAccount from "../database/models/insta/InstagramAccount.model";
import InstaReplyLog from "../database/models/insta/ReplyLog.model";
import InstaReplyTemplate, {
  IReplyTemplate,
} from "../database/models/insta/ReplyTemplate.model";
import { generateCommentResponse } from "./ai.action";

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
    `https://graph.instagram.com/v19.0/me?fields=id,username,account_type,media_count,followers_count,follows_count,profile_picture_url&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch profile: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

async function replyToComment(
  username: string,
  accountId: string,
  accessToken: string,
  commentId: string,
  mediaId: string,
  message: string[]
): Promise<boolean> {
  try {
    console.log("username : ", username);
    console.log("accountId : ", accountId);
    console.log("accessToken : ", accessToken);
    console.log("commentId : ", commentId);
    console.log("mediaId : ", mediaId);
    console.log("message : ", message);
    // Verify media ownership
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v23.0/${mediaId}?fields=id,username&access_token=${accessToken}`
    );
    console.log("mediaResponse : ", mediaResponse);

    if (!mediaResponse.ok) {
      const error = await mediaResponse.json();
      throw new Error(
        `Failed to verify media ownership: ${JSON.stringify(error)}`
      );
    }

    const mediaData = await mediaResponse.json();
    console.log("mediaData :", mediaData);
    const isOwner = mediaData.username === username;

    if (!isOwner) {
      throw new Error("User is not the owner of this media");
    }

    const ranNumber = Math.floor(Math.random() * message.length);
    const replyMessage = message[ranNumber];
    console.log("ranNumber:", ranNumber);
    console.log("message:", message[ranNumber]);

    // Reply to comment
    const replyResponse = await fetch(
      `https://graph.instagram.com/v23.0/${commentId}/replies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ replyMessage }),
      }
    );

    console.log("replyResponse : ", replyResponse);

    if (!replyResponse.ok) {
      const error = await replyResponse.json();
      console.error("Instagram Reply Error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to reply to comment:", error);
    return false;
  }
}

async function sendDirectMessage(
  accountId: string,
  accessToken: string,
  commentId: string,
  message: string[]
): Promise<boolean> {
  try {
    console.log("accountId : ", accountId);
    console.log("accessToken : ", accessToken);
    console.log("recipientId : ", commentId);
    console.log("message : ", message);

    const sendResponse = await fetch(
      `https://graph.instagram.com/v23.0/${accountId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipient: { comment_id: commentId },
          message: {
            text: message[Math.floor(Math.random() * message.length)],
          },
        }),
      }
    );
    console.log("sendResponse : ", sendResponse);

    if (!sendResponse.ok) {
      const error = await sendResponse.json();
      console.log("error : ", error);

      console.error("Instagram DM Error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send Instagram DM:", error);
    return false;
  }
}

async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v19.0/me?fields=id&access_token=${accessToken}`
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
  console.log("commentText : ", commentText);
  console.log("templates : ", templates);

  // Database trigger matching
  for (const template of templates) {
    if (!template.isActive) continue;

    const hasMatch = template.triggers?.some((trigger) => {
      if (!trigger) return false;
      return lowerComment.includes(trigger.toLowerCase().replace(/\s+/g, ""));
    });

    if (hasMatch) return template;
  }

  // AI fallback
  try {
    const relatedTemplate = await generateCommentResponse({
      userInput: commentText,
      templates: templates.map((t) => t.name),
    });
    console.log("relatedTemplate : ", relatedTemplate);

    const parsed = JSON.parse(relatedTemplate);
    console.log("parsed : ", parsed);

    if (parsed.matchedtemplate) {
      const normalizedMatch = parsed.matchedtemplate
        .toLowerCase()
        .replace(/\s+/g, "");
      return (
        templates.find(
          (t) => t.name.toLowerCase().replace(/\s+/g, "") === normalizedMatch
        ) || null
      );
    }
  } catch (error) {
    console.error("AI template matching failed:", error);
  }

  return null;
}

// Core Comment Processing
export async function processComment(
  accountId: string,
  userId: string,
  comment: InstagramComment
): Promise<void> {
  let success = false;
  let dmMessage = false;
  let responseTime = 0;
  let matchingTemplate: IReplyTemplate | null = null;
  console.log("accountId : ", accountId);
  console.log("userId : ", userId);
  console.log("comment : ", comment);

  try {
    await connectToDatabase();

    // Check duplicate processing
    const existingLog = await InstaReplyLog.findOne({ commentId: comment.id });
    console.log("existingLog : ", existingLog);

    if (existingLog) return;

    const account = await InstagramAccount.findOne({ instagramId: accountId });
    console.log("account : ", account);

    if (!account || !account.isActive) return;

    // Validate access token
    const isValidToken = await validateAccessToken(account.accessToken);
    console.log("isValidToken : ", isValidToken);

    if (!isValidToken) {
      account.isActive = false;
      await account.save();
      return;
    }

    // Check rate limits
    // if (!canMakeRequest(accountId)) return;

    // Find matching template
    const templates = await InstaReplyTemplate.find({
      userId,
      accountId,
      isActive: true,
    }).sort({ priority: 1 });
    console.log("templates : ", templates);

    matchingTemplate = await findMatchingTemplate(comment.text, templates);
    console.log("matchingTemplate : ", matchingTemplate);

    if (!matchingTemplate) return;

    const startTime = Date.now();

    // Process based on template type
    if (["sales", "support"].includes(matchingTemplate.category)) {
      try {
        dmMessage = await sendDirectMessage(
          account.instagramId,
          account.accessToken,
          comment.id,
          matchingTemplate.content
        );
        console.log("dmMessage : ", dmMessage);
        success = await replyToComment(
          account.username,
          account.instagramId,
          account.accessToken,
          comment.id,
          comment.media_id,
          ["Please check your DMs for assistance!"]
        );
        console.log("success : ", success);
      } catch (error) {
        console.error(`Error :`, error);
      }
    } else {
      try {
        success = await replyToComment(
          account.username,
          account.instagramId,
          account.accessToken,
          comment.id,
          comment.media_id,
          matchingTemplate.content
        );
        console.log("success : ", success);
      } catch (replyError) {
        console.error(`Reply failed:`, replyError);
      }
    }

    responseTime = Date.now() - startTime;

    // Save log
    await InstaReplyLog.create({
      userId,
      accountId,
      templateId: matchingTemplate._id,
      templateName: matchingTemplate.name,
      commentId: comment.id,
      commentText: comment.text,
      replyText: matchingTemplate.content,
      success: success || dmMessage,
      responseTime,
      mediaId: comment.media_id,
      commenterUsername: comment.username,
    });

    // Update template usage
    if (success || dmMessage) {
      await InstaReplyTemplate.findByIdAndUpdate(matchingTemplate._id, {
        $inc: { usageCount: 1 },
        $set: { lastUsed: new Date() },
      });
    }

    // Update account activity
    account.lastActivity = new Date();
    await account.save();
  } catch (error) {
    console.error("Error processing comment:", error);
  }
}

// Webhook Handler
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
      if (!entry.changes?.length) continue;

      for (const change of entry.changes) {
        if (change.field !== "comments") continue;

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
          console.log(`Skipping comment: ${comment.id}`);
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
          console.log(`Owner commented Skipping now: ${comment.id}`);
          continue;
        }

        await processComment(account.instagramId, account.userId, comment);
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
