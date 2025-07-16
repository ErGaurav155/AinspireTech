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
import {
  Loader2,
  Instagram,
  Briefcase,
  User,
  Check,
  UserPlus,
  LogOut,
} from "lucide-react";
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
} from "@/lib/action/insta.action";
import { IInstagramAccount } from "@/lib/database/models/insta/InstagramAccount.model";

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
  const [cachedAccounts, setCachedAccounts] = useState<any[]>([]);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [userData, setUserData] = useState<any>(null);

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
  const [status, setStatus] = useState<string>("");

  // Fetch Instagram accounts
  const fetchInstagramAccounts = useCallback(
    async (token: string) => {
      if (!userId) {
        router.push("/sign-in");
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const accounts = await getInstagramAccounts(token, userId);
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

  // Facebook status change callback
  const statusChangeCallback = useCallback(
    (response: any) => {
      if (response.status === "connected") {
        const token = response.authResponse.accessToken;
        setAccessToken(token);

        // Get user info
        window.FB.api("/me", (userResponse: any) => {
          if (userResponse && !userResponse.error) {
            setUserData(userResponse);
            setStatus(`Welcome, ${userResponse.name}!`);
          }
        });

        // Get connected accounts
        window.FB.api("/me/accounts", (accountsResponse: any) => {
          setCachedAccounts(accountsResponse.data || []);
        });

        fetchInstagramAccounts(token);
      } else {
        setStatus("Please log in to continue");
      }
    },
    [fetchInstagramAccounts]
  );

  // Initialize Facebook SDK
  useEffect(() => {
    const initFacebookSDK = () => {
      // Only initialize in secure contexts
      if (
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
        setFbStatus("error");
        setError(
          "Facebook login requires HTTPS. Please use secure connection."
        );
        return;
      }

      window.fbAsyncInit = function () {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
          cookie: true,
          xfbml: true,
          version: "v23.0",
        });

        // Check login status only in secure contexts
        if (
          window.location.protocol === "https:" ||
          window.location.hostname === "localhost"
        ) {
          window.FB.getLoginStatus(statusChangeCallback, true);
        }

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
        js.async = true;
        js.defer = true;
        js.crossOrigin = "anonymous";
        js.onerror = () => setFbStatus("error");
        fjs.parentNode!.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    };

    if (typeof window !== "undefined" && !window.FB) {
      initFacebookSDK();
    } else if (window.FB) {
      setFbStatus("ready");
    }
  }, [statusChangeCallback]);

  // Handle Instagram login with account switching options
  const handleInstagramLogin = (useCached: boolean = false) => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    if (fbStatus !== "ready") {
      setError("Facebook SDK is not ready. Please try again.");
      return;
    }

    window.FB.login(statusChangeCallback, {
      scope: "public_profile,instagram_basic,pages_read_engagement",
      return_scopes: true,
      auth_type: useCached ? undefined : "reauthenticate",
      enable_profile_selector: true,
    });
  };

  // Handle Facebook logout
  const handleLogout = () => {
    window.FB.logout(() => {
      setCachedAccounts([]);
      setUserData(null);
      setStatus("Please log in again");
    });
  };

  // Handle account conversion to professional
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
            instagramId: selectedAccount.id,
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
        setConversionStatus("success");
        onVerified();

        // Refresh page data
        setTimeout(() => {
          router.refresh();
          setIsOpen(false);
        }, 2000);
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    } catch (err: any) {
      setConversionStatus("error");
      setError(err.message || "Account conversion failed");
      console.error("Conversion error:", err);
    }
  };

  // Select account from cached accounts
  const selectAccount = (account: any) => {
    // For demo purposes - in real app you'd switch tokens
    setStatus(`Selected account: ${account.name}`);
    setShowAccountSelector(false);
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
            {showAccountSelector ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cachedAccounts.length > 0 ? (
                  <>
                    {cachedAccounts.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => selectAccount(account)}
                        className="p-3 rounded-lg border border-gray-700 hover:border-[#00F0FF] cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                          <div>
                            <h4 className="font-bold">{account.name}</h4>
                            <p className="text-sm text-gray-400">
                              {account.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      onClick={() => handleInstagramLogin(false)}
                      className="w-full mt-4"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add New Account
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">No connected accounts found</p>
                    <Button
                      onClick={() => handleInstagramLogin(false)}
                      className="w-full mt-4"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add New Account
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  onClick={() => setShowAccountSelector(true)}
                  disabled={isLoading || cachedAccounts.length === 0}
                  className={`w-full py-6 rounded-full font-bold text-lg ${
                    cachedAccounts.length === 0
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90"
                  }`}
                >
                  <User className="mr-2 h-5 w-5" />
                  Switch Account
                </Button>

                <Button
                  onClick={() => handleInstagramLogin(true)}
                  disabled={isLoading}
                  className="w-full py-6 rounded-full font-bold text-lg bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90"
                >
                  <Instagram className="mr-2 h-5 w-5" />
                  Continue as {userData?.name || "Current User"}
                </Button>
              </>
            )}

            {cachedAccounts.length > 0 && (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full text-red-500 border-red-500 hover:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout All Accounts
              </Button>
            )}

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
