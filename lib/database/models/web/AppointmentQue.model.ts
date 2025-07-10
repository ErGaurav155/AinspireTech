import mongoose, { Schema, Document } from "mongoose";

export interface IAppointmentQuestion extends Document {
  id: number;
  question: string;
  type: "text" | "email" | "tel" | "date" | "select" | "textarea";
  options?: string[];
  required: boolean;
}

const AppointmentQuestionSchema = new Schema<IAppointmentQuestion>({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200,
  },
  type: {
    type: String,
    required: true,
    enum: ["text", "email", "tel", "date", "select", "textarea"],
  },
  options: {
    type: [String],
    validate: {
      validator: function (options: string[] | undefined) {
        // Only validate options if type is 'select'
        if (this.type === "select") {
          return options && options.length > 0;
        }
        return true;
      },
      message: "At least one option is required for select type questions",
    },
  },
  required: {
    type: Boolean,
    default: false,
  },
});

export const WebAppointmentQuestion =
  mongoose.models.WebAppointmentQuestion ||
  mongoose.model<IAppointmentQuestion>(
    "WebAppointmentQuestion",
    AppointmentQuestionSchema
  );
