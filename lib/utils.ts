/* eslint-disable prefer-const */
/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ERROR HANDLER
export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    // This is a native JavaScript error (e.g., TypeError, RangeError)
    throw new Error(`Error: ${error.message}`);
  } else if (typeof error === "string") {
    // This is a string error message
    throw new Error(`Error: ${error}`);
  } else {
    // This is an unknown type of error
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }
};
import { auth } from "@clerk/nextjs";
import { NextRequest } from "next/server";
import { connectToDatabase } from "./database/mongoose";
import InstagramAccount from "./database/models/insta/InstagramAccount.model";

export async function getAuthUser() {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return { userId };
}

export function createAuthResponse(error: string, status: number = 401) {
  return Response.json({ error }, { status });
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class ApiClient {
  private async getAuthHeaders() {
    // For client-side requests, we'll rely on Clerk's automatic session handling
    return {
      "Content-Type": "application/json",
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const config = {
      headers: await this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(error.error || "Request failed");
    }

    return response.json();
  }

  // User methods
  async getUserProfile() {
    return this.request("/web/user/profile");
  }

  async updateUserProfile(name: string, email: string) {
    return this.request("/web/user/profile", {
      method: "PUT",
      body: JSON.stringify({ name, email }),
    });
  }

  // Subscription methods
  async getSubscriptions() {
    return this.request("/web/subscription/list");
  }

  async createSubscription(
    chatbotType: string,
    plan: string,
    billingCycle: string,
    subscriptionId: string
  ) {
    return this.request("/web/subscription/create", {
      method: "POST",
      body: JSON.stringify({ chatbotType, plan, billingCycle, subscriptionId }),
    });
  }

  async cancelSubscription(chatbotType: string) {
    return this.request("/web/subscription/cancel", {
      method: "POST",
      body: JSON.stringify({ chatbotType }),
    });
  }

  // Chatbot methods
  async getChatbots() {
    return this.request("/web/chatbot/list");
  }

  async getChatbot(id: string) {
    return this.request(`/web/chatbot/${id}`);
  }

  async createChatbot(data: any) {
    return this.request("/web/chatbot/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateChatbot(id: string, data: any) {
    return this.request(`/web/chatbot/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteChatbot(id: string) {
    return this.request(`/web/chatbot/${id}`, {
      method: "DELETE",
    });
  }

  // Analytics methods
  async getAnalytics(chatbotType: string, period: string = "7d") {
    return this.request(`/web/analytics/${chatbotType}?period=${period}`);
  }

  // Conversations methods
  async getConversations(
    chatbotType: string,
    limit: number = 20,
    offset: number = 0
  ) {
    return this.request(
      `/web/conversations/${chatbotType}?limit=${limit}&offset=${offset}`
    );
  }

  // Website data methods
  async getWebsiteData(chatbotType: string) {
    return this.request(`/web/website-data?chatbotType=${chatbotType}`);
  }

  async saveWebsiteData(chatbotType: string, content: string) {
    return this.request("/web/website-data", {
      method: "POST",
      body: JSON.stringify({ chatbotType, content }),
    });
  }

  // Appointment questions methods
  async getAppointmentQuestions(chatbotType: string) {
    return this.request(
      `/web/appointment-questions?chatbotType=${chatbotType}`
    );
  }

  async saveAppointmentQuestions(chatbotType: string, questions: any[]) {
    return this.request("/web/appointment-questions", {
      method: "POST",
      body: JSON.stringify({ chatbotType, questions }),
    });
  }
}

export const apiClient = new ApiClient();

export async function refreshInstagramToken(userId: string) {
  await connectToDatabase();

  const tokenRecord = await InstagramAccount.findOne({ userId });
  if (!tokenRecord) throw new Error("Token not found");

  // Refresh if token expires in less than 24 hours
  if (
    tokenRecord.lastTokenRefresh > new Date(Date.now() + 24 * 60 * 60 * 1000)
  ) {
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
// lib/cacheUtils.ts
const ACCOUNTS_CACHE_KEY = "instagramAccounts";

export interface InstagramAccount {
  id: string;
  accountId: string;
  username: string;
  displayName: string;
  profilePicture: string;
  followersCount: number;
  postsCount: number;
  isActive: boolean;
  templatesCount: number;
  repliesCount: number;
  lastActivity: string;
  engagementRate: number;
  avgResponseTime: string;
  accessToken: string;
}

// Get all cached accounts
export function getCachedAccounts(): InstagramAccount[] | null {
  try {
    const cachedData = localStorage.getItem(ACCOUNTS_CACHE_KEY);
    if (!cachedData) return null;

    const { data } = JSON.parse(cachedData);
    return data;
  } catch (error) {
    console.error("Error reading account cache:", error);
    return null;
  }
}

// Get specific account by ID
export function getCachedAccountById(
  accountId: string
): InstagramAccount | null {
  try {
    const cachedData = localStorage.getItem(ACCOUNTS_CACHE_KEY);
    if (!cachedData) return null;

    const { data } = JSON.parse(cachedData);
    return (
      data.find((account: InstagramAccount) => account.id === accountId) || null
    );
  } catch (error) {
    console.error("Error reading account cache:", error);
    return null;
  }
}

// Check if cache is valid
export function isCacheValid(): boolean {
  try {
    const cachedData = localStorage.getItem(ACCOUNTS_CACHE_KEY);
    if (!cachedData) return false;

    const { timestamp } = JSON.parse(cachedData);
    const cacheDuration = 15 * 60 * 1000; // 15 minutes
    return Date.now() - timestamp < cacheDuration;
  } catch (error) {
    console.error("Error checking cache validity:", error);
    return false;
  }
}
