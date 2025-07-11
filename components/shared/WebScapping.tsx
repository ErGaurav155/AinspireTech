"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getUserByDbId,
  setScrappedFile,
  setWebsiteScrapped,
} from "@/lib/action/user.actions";
import { getAgentSubscriptionInfo } from "@/lib/action/subscription.action";
import {
  sendSubscriptionEmailToOwner,
  sendSubscriptionEmailToUser,
} from "@/lib/action/sendEmail.action";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  websiteUrl: z.string().url("Invalid URL").min(1, "Website URL is required"),
});

type FormData = z.infer<typeof formSchema>;

export const WebScapping = ({
  userId,
  agentId,
  subscriptionId,
}: {
  userId: string;
  agentId: string;
  subscriptionId: string;
}) => {
  const [loading, setLoading] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const processSubscription = async () => {
    try {
      const agentSubscriptions = await getAgentSubscriptionInfo(
        String(userId),
        String(agentId)
      );
      if (!agentSubscriptions.length) {
        router.push("/");
        return;
      }

      const user = await getUserByDbId(userId);
      const mainUrl = user.websiteUrl;

      if (user.isScrapped) {
        router.push("/");
        return;
      }
      const response = await fetch("/api/scrape-anu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mainUrl }),
      });

      const data = await response.json();
      if (data.success) {
        await setScrappedFile(userId, data.fileName);
      } else {
        console.error("Error:", data.message);
      }
      await sendSubscriptionEmailToOwner({
        email: "gauravgkhaire155@gmail.com",
        userDbId: user._id,
        subscriptionId: subscriptionId,
      });

      await sendSubscriptionEmailToUser({
        email: user.email,
        userDbId: user._id,
        agentId: agentId,
        subscriptionId: subscriptionId,
      });

      await setWebsiteScrapped(userId);
      router.push("/web/UserDashboard");
    } catch (error) {
      console.error("Error during subscription process:", error);
      router.push("/web/UserDashboard");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const executeProcess = async () => {
      if (!isSubmitted) {
        setLoading(true);
        await processSubscription();
        setIsSubmitted(true);
      }
    };

    executeProcess();
  });

  return (
    <>
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex-between ">
              <p className="p-16-semibold text-green-400">Payment Success...</p>
            </div>

            <AlertDialogTitle className="p-24-bold text-green-600">
              Your Info On Website is Learn By Our Ai...Might Take 24 Hours.
            </AlertDialogTitle>

            <AlertDialogDescription className="p-16-regular py-3 text-green-500">
              Redirect To UserDashboard Copy Green Box Code Add To Your Website.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
