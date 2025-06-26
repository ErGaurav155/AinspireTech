"use client";

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
            className:
              "bg-gradient-to-r from-green-500 to-emerald-700 text-white",
          });
        } else {
          toast({
            title: "Failed to submit the Number",
            duration: 2000,
            className:
              "bg-gradient-to-r from-[#FF2E9F] to-[#B026FF] text-white",
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
    <AlertDialog defaultOpen>
      <AlertDialogContent className="bg-[#0a0a0a]/90 backdrop-blur-lg border border-[#333] rounded-xl max-w-md">
        <AlertDialogTitle className="text-pink-400">
          Otp Verification
        </AlertDialogTitle>
        <AlertDialogHeader>
          <div className="flex justify-between items-center">
            <h3 className="p-16-semibold text-white text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
              Enter OTP
            </h3>
            <AlertDialogCancel
              onClick={() => router.push(`/`)}
              className="border-0 p-0 hover:bg-transparent text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="size-6 cursor-pointer" />
            </AlertDialogCancel>
          </div>
        </AlertDialogHeader>
        <form
          onSubmit={handleSubmit(handleOTPSubmit)}
          className="space-y-6 p-4"
        >
          <div className="w-full">
            <label
              htmlFor="OTP"
              className="block text-md font-medium text-gray-300 mb-2"
            >
              Verification code sent to {phone}
            </label>
            <input
              id="OTP"
              type="text"
              {...register("OTP")}
              placeholder="Enter 6-digit OTP"
              className="w-full bg-[#1a1a1a]/50 backdrop-blur-sm border border-[#333] rounded-xl py-4 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
            />
            {errors.OTP && (
              <p className="text-red-400 text-sm mt-2">{errors.OTP.message}</p>
            )}
            {wrongOtp && (
              <p className="text-red-400 text-sm mt-2">
                Wrong OTP. Please enter the correct code.
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90 transition-all ${
                isVerifying ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </button>
          </div>
        </form>
        <AlertDialogDescription className="p-4 text-center text-sm text-gray-400 border-t border-[#333] pt-4">
          <span className="text-[#00F0FF]">
            IT WILL HELP US TO PROVIDE BETTER SERVICES
          </span>
        </AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  );
}
