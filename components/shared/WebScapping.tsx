"use client";

import React, { useState } from "react";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getUserByDbId,
  setScrappedFile,
  setWebsiteScrapped,
  updateUserByDbId,
} from "@/lib/action/user.actions";
import { getAgentSubscriptionInfo } from "@/lib/action/subscription.action";
import {
  sendSubscriptionEmailToOwner,
  sendSubscriptionEmailToUser,
} from "@/lib/action/sendEmail.action";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/solid";

const formSchema = z.object({
  websiteUrl: z.string().url("Invalid URL").min(1, "Website URL is required"),
});

type FormData = z.infer<typeof formSchema>;

export const WebScapping = ({
  userId,
  agentId,
}: {
  userId: string;
  agentId: string;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      // await sendSubscriptionEmailToOwner({
      //   email: "gauravgkhaire155@gmail.com",
      //   userDbId: user._id,
      //   subscriptionId: subscriptionId,
      // });

      // await sendSubscriptionEmailToUser({
      //   email: user.email,
      //   userDbId: user._id,
      //   agentId: agentId,
      //   subscriptionId: subscriptionId,
      // });

      await setWebsiteScrapped(userId);
      router.push("/UserDashboard");
    } catch (error) {
      console.error("Error during subscription process:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };
  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (!userId) {
        throw new Error("User database ID is not available.");
      }

      const response = await updateUserByDbId(userId, data.websiteUrl);
      if (response) {
        toast({
          title: "URL successfully submitted!",
          duration: 2000,
          className: "success-toast",
        });
        setIsSubmitted(true);
        await processSubscription();
      } else {
        toast({
          title: "Failed to submit the URL",
          duration: 2000,
          className: "error-toast",
        });
      }
    } catch (error) {
      console.error("Error submitting the URL:", error);
      toast({
        title: "Error submitting the URL",
        duration: 2000,
        className: "error-toast",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <>
        {!isSubmitted ? (
          <div>
            <AlertDialog defaultOpen>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="sr-only">
                    Enter Website URL
                  </AlertDialogTitle>
                  <div className="flex justify-between items-center">
                    <p className="p-16-semibold text-black">
                      PLEASE ENTER YOUR WEBSITE URL/LINK
                    </p>
                    <AlertDialogCancel
                      onClick={() => router.push(`/`)}
                      className="border-0 p-0 hover:bg-transparent"
                    >
                      <XMarkIcon className="size-6 cursor-pointer" />
                    </AlertDialogCancel>
                  </div>
                </AlertDialogHeader>
                <form
                  onSubmit={handleSubmit(handleFormSubmit)}
                  className="space-y-4"
                >
                  <div className="w-full">
                    <label
                      htmlFor="websiteUrl"
                      className="block text-lg font-semibold"
                    >
                      Website URL
                    </label>
                    <input
                      id="websiteUrl"
                      type="url"
                      {...register("websiteUrl")}
                      className="input-field mt-2 w-full"
                    />
                    {errors.websiteUrl && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.websiteUrl.message}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      type="submit"
                      className="bg-green-500 text-white p-2 w-1/2 rounded-md"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Navigating" : "Go UserDashboard"}
                    </button>
                  </div>
                </form>

                <AlertDialogDescription className="p-16-regular py-3 text-green-500">
                  IT WILL HELP US TO PROVIDE BETTER SERVICES
                </AlertDialogDescription>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <AlertDialog defaultOpen>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="flex-between ">
                  <p className="p-16-semibold text-green-400">
                    Payment Success...
                  </p>
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
        )}
      </>
    </>
  );
};
