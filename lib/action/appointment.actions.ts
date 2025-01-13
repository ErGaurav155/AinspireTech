"use server";

import { AppointmentParams } from "@/types/types";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import Appointment from "@/lib/database/models/Appointment.model";

export async function createAppointment(Appointmentdata: AppointmentParams) {
  try {
    await connectToDatabase();

    // Create a new transaction with a buyerId
    const newTransaction = await Appointment.create({
      ...Appointmentdata,
    });

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
  }
}
export async function getAllAppointments() {
  try {
    await connectToDatabase();

    const appointments = await Appointment.find({});
    const formattedAppointments = appointments.map((appointment) => {
      return {
        _id: appointment._id.toString(), // Ensure _id is converted to string
        name: appointment.name,
        phone: appointment.phone,
        address: appointment.address,
        email: appointment.email, // Ensure date is in string format
        subject: appointment.subject,
        budget: appointment.budget,
        message: appointment.message || "",
        createdAt: appointment.createdAt.toISOString(), // Ensure createdAt is a string
      };
    });

    // Return the formatted result
    return { data: formattedAppointments };
    // Return the result as a JSON-parsable object
  } catch (error) {
    handleError(error);
    throw new Error("Failed to fetch appointments");
  }
}

export async function getOwner() {
  try {
    const ownerId = process.env.OWNER_USER_ID;

    if (!ownerId) {
      throw new Error(
        "OWNER_USER_ID is not defined in the environment variables."
      );
    }

    return ownerId;
  } catch (error) {
    handleError(error);
  }
}
