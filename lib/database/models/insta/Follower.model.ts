import mongoose, { Schema, Document } from "mongoose";

export interface IFollower extends Document {
  ownerIgId: string; // the IG business account being followed
  igUserId: string; // the follower's IG id
  isFollowing: boolean;
  updatedAt: Date;
}

const FollowerSchema = new Schema<IFollower>(
  {
    ownerIgId: {
      type: String,
      required: true,
    },
    igUserId: {
      type: String,
      required: true,
    },

    isFollowing: {
      type: Boolean,
      default: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      index: { expires: "15d" }, // TTL - 30 days default
    },
  },
  {
    timestamps: false, // We're using custom updatedAt field with TTL
  }
);

// Composite unique key so same follower can follow multiple owners without duplication per owner
FollowerSchema.index({ ownerIgId: 1, igUserId: 1 }, { unique: true });

const Follower =
  mongoose.models?.Follower ||
  mongoose.model<IFollower>("Follower", FollowerSchema);

export default Follower;
