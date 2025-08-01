import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppointment extends Document {
  chatbotId: mongoose.Types.ObjectId;
  chatbotType:
    | "chatbot-customer-support"
    | "chatbot-e-commerce"
    | "chatbot-lead-generation"
    | "chatbot-education";
  clerkId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  appointmentDate: Date;
  service: string;
  notes?: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
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
        "chatbot-customer-support",
        "chatbot-e-commerce",
        "chatbot-lead-generation",
        "chatbot-education",
      ],
    },

    clerkId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    customerPhone: {
      type: String,
      trim: true,
      match: [
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        "Please enter a valid phone number",
      ],
    },
    appointmentDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: "Appointment date must be in the future",
      },
    },
    service: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      required: true,
      enum: ["scheduled", "confirmed", "cancelled", "completed"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
AppointmentSchema.index({ chatbotId: 1, status: 1 });
AppointmentSchema.index({ appointmentDate: 1, status: 1 });
AppointmentSchema.index({ clerkId: 1, status: 1 });
AppointmentSchema.index({ chatbotType: 1, status: 1 });

const WebAppointment =
  mongoose.models?.WebAppointment ||
  mongoose.model<IAppointment>("WebAppointment", AppointmentSchema);

export default WebAppointment;
