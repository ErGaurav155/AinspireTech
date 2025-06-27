// components/instagram/InstagramConnectDialog.tsx
"use client";

import { useState, useEffect } from "react";
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
  getInstagramAccounts,
  convertToProfessionalAccount,
  createOrUpdateInsta,
} from "@/lib/action/insta.action";
import { useAuth } from "@clerk/nextjs";

interface InstagramBasicAccount {
  id: string;
  username: string;
  isProfessional: boolean;
  accountType: "BUSINESS" | "CREATOR" | "PERSONAL";
}

// Add FB SDK loading status
type FBStatus = "loading" | "ready" | "error";
interface AccountVerificationProps {
  onVerified: () => void;
  buyerId: string;
}
export const InstagramConnectDialog = ({
  onVerified,
  buyerId,
}: AccountVerificationProps) => {
  const router = useRouter();
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<InstagramBasicAccount[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InstagramBasicAccount | null>(null);
  const [accountType, setAccountType] = useState<"BUSINESS" | "CREATOR">(
    "BUSINESS"
  );
  const [conversionStatus, setConversionStatus] = useState<
    "idle" | "converting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [fbStatus, setFbStatus] = useState<FBStatus>("loading");

  // Initialize Facebook SDK
  useEffect(() => {
    const initFacebookSDK = () => {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
          cookie: true,
          xfbml: true,
          version: "v18.0",
        });
        setFbStatus("ready");
      };

      // Load the Facebook SDK script
      (function (d, s, id) {
        let js: HTMLScriptElement,
          fjs = d.getElementsByTagName(s)[0]!;
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        js.onerror = () => setFbStatus("error");
        fjs.parentNode!.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    };

    if (typeof window !== "undefined" && !window.FB) {
      initFacebookSDK();
    } else if (window.FB) {
      setFbStatus("ready");
    }
  }, []);

  const handleInstagramLogin = async () => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    if (fbStatus !== "ready") {
      setError("Facebook SDK is not ready. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Authenticate with Facebook
      const response: any = await new Promise((resolve) => {
        window.FB.login(resolve, {
          scope: "instagram_basic,pages_show_list,business_management",
          return_scopes: true,
        });
      });

      if (!response.authResponse) {
        throw new Error("User cancelled login or did not fully authorize.");
      }

      const accessToken = response.authResponse.accessToken;

      // Step 2: Get connected Instagram accounts
      const accounts = await getInstagramAccounts(accessToken);
      setAccounts(accounts);
      setIsOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to connect to Instagram");
      console.error("Instagram login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountConversion = async () => {
    if (!selectedAccount || !userId) return;

    setConversionStatus("converting");
    setError(null);

    try {
      // Step 3: Convert account to professional
      const conversionResponse = await convertToProfessionalAccount(
        selectedAccount.id,
        accountType
      );

      if (!conversionResponse.success) {
        throw new Error(conversionResponse.error || "Conversion failed");
      }

      // Step 4: Update Instagram account in MongoDB
      await createOrUpdateInsta({
        userId: buyerId,
        instagramId: selectedAccount.id,
        instagramUsername: selectedAccount.username,
        isProfessional: true,
        accountType: conversionResponse.accountType!,
        accessToken: conversionResponse.accessToken!,
      });

      setConversionStatus("success");
      await onVerified();
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
  return (
    <div className="w-full max-w-md">
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
