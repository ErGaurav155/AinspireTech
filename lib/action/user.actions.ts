"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import User from "@/lib/database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { CreateUserParams, UpdateUserParams } from "@/types/types";

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
  revalidateTag("users");
}
export async function getUserByDbId(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ _id: userId });

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
  revalidateTag("users");
}
export async function updateNumberByDbId(buyerId: string, newNumber: string) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { _id: buyerId },
      { $set: { phone: newNumber } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }

  revalidateTag("users");
}
export async function updateUserByDbId(userId: string, newUrl: string) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { websiteUrl: newUrl } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }

  revalidateTag("users");
}
export async function setWebsiteScrapped(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { isScrapped: true } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
  revalidateTag("users");
}
export async function setScrappedFile(userId: string, fileName: string) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { scrappedFile: fileName } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }

  revalidateTag("users");
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
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
    billingCycle: string
  ) {
    return this.request("/web/subscription/create", {
      method: "POST",
      body: JSON.stringify({ chatbotType, plan, billingCycle }),
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

  async createConversation(data: any) {
    return this.request("/web/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    });
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
