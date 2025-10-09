"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import AddAccount from "@/components/insta/AddAccount";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getUserById } from "@/lib/action/user.actions";
import { getAllInstaAccounts } from "@/lib/action/insta.action";
import { useTheme } from "next-themes";

export default function AddAccountPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [accountLimit, setAccountLimit] = useState(0);
  const [totalAccounts, setTotalAcoounts] = useState(0);
  const { theme } = useTheme();

  // Theme-based styles
  const containerBg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-gray-50";
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!userId) {
        router.push("/sign-in");
        return;
      }

      try {
        const user = await getUserById(userId);
        if (!user) {
          router.push("/sign-in");
          return;
        }
        setAccountLimit(user.accountLimit);
        const totalAccount = await getAllInstaAccounts(userId);
        if (totalAccount.response.length === 0) {
          setTotalAcoounts(0);
        } else {
          setTotalAcoounts(totalAccount.response.length);
        }
      } catch (error: any) {
        console.error("Error fetching subscriptions:", error.message);
      }
    }

    fetchSubscriptions();
  }, [userId, router]);

  return (
    <div className={`min-h-screen ${containerBg} ${textPrimary}`}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <BreadcrumbsDefault />
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild className={textPrimary}>
            <Link href="/insta/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <AddAccount totalAccounts={totalAccounts} accountLimit={accountLimit} />
      </div>
    </div>
  );
}
