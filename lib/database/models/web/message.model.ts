import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessageMetadata {
  sentiment?: "positive" | "negative" | "neutral";
  intent?: string;
  confidence?: number;
}

export interface IMessage extends Document {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  metadata?: IMessageMetadata;
  conversationId: mongoose.Types.ObjectId;
}

const MessageMetadataSchema = new Schema<IMessageMetadata>(
  {
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral"],
    },
    intent: {
      type: String,
      trim: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    type: {
      type: String,
      required: true,
      enum: ["user", "bot"],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    metadata: {
      type: MessageMetadataSchema,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
MessageSchema.index({ conversationId: 1, timestamp: 1 });
MessageSchema.index({ "metadata.intent": 1 });
MessageSchema.index({ "metadata.sentiment": 1 });

const WebMessage =
  mongoose.models?.WebMessage ||
  mongoose.model<IMessage>("WebMessage", MessageSchema);

export default WebMessage;
