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
            Website is being Scrapped...
          </AlertDialogTitle>

          <AlertDialogDescription className="p-16-regular py-3 text-green-500">
            Please Wait. Might Take Few Minutes.After This Go To UserDashoboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};
