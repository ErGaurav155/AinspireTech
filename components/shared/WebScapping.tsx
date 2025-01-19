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

export const WebScapping = () => {
  const router = useRouter();

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex-between ">
            <p className="p-16-semibold text-green-400"> Payment Success...</p>
          </div>

          <AlertDialogTitle className="p-24-bold text-green-600">
            Website is being Scrapped...
          </AlertDialogTitle>

          <AlertDialogDescription className="p-16-regular py-3 text-green-500">
            Please Wait.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};
