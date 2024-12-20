"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CrossIcon } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const InsufficientCreditsModal = () => {
  const router = useRouter();

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex-between ">
            <p className="p-16-semibold text-green-400">Success...</p>
            <AlertDialogCancel
              className="border-0 p-0 hover:bg-transparent"
              onClick={() => router.push("/")}
            >
              <XMarkIcon className=" size-6 cursor-pointer" />
            </AlertDialogCancel>
          </div>

          <video
            src="/assets/congratulation.webm"
            width="600"
            height="400"
            autoPlay
            loop
            muted
            className="cursor-pointer rounded-md"
          >
            youtube thumbnail
          </video>

          <AlertDialogTitle className="p-24-bold text-green-600">
            Appointment Booked Successfully
          </AlertDialogTitle>

          <AlertDialogDescription className="p-16-regular py-3 text-green-500">
            We will Message you soon.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};
