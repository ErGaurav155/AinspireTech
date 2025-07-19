"use server";

import InstagramAccount, {
  IInstagramAccount,
} from "../database/models/insta/InstagramAccount.model";
import { connectToDatabase } from "../database/mongoose";

// Get long-lived access token (60 days)
const getLongLivedToken = async (accessToken: string) => {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FB_APP_ID}&client_secret=${process.env.FB_APP_SECRET}&fb_exchange_token=${accessToken}`
  );

  const data = await response.json();
  return data.access_token;
};

export const getInstagramAccounts = async (
  accessToken: string,
  userId: string
): Promise<IInstagramAccount[]> => {
  try {
    // Get long-lived token first
    const longLivedToken = await getLongLivedToken(accessToken);

    // Get Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}&fields=id,name,access_token,instagram_business_account{id,username,is_eligible_for_affiliate}`
    );

    const pagesData = await pagesResponse.json();

    if (!pagesResponse.ok) {
      throw new Error(
        pagesData.error?.message || "Failed to fetch Facebook pages"
      );
    }

    const accounts: IInstagramAccount[] = [];

    // Process business accounts
    for (const page of pagesData.data) {
      if (page.instagram_business_account) {
        const igAccount = page.instagram_business_account;
        const accountType = igAccount.is_eligible_for_affiliate
          ? "CREATOR"
          : "BUSINESS";

        // Create/update account in DB
        try {
          const response = await fetch("/api/instagram/accounts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId,
              instagramId: igAccount.id,
              username: igAccount.username,
              isProfessional: true,
              accountType: accountType,
              accessToken: longLivedToken,
              pageId: page.id,
              pageAccessToken: page.access_token,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to create/update account");
          }
          const savedAccount = await response.json();

          if (savedAccount.success && savedAccount.instaAccount) {
            accounts.push(savedAccount.instaAccount);
          }
        } catch (error) {
          console.error("Error:", error);
          throw error;
        }
      }
    }

    // If no business accounts found, try personal accounts
    if (accounts.length === 0) {
      const userResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=instagram_accounts{id,username}&access_token=${longLivedToken}`
      );

      const userData = await userResponse.json();

      if (userResponse.ok && userData.instagram_accounts) {
        for (const account of userData.instagram_accounts.data) {
          try {
            const response = await fetch("/api/instagram/accounts", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: userId,
                instagramId: account.id,
                username: account.username,
                isProfessional: false,
                accountType: "PERSONAL",
                accessToken: longLivedToken,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to create/update account");
            }
            const savedAccount = await response.json();

            if (savedAccount.success && savedAccount.instaAccount) {
              accounts.push(savedAccount.instaAccount);
            }
          } catch (error) {
            console.error("Error:", error);
            throw error;
          }
        }
      }
    }

    return accounts;
  } catch (error: any) {
    console.error("Error fetching Instagram accounts:", error);
    throw new Error(error.message || "Failed to fetch Instagram accounts");
  }
};

// Real implementation for conversion
export const convertToProfessionalAccount = async (
  accountId: string,
  accountType: "BUSINESS" | "CREATOR",
  accessToken: string
) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}?account_type=${accountType.toLowerCase()}_account&access_token=${accessToken}`,
      { method: "POST" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Conversion failed");
    }

    return {
      success: true,
      accessToken: data.access_token,
      accountType,
    };
  } catch (error: any) {
    console.error("Account conversion error:", error);
    return {
      success: false,
      error: error.message || "Account conversion failed",
    };
  }
};

// Add this new function to check token expiration
export const refreshAccessTokenIfNeeded = async (accountId: string) => {
  await connectToDatabase();
  const account = await InstagramAccount.findById(accountId);

  if (!account) throw new Error("Account not found");

  // Refresh if token expires in less than 7 days
  if (
    account.lastTokenRefresh &&
    Date.now() - account.lastTokenRefresh.getTime() > 50 * 24 * 60 * 60 * 1000
  ) {
    const newToken = await getLongLivedToken(account.accessToken);
    account.accessToken = newToken;
    account.lastTokenRefresh = new Date();
    await account.save();
  }

  return account.accessToken;
};

export async function getInstaAccount(userId: string) {
  try {
    await connectToDatabase();

    // Insert dummy data
    const response = await InstagramAccount.findOne({ userId: userId });

    if (!response) {
      throw new Error("No matching subscription found.");
    }

    return JSON.parse(JSON.stringify(response));
  } catch (error) {
    console.error("Error seeding subscriptions:", error);
  }
}
