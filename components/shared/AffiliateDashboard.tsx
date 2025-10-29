// components/AffiliateDashboard.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { getAffiliateStats } from "@/lib/action/affiliate.action";

interface AffiliateStats {
  affiliate: {
    affiliateCode: string;
    totalEarnings: number;
    earnedBalance: number;
    totalReferrals: number;
  };
  referrals: Array<{
    amount: number;
    commission: number;
    createdAt: string;
    isPaid: boolean;
  }>;
}

export function AffiliateDashboard() {
  const { userId } = useAuth();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      if (userId) {
        const data = await getAffiliateStats(userId);
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading affiliate stats:", error);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadStats();
    }
  }, [userId, loadStats]);

  const affiliateLink = stats
    ? `${window.location.origin}/web/pricing?affiliate=${stats.affiliate.affiliateCode}`
    : "";

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>No affiliate account found</div>;

  return (
    <div className="p-6 space-y-6 ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Earnings</h3>
          <p className="text-2xl font-bold">
            ${stats.affiliate.totalEarnings.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Available Balance</h3>
          <p className="text-2xl font-bold">
            ${stats.affiliate.earnedBalance.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Referrals</h3>
          <p className="text-2xl font-bold">{stats.affiliate.totalReferrals}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Your Affiliate Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={affiliateLink}
            readOnly
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => navigator.clipboard.writeText(affiliateLink)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Copy
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Earn 50% commission on the first payment when someone subscribes using
          your link!
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Referral History</h3>
        {stats.referrals.length === 0 ? (
          <p>No referrals yet</p>
        ) : (
          <div className="space-y-2">
            {stats.referrals.map((referral, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 border-b"
              >
                <div>
                  <p className="font-medium">${referral.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(referral.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">
                    +${referral.commission.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {referral.isPaid ? "Paid" : "Pending"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
