import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  metadata?: {
    sentiment?: "positive" | "negative" | "neutral";
    intent?: string;
    confidence?: number;
  };
}

export interface IAppointmentFormData {
  name: string;
  email: string;
  phone?: string;
  service: string;
  date: Date;
  message?: string;
}

export interface IConversation extends Document {
  chatbotId: mongoose.Types.ObjectId;
  chatbotType:
    | "customer-support"
    | "e-commerce"
    | "lead-generation"
    | "instagram-automation";
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  customerEmail?: string;
  customerName?: string;
  messages: IMessage[];
  formData?: IAppointmentFormData;
  status: "active" | "resolved" | "pending";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageMetadataSchema = new Schema(
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
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: MessageMetadataSchema,
    },
  },
  { _id: false }
);

const AppointmentFormDataSchema = new Schema<IAppointmentFormData>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        "Please enter a valid phone number",
      ],
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    chatbotId: {
      type: Schema.Types.ObjectId,
      ref: "Chatbot",
      required: true,
    },
    chatbotType: {
      type: String,
      required: true,
      enum: [
        "customer-support",
        "e-commerce",
        "lead-generation",
        "instagram-automation",
      ],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clerkId: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    customerName: {
      type: String,
      trim: true,
    },
    messages: [MessageSchema],
    formData: {
      type: AppointmentFormDataSchema,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "resolved", "pending"],
      default: "active",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
ConversationSchema.index({ chatbotId: 1, status: 1 });
ConversationSchema.index({ userId: 1, createdAt: -1 });
ConversationSchema.index({ chatbotType: 1, status: 1 });
ConversationSchema.index({ "messages.timestamp": 1 });
ConversationSchema.index({ clerkId: 1, status: 1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
