"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import User from "@/lib/database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { CreateUserParams, UpdateUserParams } from "@/types/types";
import WebSubscription from "../database/models/web/Websubcription.model";
import { dummySubscriptions } from "@/constant";

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
export async function seedSubscriptions() {
  try {
    await connectToDatabase();

    // Clear existing data
    await WebSubscription.deleteMany({});
    console.log("Cleared existing subscriptions");

    // Insert dummy data
    const created = await WebSubscription.insertMany(dummySubscriptions);
    console.log(`Created ${created.length} dummy subscriptions`);
  } catch (error) {
    console.error("Error seeding subscriptions:", error);
  }
}
