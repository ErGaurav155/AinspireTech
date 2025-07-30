"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Instagram, Shield, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginPage from "./InstagramAutomationWizard";
interface AccountVerificationProps {
  onVerified: () => void;
  buyerId: string | null;
}
const AddAccount = ({ onVerified, buyerId }: AccountVerificationProps) => {
  const [username, setUsername] = useState("");
  const [isLoad, setIsLoad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  //   onVerified();

  //   // Simulate API call
  //   setTimeout(() => {
  //     setIsSubmitting(false);
  //     router.push("/dashboard");
  //   }, 2000);
  // };
  return (
    <div>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-pink-100 rounded-full flex items-center justify-center">
            <Instagram className="h-8 w-8 text-pink-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Connect Instagram Account</h1>
        <p className="text-muted-foreground">
          Add your Instagram account to start automating comment replies
        </p>
      </div>

      {/* Important Notice */}
      <Alert className="mb-6 card-hover group">
        <Shield className="h-4 w-4" />
        <AlertDescription className="">
          <strong>Important:</strong> For security and compliance with Instagram
          Terms of Service, we are using Instagram official Business API.So Dont
          Worry about Password,We did not get your Instagram provide us only
          access key not your Password.
        </AlertDescription>
      </Alert>

      <Card className="card-hover group">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Enter your Instagram account details. We use secure encryption to
            protect your Access key.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          {isLoad && <LoginPage />}

          <div className="flex gap-2 md:gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => setIsLoad(true)}
              className="flex-1"
            >
              {isSubmitting ? "Connecting..." : "Connect Account"}
            </Button>
            <Button
              className="card-hover group"
              type="button"
              variant="outline"
              asChild
            >
              <Link href="/insta/dashboard">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card className="mt-6 card-hover group">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground p-2">
          <p>
            🔒 All account credentials are encrypted using industry-standard
            AES-256 encryption
          </p>
          <p>
            🛡️ We follow Instagram rate limiting guidelines to protect your
            account
          </p>
          <p>
            🔐 Your data is stored securely and never shared with third parties
          </p>
          <p>⚡ We are using Instagram Business API for our applications</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAccount;
