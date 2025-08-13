"use server";

import InstagramAccount from "../database/models/insta/InstagramAccount.model";
import { connectToDatabase } from "../database/mongoose";

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
export async function getInstagramAccountId(
  accountId: string,
  accessToken: string,
  fields: string[]
) {
  const fieldsStr = fields.join(",");
  const url = `https://graph.instagram.com/v23.0/${accountId}?fields=${fieldsStr}&access_token=${accessToken}`;

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
