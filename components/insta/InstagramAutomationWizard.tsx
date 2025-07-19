"use client";

import Link from "next/link";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Instagram } from "lucide-react";
export default function LoginPage() {
  const [showCancelSubDialog, setShowCancelSubDialog] = useState(true);
  const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}&redirect_uri=https://ainspiretech.com/api/insta/callback&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
  return (
    <AlertDialog
      open={showCancelSubDialog}
      onOpenChange={setShowCancelSubDialog}
    >
      <AlertDialogContent className="p-2    backdrop-blur-md  w-full  overflow-y-auto mx-auto  ">
        <div className="flex items-center justify-between gap-5 mb-2">
          <AlertDialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF2E9F] to-[#B026FF]">
            <Instagram className="w-6 h-6" />
            Instagram Automation Setup
          </AlertDialogTitle>
          <XMarkIcon
            onClick={() => setShowCancelSubDialog(false)}
            className="text-[#FF2E9F] h-10 w-10 cursor-pointer hover:text-[#B026FF]"
          />
        </div>
        <div className=" flex items-center justify-center ">
          <div className="max-w-md w-full p-6   backdrop-blur-md rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">
              Instagram Business Login
            </h1>
            <Link
              href={instagramAuthUrl}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Connect Instagram Account
            </Link>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
