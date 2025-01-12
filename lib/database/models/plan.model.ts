import mongoose, { Schema, Document, model } from "mongoose";

// Define the Plan interface
interface IPlan extends Document {
  productId: string;
  planId: string;
  name: string;
  amount: number;
  currency: string;
  period: string;
}

// Create the Plan schema
const PlanSchema = new Schema<IPlan>({
  productId: { type: String, unique: true, required: true },
  planId: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  period: { type: String, required: true },
});

// Create the Plan model
const Plan = mongoose.models.Plan || model<IPlan>("Plan", PlanSchema);

export default Plan;
