import mongoose, { Schema, Document } from "mongoose";

export interface IInstagramAccount extends Document {
  userId: string;
  instagramId: string;
  username: string;
  isProfessional: Boolean;
  accountType: string;
  accessToken: string;
  displayName?: string;
  profilePicture?: string;
  isActive: boolean;
  lastActivity: Date;
  followersCount?: number;
  postsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const InstagramAccountSchema = new Schema<IInstagramAccount>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
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
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    postsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const InstagramAccount =
  mongoose.models.InstagramAccount ||
  mongoose.model<IInstagramAccount>("InstagramAccount", InstagramAccountSchema);
export default InstagramAccount;
