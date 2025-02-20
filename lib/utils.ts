/* eslint-disable prefer-const */
/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { toast } from "@/components/ui/use-toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ERROR HANDLER
export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    // This is a native JavaScript error (e.g., TypeError, RangeError)
    throw new Error(`Error: ${error.message}`);
  } else if (typeof error === "string") {
    // This is a string error message
    throw new Error(`Error: ${error}`);
  } else {
    // This is an unknown type of error
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }
};
// export async function sendToWhatsApp(data: CustomerData) {
//   const message = await twilio.messages.create({
//     body: `New Customer Inquiry:
//     Name: ${data.name}
//     Email: ${data.email}
//     Reason: ${data.reason}`,
//     from: "whatsapp:+14155238886",
//     to: `whatsapp:${process.env.RECIPIENT_PHONE}`,
//   });
//   return message.sid;
// }
