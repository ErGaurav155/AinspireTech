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
