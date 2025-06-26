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

export default function AddAccountPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [buyerId, setBuyerId] = useState(null);

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
        setBuyerId(user._id);
      } catch (error: any) {
        console.error("Error fetching subscriptions:", error.message);
      }
    }

    fetchSubscriptions();
  }, [userId, router]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <BreadcrumbsDefault />
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/insta/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <AddAccount
        onVerified={() => {
          router.push("/insta/accounts");
        }}
        buyerId={buyerId}
      />
    </div>
  );
}
