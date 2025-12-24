// app/lib/services/actionProcessor.ts
"use server";

import {
  checkFollowRelationshipDBFirst,
  replyToComment,
  sendFinalLinkDM,
  sendFollowReminderDM,
  sendInitialAccessDM,
} from "../action/instaApi.action";

export async function triggerActionProcessing(queueItem: any) {
  const { actionType, payload, accountId, userId, clerkId } = queueItem;

  try {
    // Import your existing action functions

    let result = null;

    switch (actionType) {
      case "COMMENT":
        result = await replyToComment(
          payload.username,
          accountId,
          payload.accessToken,
          payload.commentId,
          payload.mediaId,
          payload.message
        );
        break;

      case "DM":
        switch (payload.dmType) {
          case "INITIAL":
            result = await sendInitialAccessDM(
              accountId,
              payload.accessToken,
              payload.recipientId,
              payload.targetUsername,
              payload.templateMediaId,
              payload.openDm
            );
            break;
          case "FOLLOW_REMINDER":
            result = await sendFollowReminderDM(
              accountId,
              payload.accessToken,
              payload.recipientId,
              payload.targetUsername,
              payload.targetTemplate
            );
            break;
          case "FINAL_LINK":
            result = await sendFinalLinkDM(
              accountId,
              payload.accessToken,
              payload.recipientId,
              payload.content
            );
            break;
        }
        break;

      case "FOLLOW_CHECK":
        result = await checkFollowRelationshipDBFirst(
          payload.igScopedUserId,
          payload.pageAccessToken
        );
        break;

      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }

    // Update queue item as completed
    queueItem.status = "COMPLETED";
    queueItem.processedAt = new Date();
    queueItem.result = result;
    await queueItem.save();

    console.log(
      `Successfully processed queued item ${queueItem._id} for action ${actionType}`
    );
  } catch (error) {
    console.error(`Error executing action for ${queueItem._id}:`, error);
    queueItem.status = "FAILED";
    queueItem.error = error instanceof Error ? error.message : "Unknown error";
    await queueItem.save();

    // Retry logic
    if (queueItem.attempts < queueItem.maxAttempts) {
      queueItem.attempts += 1;
      queueItem.status = "QUEUED";
      queueItem.metadata.retryCount += 1;
      await queueItem.save();
      console.log(
        `Retry scheduled for item ${queueItem._id}, attempt ${queueItem.attempts}`
      );
    } else {
      console.log(
        `Max retries reached for item ${queueItem._id}, marking as failed`
      );
    }
  }
}
