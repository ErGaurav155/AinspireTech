"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Instagram, Briefcase, User, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useAuth } from "@clerk/nextjs";
import { XMarkIcon } from "@heroicons/react/24/solid";
import {
  convertToProfessionalAccount,
  getInstagramAccounts,
  refreshAccessTokenIfNeeded,
} from "@/lib/action/insta.action";
import { IInstagramAccount } from "@/lib/database/models/insta/InstagramAccount.model";

// interface InstagramBasicAccount {
//   instagramId: string;
//   username: string;
//   isProfessional: boolean;
//   accountType: "BUSINESS" | "CREATOR" | "PERSONAL";
// }

// Add FB SDK loading status
type FBStatus = "loading" | "ready" | "error";
interface AccountVerificationProps {
  onVerified: () => void;
}

export const InstagramConnectDialog = ({
  onVerified,
}: AccountVerificationProps) => {
  const router = useRouter();
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string>("");

  const [accounts, setAccounts] = useState<IInstagramAccount[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<IInstagramAccount | null>(null);
  const [accountType, setAccountType] = useState<"BUSINESS" | "CREATOR">(
    "BUSINESS"
  );
  const [conversionStatus, setConversionStatus] = useState<
    "idle" | "converting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [fbStatus, setFbStatus] = useState<FBStatus>("loading");
  const [status, setStatus] = useState<string>(""); // For Facebook login status

  // Wrap fetchInstagramAccounts in useCallback
  const fetchInstagramAccounts = useCallback(
    async (accessToken: string) => {
      if (!userId) {
        router.push("/sign-in");
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const accounts = await getInstagramAccounts(accessToken, userId);
        setAccounts(accounts);
        setIsOpen(true);
      } catch (err: any) {
        setError(err.message || "Failed to fetch Instagram accounts");
        console.error("Instagram account fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, router]
  );

  // Wrap statusChangeCallback in useCallback
  const statusChangeCallback = useCallback(
    (response: any) => {
      if (response.status === "connected") {
        const token = response.authResponse.accessToken;
        setAccessToken(token);
        fetchInstagramAccounts(token);
      } else {
        setStatus("Please log into this webpage.");
      }
    },
    [fetchInstagramAccounts]
  );

  // Initialize Facebook SDK
  useEffect(() => {
    const initFacebookSDK = () => {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
          cookie: true,
          xfbml: true,
          version: "v23.0",
        });

        // Check login status after initialization
        window.FB.getLoginStatus(function (response: any) {
          statusChangeCallback(response);
        });
      };

      // Load the Facebook SDK script
      (function (d, s, id) {
        let js: HTMLScriptElement,
          fjs = d.getElementsByTagName(s)[0]!;
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        js.async = true;
        js.defer = true;
        js.crossOrigin = "anonymous";
        js.onerror = () => setFbStatus("error");
        fjs.parentNode!.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    };

    if (typeof window !== "undefined" && !window.FB) {
      initFacebookSDK();
      setFbStatus("ready");
    } else if (window.FB) {
      setFbStatus("ready");
    }
  }, [statusChangeCallback]);

  const handleInstagramLogin = () => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    if (fbStatus !== "ready") {
      setError("Facebook SDK is not ready. Please try again.");
      return;
    }

    // Use FB.login from the Facebook example
    window.FB.login(
      function (response: any) {
        statusChangeCallback(response);
      },
      {
        scope: "public_profile,instagram_basic,pages_read_engagement",
        return_scopes: true,
      }
    );
  };

  const handleAccountConversion = async () => {
    if (!selectedAccount || !userId || !accessToken) return;

    setConversionStatus("converting");
    setError(null);

    try {
      // Real conversion
      const conversionResponse = await convertToProfessionalAccount(
        selectedAccount.id,
        accountType,
        accessToken
      );

      if (!conversionResponse.success) {
        throw new Error(conversionResponse.error || "Conversion failed");
      }

      // Update in database
      try {
        const response = await fetch("/api/instagram/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            instagramId: selectedAccount.instagramId,
            username: selectedAccount.username,
            isProfessional: true,
            accountType: conversionResponse.accountType,
            accessToken: conversionResponse.accessToken,
            pageId: selectedAccount.pageId,
            pageAccessToken: selectedAccount.pageAccessToken,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create/update account");
        }
        const savedAccount = await response.json();

        if (savedAccount.success && savedAccount.instaAccount) {
          accounts.push(savedAccount.instaAccount);
        }
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
      setConversionStatus("success");
      onVerified();

      // Refresh page data
      setTimeout(() => {
        router.refresh();
        setIsOpen(false);
      }, 2000);
    } catch (err: any) {
      setConversionStatus("error");
      setError(err.message || "Account conversion failed");
      console.error("Conversion error:", err);
    }
  };
  const startAutomation = async (accountId: string) => {
    try {
      const refreshedToken = await refreshAccessTokenIfNeeded(accountId);
      // Use refreshedToken for API calls
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
  };
  return (
    <div className="w-full max-w-md">
      <AlertDialog defaultOpen>
        <AlertDialogContent className="bg-[#0a0a0a]/90 backdrop-blur-lg border border-[#333] rounded-xl max-w-md">
          <div className="flex justify-between items-center">
            <AlertDialogTitle className="text-pink-400">
              Adding Instagram Account
            </AlertDialogTitle>
            <AlertDialogCancel
              onClick={() => router.push(`/`)}
              className="border-0 p-0 hover:bg-transparent text-gray-400 hover:text-white transition-colors self-start bg-[#0a0a0a]/90"
            >
              <XMarkIcon className="h-5 w-6 bg-red-500 cursor-pointer rounded-sm" />
            </AlertDialogCancel>
          </div>
          <AlertDialogHeader>
            <div className="flex justify-between items-center">
              <h3 className="p-16-semibold text-white text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
                Add Linked Insta Account With Facebook Only.
              </h3>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4">
            <Button
              onClick={handleInstagramLogin}
              disabled={isLoading}
              className="w-full py-6 rounded-full font-bold text-lg bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Instagram className="mr-2 h-5 w-5" />
              )}
              Connect Instagram Account
            </Button>

            <div className="text-center text-sm text-gray-400">
              {status && <p className="mb-2">{status}</p>}
              <span className="text-[#00F0FF]">
                IT IS MUST TO PROVIDE BETTER SERVICES
              </span>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#0f0f0f] border border-[#333] rounded-xl text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-white font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">
              {selectedAccount
                ? "Convert to Professional Account"
                : "Select Instagram Account"}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              {selectedAccount
                ? "Choose account type and complete conversion"
                : "Select an account to connect"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400">
              {error}
            </div>
          )}

          {!selectedAccount ? (
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {accounts.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No Instagram accounts found. Please connect an account.
                </p>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setSelectedAccount(account)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      account.isProfessional
                        ? "border-green-500/30 hover:border-green-500"
                        : "border-[#333] hover:border-[#00F0FF]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] p-2 rounded-full">
                          <Instagram className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">
                            @{account.username}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {account.isProfessional
                              ? `Professional ${account.accountType.toLowerCase()}`
                              : "Personal Account"}
                          </p>
                        </div>
                      </div>
                      {account.isProfessional && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#1a1a1a]/50 backdrop-blur-sm p-4 rounded-xl border border-[#333]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] p-2 rounded-full">
                    <Instagram className="h-5 w-5 text-black" />
                  </div>
                  <h4 className="font-bold text-white">
                    @{selectedAccount.username}
                  </h4>
                </div>
                <p className="text-gray-300">
                  {selectedAccount.isProfessional
                    ? "This account is already professional"
                    : "This account needs to be converted to professional"}
                </p>
              </div>

              {!selectedAccount.isProfessional && (
                <>
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-300 text-center">
                      Select Account Type
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 border ${
                          accountType === "BUSINESS"
                            ? "border-[#00F0FF] bg-[#00F0FF]/10"
                            : "border-[#333] hover:border-[#00F0FF]/50"
                        }`}
                        onClick={() => setAccountType("BUSINESS")}
                      >
                        <Briefcase className="h-8 w-8 text-[#00F0FF]" />
                        <span className="text-md font-medium text-white mt-2">
                          Business
                        </span>
                        <p className="text-xs text-center text-gray-400">
                          For brands, businesses, and organizations
                        </p>
                      </div>
                      <div
                        className={`rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 border ${
                          accountType === "CREATOR"
                            ? "border-[#B026FF] bg-[#B026FF]/10"
                            : "border-[#333] hover:border-[#B026FF]/50"
                        }`}
                        onClick={() => setAccountType("CREATOR")}
                      >
                        <User className="h-8 w-8 text-[#B026FF]" />
                        <span className="text-md font-medium text-white mt-2">
                          Creator
                        </span>
                        <p className="text-xs text-center text-gray-400">
                          For influencers, artists, and public figures
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAccountConversion}
                    disabled={conversionStatus === "converting"}
                    className="w-full py-6 rounded-full font-bold text-lg bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90"
                  >
                    {conversionStatus === "converting" ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Briefcase className="mr-2 h-5 w-5" />
                    )}
                    Convert to Professional Account
                  </Button>
                </>
              )}

              {conversionStatus === "success" && (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 text-green-400 text-center">
                  Account converted successfully! Redirecting...
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
