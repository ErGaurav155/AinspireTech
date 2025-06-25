"use client";

import { useState } from "react";
import { ArrowLeft, Instagram, Shield, AlertCircle } from "lucide-react";
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
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddAccountPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/insta/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

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
          Terms of Service, we recommend using Instagram official Business API.
          Direct password authentication may result in account restrictions.
        </AlertDescription>
      </Alert>

      <Card className="card-hover group">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Enter your Instagram account details. We use secure encryption to
            protect your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 ">
              <Label htmlFor="username">Instagram Username</Label>
              <Input
                id="username"
                type="text"
                className="card-hover group"
                placeholder="Enter your username (without @)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter your Instagram username without the @ symbol
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name (Optional)</Label>
              <Input
                id="displayName"
                type="text"
                className="card-hover group"
                placeholder="How you'd like this account to be displayed"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <Alert className="card-hover group">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Demo Mode:</strong> This is a demonstration version. In
                production, you would integrate with Instagram official Business
                API or use OAuth authentication for secure account connection.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 md:gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
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
          </form>
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
          <p>
            ⚡ We recommend using Instagram Business API for production
            applications
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
