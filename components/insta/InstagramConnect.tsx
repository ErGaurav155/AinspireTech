"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Script from "next/script";

type AccountType = "PERSONAL" | "CREATOR" | "BUSINESS";
interface AccountVerificationProps {
  onVerified: () => void;
}

export default function InstagramConnectDialog({
  onVerified,
}: AccountVerificationProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [accountType, setAccountType] = useState<AccountType>("PERSONAL");
  const [conversionInProgress, setConversionInProgress] = useState(false);
  const checkLoginStatus = useCallback(() => {
    window.FB.getLoginStatus((response: any) => {
      if (response.status === "connected") {
        setUser(response.authResponse);
        fetchAccounts(response.authResponse);
        setStep(1);
      } else {
        setLoading(false);
      }
    });
  }, []);
  // Initialize Facebook SDK
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });
      checkLoginStatus();
    };
  }, [checkLoginStatus]);

  const handleLogin = () => {
    window.FB.login(
      (response: any) => {
        if (response.status === "connected") {
          setUser(response.authResponse);
          fetchAccounts(response.authResponse);
          setStep(1);
        }
      },
      { scope: "instagram_basic,instagram_content_publish,pages_show_list" }
    );
  };

  const fetchAccounts = async (authResponse: any) => {
    try {
      const res = await axios.get(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${authResponse.accessToken}`
      );

      const instagramAccounts = await Promise.all(
        res.data.data.map(async (page: any) => {
          try {
            const igRes = await axios.get(
              `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
            );
            if (igRes.data.instagram_business_account) {
              return {
                ...page,
                instagramAccount: igRes.data.instagram_business_account,
              };
            }
          } catch (error) {
            console.error(
              `Error fetching Instagram account for page ${page.id}:`,
              error
            );
          }
          return null;
        })
      );

      setAccounts(instagramAccounts.filter(Boolean));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setLoading(false);
    }
  };

  const checkAccountType = async (account: any) => {
    setSelectedAccount(account);
    setLoading(true);

    try {
      const res = await axios.get(
        `https://graph.facebook.com/v18.0/${account.instagramAccount.id}?fields=account_type&access_token=${account.access_token}`
      );

      const type = res.data.account_type as AccountType;
      if (type === "PERSONAL") {
        setStep(2);
      } else {
        setAccountType(type);
        setStep(3);
      }
    } catch (error) {
      console.error("Error checking account type:", error);
      setStep(2);
    }

    setLoading(false);
  };

  const convertToProfessional = async (type: "CREATOR" | "BUSINESS") => {
    setConversionInProgress(true);

    try {
      // This is a simulated conversion - real implementation requires user action
      // For demo purposes, we'll just update the account type
      setAccountType(type);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStep(3);
    } catch (error) {
      console.error("Conversion error:", error);
    }

    setConversionInProgress(false);
  };

  const saveAccountToDB = async () => {
    setLoading(true);

    try {
      await axios.post("/api/accounts", {
        userId: "user_id_from_session", // Replace with actual user ID
        instagramId: selectedAccount.instagramAccount.id,
        username: selectedAccount.name,
        accessToken: selectedAccount.access_token,
        accountType,
        facebookId: selectedAccount.id,
      });
      onVerified();
      setStep(4);
    } catch (error) {
      console.error("Saving failed:", error);
    }

    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center p-8">
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Loading..." : "Login with Facebook"}
            </button>
          </div>
        );

      case 1:
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Connected Accounts</h2>
            {accounts.length === 0 ? (
              <p className="text-gray-500">No Instagram accounts found</p>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="border p-4 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => checkAccountType(account)}
                  >
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-gray-500">
                      ID: {account.instagramAccount.id}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Account Type: Personal</h2>
            <p className="mb-6 text-gray-600">
              Please convert to professional account to continue
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => convertToProfessional("CREATOR")}
                disabled={conversionInProgress}
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {conversionInProgress ? "Converting..." : "Convert to Creator"}
              </button>
              <button
                onClick={() => convertToProfessional("BUSINESS")}
                disabled={conversionInProgress}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {conversionInProgress ? "Converting..." : "Convert to Business"}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Account Ready</h2>
            <p className="mb-6 text-gray-600">
              {accountType === "CREATOR" ? "Creator" : "Business"} account
              connected
            </p>
            <button
              onClick={saveAccountToDB}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Account"}
            </button>
          </div>
        );

      case 4:
        return (
          <div className="p-6 text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-md">
              <h2 className="text-xl font-bold mb-2">Success!</h2>
              <p>Account connected and saved successfully</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="lazyOnload"
      />

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <h1 className="text-lg font-bold">Instagram Account Connection</h1>
      </div>

      <div className="min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="flex-1">{renderStep()}</div>
        )}

        {step > 0 && step < 4 && (
          <div className="p-4 border-t flex justify-between items-center">
            <button
              onClick={() => setStep(step - 1)}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              disabled={loading || conversionInProgress}
            >
              &larr; Back
            </button>
            <div className="text-sm text-gray-500">Step {step} of 4</div>
          </div>
        )}
      </div>
    </div>
  );
}
