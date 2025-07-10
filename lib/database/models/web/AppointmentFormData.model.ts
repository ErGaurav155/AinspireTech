import mongoose, { Schema, Document } from "mongoose";

export interface IAppointmentFormData extends Document {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  message?: string;
  [key: string]: any; // For additional dynamic fields
}

const AppointmentFormDataSchema = new Schema<IAppointmentFormData>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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
      required: true,
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
      maxlength: 100,
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return !isNaN(Date.parse(v));
        },
        message: "Please enter a valid date string",
      },
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    strict: false, // Allows dynamic additional fields
  }
);

// Indexes for common queries
AppointmentFormDataSchema.index({ email: 1 });
AppointmentFormDataSchema.index({ date: 1 });
AppointmentFormDataSchema.index({ service: 1 });

const WebAppointmentFormData =
  mongoose.models.WebAppointmentFormData ||
  mongoose.model<IAppointmentFormData>(
    "WebAppointmentFormData",
    AppointmentFormDataSchema
  );

export default WebAppointmentFormData;
