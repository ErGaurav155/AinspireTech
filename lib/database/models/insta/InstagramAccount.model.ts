import mongoose, { Schema, Document } from "mongoose";

export interface IInstagramAccount extends Document {
  userId: string;
  instagramId: string;
  userInstaId: string;
  username: string;
  accessToken: string;
  profilePicture?: string;
  isActive?: boolean;
  accountReply: number;
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
    userInstaId: { type: String, unique: true, sparse: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    accessToken: String,

    profilePicture: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    accountReply: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 24 * 1000),
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
