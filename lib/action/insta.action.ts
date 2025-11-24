"use server";

import InstagramAccount from "../database/models/insta/InstagramAccount.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

export async function getInstagramUser(accessToken: string, fields: string[]) {
  const fieldsStr = fields.join(",");
  const url = `https://graph.instagram.com/v23.0/me?fields=${fieldsStr}&access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching Instagram user:", error);
    throw error;
  }
}

export async function getInstaAccount(userId: string) {
  try {
    await connectToDatabase();

    // Insert dummy data
    const response = await InstagramAccount.findOne({ userId: userId });

    if (!response) {
      // throw new Error("No matching subscription found.");
      return {
        success: false,
        account: "No account found",
      };
    }

    return JSON.parse(
      JSON.stringify({
        success: true,
        account: response,
      })
    );
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Account conversion failed",
    };
  }
}
export async function getAllInstaAccounts(userId: string) {
  try {
    await connectToDatabase();

    // Insert dummy data
    const response = await InstagramAccount.find({ userId: userId });

    if (!response) {
      throw new Error("No matching account found.");
    }

    return JSON.parse(
      JSON.stringify({
        response,
      })
    );
  } catch (error: any) {
    handleError(error);
  }
}

/**
 * Checks and refreshes Instagram access tokens that are about to expire
 * Sends DM notifications to users when tokens need refresh
 */
export const refreshExpiringTokens = async (): Promise<void> => {
  try {
    // Find accounts with tokens expiring in less than 24 hours
    const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const accountsNeedingRefresh = await InstagramAccount.find({
      expiresAt: { $lte: twentyFourHoursFromNow },
      isActive: true,
    });

    for (const account of accountsNeedingRefresh) {
      try {
        await refreshAccountToken(account);
      } catch (error) {
        console.error(
          `Failed to refresh token for ${account.username}:`,
          error
        );
        // Send error notification to user
        await sendTokenRefreshFailureDM(account);
      }
    }
  } catch (error) {
    console.error("Error in refreshExpiringTokens:", error);
  }
};

/**
 * Refresh a single account's access token
 */
const refreshAccountToken = async (account: any): Promise<void> => {
  const { accessToken, _id, username } = account;

  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Refresh the token using Instagram Graph API
  const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;

  const response = await fetch(refreshUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Token refresh failed: ${response.status} ${JSON.stringify(errorData)}`
    );
  }

  const tokenData = await response.json();

  if (!tokenData.access_token) {
    throw new Error("No access token in refresh response");
  }

  // Update account with new token and expiration
  const expiresInMs = tokenData.expires_in * 1000;
  const newExpiresAt = new Date(Date.now() + expiresInMs);

  await InstagramAccount.findByIdAndUpdate(_id, {
    accessToken: tokenData.access_token,
    expiresAt: newExpiresAt,
    lastTokenRefresh: new Date(),
  });

  // Send success notification
  await sendTokenRefreshSuccessDM(account, newExpiresAt);
};

/**
 * Send DM notification for successful token refresh
 */
const sendTokenRefreshSuccessDM = async (
  account: any,
  newExpiresAt: Date
): Promise<void> => {
  const message = `🔐 Your Instagram access token has been automatically refreshed! 
  
Your new token will expire on ${newExpiresAt.toLocaleDateString()}. 

No action needed from your side. Your auto-replies will continue working seamlessly.`;

  try {
    await sendInstagramDM(account.instagramId, message);
  } catch (dmError) {
    console.error(`Failed to send success DM to ${account.username}:`, dmError);
  }
};

/**
 * Send DM notification for token refresh failure
 */
const sendTokenRefreshFailureDM = async (account: any): Promise<void> => {
  const message = `⚠️ IMPORTANT: Your Instagram access token needs manual refresh!
  
Your token will expire soon and we couldn't refresh it automatically. 

Please reconnect your Instagram account in your dashboard to continue using auto-replies.

Go to: [Your Dashboard Link]`;

  try {
    await sendInstagramDM(account.instagramId, message);
  } catch (dmError) {
    console.error(`Failed to send failure DM to ${account.username}:`, dmError);
  }
};

/**
 * Send Instagram DM (You need to implement this based on your Instagram API setup)
 */
export const sendInstagramDM = async (
  recipientId: string,
  message: string
): Promise<boolean> => {
  try {
    // This is a placeholder - implement based on your Instagram Business API setup
    // You'll need page access token and proper permissions

    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${process.env.INSTAGRAM_PAGE_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
          messaging_type: "MESSAGE_TAG",
          tag: "ACCOUNT_UPDATE",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`DM send failed: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error sending Instagram DM:", error);
    throw error;
  }
};

/**
 * Cron job setup (run this function periodically)
 */
export const setupTokenRefreshCron = async (): Promise<void> => {
  // Run every 6 hours to check for expiring tokens
  setInterval(refreshExpiringTokens, 6 * 60 * 60 * 1000);

  // Also run immediately on startup
  refreshExpiringTokens();
};
export async function getInstaAccounts(userId: string) {
  try {
    await connectToDatabase();

    const accounts = await InstagramAccount.find({ userId }).sort({
      createdAt: -1,
    });
    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        error: "Failed to fetch Instagram accounts",
      };
    }
    return {
      success: true,
      accounts: JSON.parse(JSON.stringify(accounts)),
    };
  } catch (error) {
    console.error("Error fetching Instagram accounts:", error);
    return {
      success: false,
      error: "Failed to fetch Instagram accounts",
    };
  }
}

// Delete an Instagram account
export async function deleteInstaAccount(accountId: string, userId: string) {
  try {
    await connectToDatabase();

    // Find and delete the account
    const account = await InstagramAccount.findOneAndDelete({
      username: accountId,
      userId,
    });

    if (!account) {
      return {
        success: false,
        error: "Account not found",
      };
    }

    // TODO: Add any additional cleanup logic here
    // (delete related data, webhooks, etc.)

    return {
      success: true,
      message: "Account deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting Instagram account:", error);
    return {
      success: false,
      error: "Failed to delete Instagram account",
    };
  }
}
export async function refreshInstagramToken(userId: string) {
  await connectToDatabase();

  const tokenRecord = await InstagramAccount.findOne({ userId });
  if (!tokenRecord) throw new Error("Token not found");

  // Refresh if token expires in less than 24 hours
  if (tokenRecord.expiresAt > new Date(Date.now() + 24 * 60 * 60 * 1000)) {
    return tokenRecord;
  }

  const refreshUrl = new URL(
    "https://graph.instagram.com/refresh_access_token"
  );
  refreshUrl.searchParams.append("grant_type", "ig_refresh_token");
  refreshUrl.searchParams.append("access_token", tokenRecord.accessToken);

  const refreshRes = await fetch(refreshUrl.toString());
  const refreshData = await refreshRes.json();

  if (!refreshData.access_token) {
    throw new Error("Failed to refresh token");
  }

  const expiresIn = refreshData.expires_in;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  const updatedToken = await InstagramAccount.findOneAndUpdate(
    { userId },
    {
      accessToken: refreshData.access_token,
      lastTokenRefresh: Date.now(),
      expiresAt,
    },
    { new: true }
  );

  return updatedToken;
}
