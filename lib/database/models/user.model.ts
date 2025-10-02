// models/User.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
    },
    websiteUrl: {
      type: String,
    },
    phone: {
      type: String,
    },
    totalReplies: {
      type: Number,
      default: 0,
    },
    replyLimit: {
      type: Number,
      default: 500,
    },
    accountLimit: {
      type: Number,
      default: 1,
    },
    scrappedFile: {
      type: String,
    },
    isScrapped: {
      type: Boolean,
      default: false,
    },
    photo: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User = models?.User || model("User", UserSchema);

export default User;
