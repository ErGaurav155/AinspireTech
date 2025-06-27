// lib/actions/instagram.actions.ts
"use server";

import InstagramAccount, {
  IInstagramAccount,
} from "../database/models/instaAcc.model";
import { connectToDatabase } from "../database/mongoose";

// Define a type for the basic Instagram account info
interface InstagramBasicAccount {
  id: string;
  username: string;
  isProfessional: boolean;
  accountType: "BUSINESS" | "CREATOR" | "PERSONAL";
}

export const getInstagramAccounts = async (
  accessToken: string
): Promise<InstagramBasicAccount[]> => {
  try {
    // Get Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}&fields=instagram_business_account{id,username,is_eligible_for_affiliate}`
    );

    const pagesData = await pagesResponse.json();

    if (!pagesResponse.ok) {
      throw new Error(
        pagesData.error?.message || "Failed to fetch Facebook pages"
      );
    }

    // Extract Instagram accounts
    const accounts: InstagramBasicAccount[] = [];

    for (const page of pagesData.data) {
      if (page.instagram_business_account) {
        const igAccount = page.instagram_business_account;
        const accountType = igAccount.is_eligible_for_affiliate
          ? "CREATOR"
          : "BUSINESS";

        accounts.push({
          id: igAccount.id,
          username: igAccount.username,
          isProfessional: true,
          accountType,
        });
      }
    }

    // If no business accounts found, try personal accounts
    if (accounts.length === 0) {
      const userResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=instagram_accounts{id,username}&access_token=${accessToken}`
      );

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.error?.message || "Failed to fetch user data");
      }

      if (userData.instagram_accounts) {
        for (const account of userData.instagram_accounts.data) {
          accounts.push({
            id: account.id,
            username: account.username,
            isProfessional: false,
            accountType: "PERSONAL",
          });
        }
      }
    }

    return accounts;
  } catch (error: any) {
    console.error("Error fetching Instagram accounts:", error);
    throw new Error(error.message || "Failed to fetch Instagram accounts");
  }
};

// Convert to professional account
export const convertToProfessionalAccount = async (
  accountId: string,
  accountType: "BUSINESS" | "CREATOR"
) => {
  try {
    // Simulated conversion process
    console.log(`Converting account ${accountId} to ${accountType}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      success: true,
      accessToken: "simulated_access_token",
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

export const createOrUpdateInsta = async ({
  userId,
  instagramId,
  instagramUsername,
  isProfessional,
  accountType,
  accessToken,
}: {
  userId: string;
  instagramId: string;
  instagramUsername: string;
  isProfessional: boolean;
  accountType: "BUSINESS" | "CREATOR" | "PERSONAL";
  accessToken: string;
}) => {
  try {
    await connectToDatabase();

    // Find existing Instagram account
    let instaAccount = await InstagramAccount.findOne({ userId });

    if (instaAccount) {
      // Update existing account
      instaAccount.instagramId = instagramId;
      instaAccount.username = instagramUsername;
      instaAccount.isProfessional = isProfessional;
      instaAccount.accountType = accountType;
      instaAccount.accessToken = accessToken;
    } else {
      // Create new Instagram account
      instaAccount = new InstagramAccount({
        userId,
        instagramId,
        username: instagramUsername,
        isProfessional,
        accountType,
        accessToken,
        isActive: true,
        lastActivity: new Date(),
      });
    }

    await instaAccount.save();
    return { success: true, instaAccount };
  } catch (error: any) {
    console.error("Instagram account creation/update error:", error);
    throw new Error(
      error.message || "Failed to create/update Instagram account"
    );
  }
};
