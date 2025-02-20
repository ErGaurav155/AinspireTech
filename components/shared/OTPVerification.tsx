// components/OTPVerification.tsx
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateNumberByDbId } from "@/lib/action/user.actions";
import { toast } from "../ui/use-toast";
interface OTPVerificationProps {
  phone: string;
  onVerified: () => void;
  buyerId: string | null;
}
const formSchema = z.object({
  OTP: z.string().min(6, "Otp is required").regex(/^\d+$/, "invalid Otp"),
});

type FormData = z.infer<typeof formSchema>;
export default function OTPVerification({
  phone,
  onVerified,
  buyerId,
}: OTPVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const [wrongOtp, setWrongOtp] = useState(false);
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const handleOTPSubmit = async (data: FormData) => {
    setIsVerifying(true);
    try {
      const { OTP } = data;
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, OTP }),
      });
      if (res.ok) {
        onVerified();
        if (!buyerId) {
          throw new Error("User database ID is not available.");
        }

        const response = await updateNumberByDbId(buyerId, phone);
        if (response) {
          toast({
            title: "Number successfully submitted!",
            duration: 2000,
            className: "success-toast",
          });
        } else {
          toast({
            title: "Failed to submit the Number",
            duration: 2000,
            className: "error-toast",
          });
        }
      } else {
        setWrongOtp(true);
        console.error("Failed to verify OTP:", res.statusText);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div>
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="sr-only">
                Verify Your Mobile Number{" "}
              </AlertDialogTitle>
              <div className="flex justify-between items-center">
                <p className="p-16-semibold text-black">Enter OTP</p>
                <AlertDialogCancel
                  onClick={() => router.push(`/`)}
                  className="border-0 p-0 hover:bg-transparent"
                >
                  <XMarkIcon className="size-6 cursor-pointer" />
                </AlertDialogCancel>
              </div>
            </AlertDialogHeader>
            <form
              onSubmit={handleSubmit(handleOTPSubmit)}
              className="space-y-4"
            >
              <div className="w-full">
                <label
                  htmlFor="MobileNumber"
                  className="block text-lg font-semibold"
                >
                  Enter OTP
                </label>
                <input
                  id="OTP"
                  type="text"
                  {...register("OTP")}
                  className="input-field mt-2 w-full"
                />
                {errors.OTP && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.OTP.message}
                  </p>
                )}
                {wrongOtp && (
                  <p className="text-red-500 text-xs mt-1">
                    Wrong Otp... Plz Enter Correct Otp.
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="bg-green-500 text-white p-2 w-1/2 rounded-md"
                  disabled={isVerifying}
                >
                  {isVerifying ? "Verifying OTP" : "Verify OTP"}
                </button>
              </div>
            </form>

            <AlertDialogDescription className="p-16-regular py-3 text-green-500">
              IT WILL HELP US TO PROVIDE BETTER SERVICES
            </AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
