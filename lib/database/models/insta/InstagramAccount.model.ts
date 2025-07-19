import mongoose, { Schema, Document } from "mongoose";

export interface IInstagramAccount extends Document {
  userId: string;
  instagramId: string;
  username: string;
  isProfessional: boolean;
  accountType: string;
  accessToken: string;
  displayName?: string;
  profilePicture?: string;
  isActive?: boolean;
  lastTokenRefresh?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstagramAccountSchema = new Schema<IInstagramAccount>(
  {
    userId: {
      type: String,
      required: true,
    },
    instagramId: { type: String, unique: true, sparse: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    isProfessional: Boolean,
    accountType: { type: String, enum: ["BUSINESS", "CREATOR", "PERSONAL"] },
    accessToken: String,

    displayName: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 24 * 1000), // Default to 24 hours from now
    },
    lastTokenRefresh: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const InstagramAccount =
  mongoose.models?.InstagramAccount ||
  mongoose.model<IInstagramAccount>("InstagramAccount", InstagramAccountSchema);
export default InstagramAccount;
