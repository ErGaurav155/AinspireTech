"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Circle,
  ArrowLeft,
  ArrowRight,
  Instagram,
  Facebook,
  AlertCircle,
  User,
  Building,
  Crown,
  Loader2,
  Router,
} from "lucide-react";
import {
  initializeFacebookSDK,
  checkFacebookLoginStatus,
  loginWithFacebook,
  getUserPages,
  getInstagramAccount,
  getInstagramAccountInfo,
  convertAccountType,
} from "@/lib/facebook-sdk";
import {
  FacebookLoginResponse,
  InstagramAccount,
  FacebookPage,
  ProcessStep,
  AccountTypeConversion,
} from "@/types/types";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/solid";

const InstagramAutomationWizard = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [facebookAccessToken, setFacebookAccessToken] = useState<string>("");
  const [facebookUser, setFacebookUser] = useState<any>(null);
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([]);
  const [instagramAccounts, setInstagramAccounts] = useState<
    InstagramAccount[]
  >([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InstagramAccount | null>(null);
  const [showAccountTypeDialog, setShowAccountTypeDialog] =
    useState<boolean>(false);
  const [showInstagramConnectionDialog, setShowInstagramConnectionDialog] =
    useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const steps: ProcessStep[] = [
    {
      id: 1,
      title: "Facebook Login",
      description: "Connect your Facebook account",
      completed: false,
      current: true,
    },
    {
      id: 2,
      title: "Instagram Connection",
      description: "Verify Instagram account connection",
      completed: false,
      current: false,
    },
    {
      id: 3,
      title: "Account Type Check",
      description: "Ensure professional account type",
      completed: false,
      current: false,
    },
    {
      id: 4,
      title: "Account Selection",
      description: "Choose Instagram account to use",
      completed: false,
      current: false,
    },
    {
      id: 5,
      title: "Setup Complete",
      description: "Account configured successfully",
      completed: false,
      current: false,
    },
  ];

  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(steps);
  const [showCancelSubDialog, setShowCancelSubDialog] = useState(true);

  const { userId } = useAuth();
  const router = useRouter();

  const updateStepStatus = useCallback(
    (stepIndex: number, completed: boolean) => {
      setProcessSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          completed: index === stepIndex ? completed : step.completed,
          current: index === stepIndex + 1,
        }))
      );
    },
    []
  );
  const checkInstagramConnection = useCallback(
    async (accessToken: string) => {
      setLoading(true);

      try {
        const pagesResponse = await getUserPages(accessToken);
        const pages = pagesResponse.data;
        setFacebookPages(pages);

        const instagramAccountsData: InstagramAccount[] = [];

        for (const page of pages) {
          try {
            const instagramResponse = await getInstagramAccount(
              page.id,
              page.access_token
            );

            if (instagramResponse.instagram_business_account) {
              const instagramInfo = await getInstagramAccountInfo(
                instagramResponse.instagram_business_account.id,
                page.access_token
              );

              instagramAccountsData.push({
                id: instagramResponse.instagram_business_account.id,
                username: instagramInfo.username,
                account_type: instagramInfo.account_type,
                media_count: instagramInfo.media_count,
                followers_count: instagramInfo.followers_count,
                name: instagramInfo.name,
                profile_picture_url: instagramInfo.profile_picture_url,
              });
            }
          } catch (error) {
            console.error(
              `Error fetching Instagram account for page ${page.id}:`,
              error
            );
          }
        }

        if (instagramAccountsData.length === 0) {
          setShowInstagramConnectionDialog(true);
          return;
        }

        setInstagramAccounts(instagramAccountsData);
        updateStepStatus(1, true);
        setCurrentStep(2);

        // Check account types
        const personalAccounts = instagramAccountsData.filter(
          (acc) => acc.account_type === "PERSONAL"
        );
        if (personalAccounts.length > 0) {
          setSelectedAccount(personalAccounts[0]);
          setShowAccountTypeDialog(true);
        } else {
          setCurrentStep(3);
          updateStepStatus(2, true);
        }
      } catch (error) {
        setError("Failed to check Instagram connection");
      } finally {
        setLoading(false);
      }
    },
    [updateStepStatus]
  );
  const proceedWithExistingLogin = useCallback(
    async (accessToken: string) => {
      setLoading(true);
      try {
        const userInfo = await window.FB.api("/me", {
          access_token: accessToken,
        });
        setFacebookUser(userInfo);
        updateStepStatus(0, true);
        await checkInstagramConnection(accessToken);
      } catch (error) {
        setError("Failed to get user information");
      } finally {
        setLoading(false);
      }
    },
    [updateStepStatus, checkInstagramConnection]
  );
  const checkExistingLogin = useCallback(async () => {
    try {
      const response = await checkFacebookLoginStatus();
      if (response.status === "connected") {
        setFacebookAccessToken(response.authResponse.accessToken);
        await proceedWithExistingLogin(response.authResponse.accessToken);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  }, [proceedWithExistingLogin]);

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
    }
    initializeFacebookSDK().then(() => {
      setIsInitialized(true);
      checkExistingLogin();
    });
  }, [checkExistingLogin, router, userId]);

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await loginWithFacebook();
      console.log("Facebook login response:", response);
      if (response.status === "connected") {
        setFacebookAccessToken(response.authResponse.accessToken);
        console.log("Facebook login successful:", response);
        console.log(
          "Facebook Access token :",
          response.authResponse.accessToken
        );

        const userInfo = await window.FB.api("/me", {
          access_token: response.authResponse.accessToken,
        });
        console.log("Facebook user info:", userInfo);
        setFacebookUser(userInfo);
        updateStepStatus(0, true);
        await checkInstagramConnection(response.authResponse.accessToken);
      } else {
        setError("Facebook login failed");
      }
    } catch (error) {
      setError("Failed to login with Facebook");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountTypeConversion = async (
    newAccountType: "BUSINESS" | "CREATOR"
  ) => {
    if (!selectedAccount) return;

    setLoading(true);
    setError("");

    try {
      const pageForAccount = facebookPages.find((page) => {
        // Find the page associated with this Instagram account
        return true; // You'll need to implement proper mapping
      });

      if (!pageForAccount) {
        throw new Error("Could not find associated Facebook page");
      }

      const response = await fetch("/api/instagram/convert-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instagramAccountId: selectedAccount.id,
          accountType: newAccountType,
          accessToken: pageForAccount.access_token,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to convert account type");
      }

      // Update the account type in our state
      setInstagramAccounts((prev) =>
        prev.map((acc) =>
          acc.id === selectedAccount.id
            ? { ...acc, account_type: newAccountType }
            : acc
        )
      );

      setShowAccountTypeDialog(false);
      updateStepStatus(2, true);
      setCurrentStep(3);
    } catch (error) {
      setError("Failed to convert account type");
    } finally {
      setLoading(false);
    }
  };

  const saveAccountToDatabase = async (account: InstagramAccount) => {
    try {
      const pageForAccount = facebookPages.find((page) => {
        // Find the page associated with this Instagram account
        return true; // You'll need to implement proper mapping
      });

      const response = await fetch("/api/instagram/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          instagramId: account.id,
          username: account.username,
          isProfessional: account.account_type !== "PERSONAL",
          accountType: account.account_type,
          accessToken: facebookAccessToken,
          displayName: account.name,
          profilePicture: account.profile_picture_url,
          followersCount: account.followers_count,
          postsCount: account.media_count,
          pageId: pageForAccount?.id,
          pageAccessToken: pageForAccount?.access_token,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save account");
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving account:", error);
      throw error;
    }
  };

  const handleAccountSelection = async (account: InstagramAccount) => {
    setLoading(true);
    setError("");

    try {
      await saveAccountToDatabase(account);
      setSelectedAccount(account);
      updateStepStatus(3, true);
      setCurrentStep(4);
      updateStepStatus(4, true);
    } catch (error) {
      setError("Failed to save account");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < processSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = processSteps.filter((step) => step.completed).length;
    return (completedSteps / processSteps.length) * 100;
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing Facebook SDK...</p>
        </div>
      </div>
    );
  }

  return (
    <AlertDialog
      open={showCancelSubDialog}
      onOpenChange={setShowCancelSubDialog}
    >
      <AlertDialogContent className="p-2   max-h-[98vh] backdrop-blur-md max-w-4xl w-full  overflow-y-auto mx-auto  ">
        {" "}
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
        <Card className="p-2  border-none">
          <CardHeader className="p-0">
            <CardDescription>
              Connect your Instagram account for comment automation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(getProgressPercentage())}% Complete
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            <div className="flex  flex-wrap   items-start justify-start gap-8">
              {processSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex flex-auto items-center  gap-4"
                >
                  <div
                    className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : step.current
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }
                `}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        step.current ? "text-blue-600" : ""
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {step.completed && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Completed
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step Content */}
            <div className="min-h-[300px]">
              {currentStep === 0 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mt-2 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Facebook className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Connect Facebook Account
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {facebookUser ? (
                        <>
                          Welcome back, {facebookUser.name}! You can continue
                          with your current account or login with a different
                          one.
                        </>
                      ) : (
                        <>
                          To access your Instagram account, we need to connect
                          through Facebook first.
                        </>
                      )}
                    </p>
                    {facebookUser && (
                      <div className="bg-green-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              Already connected as {facebookUser.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              You can continue or login with a different account
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-4 justify-center">
                      {facebookUser ? (
                        <>
                          <Button
                            onClick={() => {
                              updateStepStatus(0, true);
                              setCurrentStep(1);
                            }}
                            className="px-8"
                          >
                            Continue with {facebookUser.name}
                          </Button>
                          <Button
                            onClick={handleFacebookLogin}
                            variant="outline"
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Login with Different Account
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={handleFacebookLogin}
                          disabled={loading}
                          className="px-8"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          Login with Facebook
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mt-2 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Instagram className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Instagram Connection
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Checking for Instagram accounts connected to your Facebook
                      account...
                    </p>
                    {loading && (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Checking Instagram connections...</span>
                      </div>
                    )}
                    {instagramAccounts.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="font-medium text-green-800">
                          Found {instagramAccounts.length} Instagram account(s)
                          connected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mt-2 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <Building className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Account Type Verification
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Checking if your Instagram account is set up for business
                      use...
                    </p>
                    {loading && (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying account type...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mt-2 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Select Instagram Account
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Choose the Instagram account you want to use for
                      automation
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {instagramAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              {account.profile_picture_url ? (
                                <Image
                                  height={48}
                                  width={48}
                                  src={account.profile_picture_url}
                                  alt={account.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">
                                @{account.username}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {account.name || "Instagram Account"}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-muted-foreground">
                                  {account.followers_count?.toLocaleString()}{" "}
                                  followers
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {account.media_count} posts
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                account.account_type === "PERSONAL"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={
                                account.account_type === "PERSONAL"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : ""
                              }
                            >
                              {account.account_type}
                            </Badge>
                            <Button
                              onClick={() => handleAccountSelection(account)}
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : null}
                              Select
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mt-2 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Setup Complete!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Your Instagram account has been successfully connected and
                      configured for automation.
                    </p>
                    {selectedAccount && (
                      <div className="bg-green-50 p-6 rounded-lg">
                        <div className="flex items-center gap-4 justify-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-800">
                              @{selectedAccount.username}
                            </h4>
                            <p className="text-sm text-green-600">
                              Ready for automation
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div className="flex items-center justify-between gap-3">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0 || loading}
                variant="outline"
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4 " />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {processSteps.length}
                </span>
              </div>

              <Button
                onClick={handleNext}
                disabled={currentStep === processSteps.length - 1 || loading}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Instagram Connection Dialog */}
        <Dialog
          open={showInstagramConnectionDialog}
          onOpenChange={setShowInstagramConnectionDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Instagram className="w-5 h-5" />
                Instagram Connection Required
              </DialogTitle>
              <DialogDescription>
                No Instagram account found connected to your Facebook account.
                Please connect your Instagram account to Facebook first.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">
                  How to connect Instagram to Facebook:
                </h4>
                <ol className="text-sm space-y-1 text-muted-foreground">
                  <li>1. Open Instagram app on your phone</li>
                  <li>2. Go to Settings → Account → Linked Accounts</li>
                  <li>3. Select Facebook and link your accounts</li>
                  <li>4. Return here and try again</li>
                </ol>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowInstagramConnectionDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowInstagramConnectionDialog(false);
                    checkInstagramConnection(facebookAccessToken);
                  }}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Account Type Conversion Dialog */}
        <Dialog
          open={showAccountTypeDialog}
          onOpenChange={setShowAccountTypeDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Convert to Professional Account
              </DialogTitle>
              <DialogDescription>
                Your Instagram account is currently set to Personal. To use
                automation features, you need to convert it to a Professional
                account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will change your account type permanently. You can switch
                  back to Personal later if needed.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Choose account type:</h4>

                <Button
                  onClick={() => handleAccountTypeConversion("BUSINESS")}
                  disabled={loading}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Business</div>
                      <div className="text-sm text-muted-foreground">
                        For businesses, brands, and organizations
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleAccountTypeConversion("CREATOR")}
                  disabled={loading}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Creator</div>
                      <div className="text-sm text-muted-foreground">
                        For public figures, artists, and content creators
                      </div>
                    </div>
                  </div>
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowAccountTypeDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InstagramAutomationWizard;
