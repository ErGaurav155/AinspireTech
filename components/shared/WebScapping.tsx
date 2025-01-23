"use client";

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

export const WebScapping = () => {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex-between ">
            <p className="p-16-semibold text-green-400"> Payment Success...</p>
          </div>

          <AlertDialogTitle className="p-24-bold text-green-600">
            Your Website is being Scrapped...Might Take 24 Hours.
          </AlertDialogTitle>

          <AlertDialogDescription className="p-16-regular py-3 text-green-500">
            Go To UserDashoboard.Copy Green Box URL Add To Your Website.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};
