Create a new file named `.env.local` in the root of your project and add the following content:

```env
#NEXT
NEXT_PUBLIC_SERVER_URL=

#MONGODB
MONGODB_URL=

#CLERK
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

#CLOUDINARY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

#STRIPE
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Replace the placeholder values with your actual respective account credentials. You can obtain these credentials by signing up on the [Clerk](https://clerk.com/), [MongoDB](https://www.mongodb.com/), [Cloudinary](https://cloudinary.com/) and [Stripe](https://stripe.com)

```bash
npm run dev
```

scripting.ts
import puppeteer from "puppeteer";
import fs from "fs/promises";

// Your sitemap data (this is from the Next.js `sitemap.ts` file you provided)
const sitemapData = [
{
url: "https://pathology-pink.vercel.app/",
lastModified: new Date(),
changeFrequency: "yearly",
priority: 1,
},
{
url: "https://pathology-pink.vercel.app/admin",
lastModified: new Date(),
changeFrequency: "weekly",
priority: 1,
},
{
url: "https://pathology-pink.vercel.app/Appointment",
lastModified: new Date(),
changeFrequency: "weekly",
priority: 1,
},
{
url: "https://pathology-pink.vercel.app/contactUs",
lastModified: new Date(),
changeFrequency: "weekly",
priority: 1,
},
{
url: "https://pathology-pink.vercel.app/Doctors",
lastModified: new Date(),
changeFrequency: "weekly",
priority: 1,
},
{
url: "https://pathology-pink.vercel.app/faq",
lastModified: new Date(),
changeFrequency: "weekly",
priority: 1,
},
{
url: "https://pathology-pink.vercel.app/Gallery",
lastModified: new Date(),
changeFrequency: "weekly",
priority: 1,
},
{
url: "https://pathology-pink.vercel.app/PathTest",
lastModified: new Date(),
changeFrequency: "weekly",
priority: 1,
},
{
url: "https://pathology-pink.vercel.app/privacy-policy",
lastModified: new Date(),
changeFrequency: "weekly",
priority: 1,
},
{
url: "https://pathology-pink.vercel.app/TermsandCondition",
lastModified: new Date(),
changeFrequency: "weekly",
priority: 1,
},
{
url: "https://pathology-pink.vercel.app/Testimonials",
lastModified: new Date(),
changeFrequency: "weekly",
priority: 1,
},
];

// Extract all URLs into an array
const urls = sitemapData.map((page) => page.url);

// Function to scrape data from a page
const scrapePage = async (url: string) => {
const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.goto(url, { waitUntil: "domcontentloaded" });

const scrapedData = await page.evaluate(() => {
const title = document.title;
const description = document
.querySelector("meta[name='description']")
?.getAttribute("content");
const headings = Array.from(document.querySelectorAll("h1, h2, h3")).map(
(h) => h.textContent
);
const content = document.body.innerText;

    return { title, description, headings, content };

});

await browser.close();
return { url, ...scrapedData };
};

// Function to scrape all pages from the sitemap URLs
export const scrapeSitemapPages = async () => {
const allPageData = [];

// Loop through each URL and scrape the page content
for (const url of urls) {
const pageContent = await scrapePage(url);
allPageData.push(pageContent);
}

// Store all scraped data into one file
await fs.writeFile("scrapedData.json", JSON.stringify(allPageData, null, 2));
};

// Run the scraping process

// Next.js Project Structure Overview
// - /app
// - /api
// - agent/route.ts (AI Agent API Handler)
// - /dashboard/page.tsx (User Dashboard)
// - /components
// - EmbedCode.tsx (Generates embeddable script)
// - /models
// - Subscription.ts (Mongoose Subscription Model)
// - /lib
// - dbConnect.ts (MongoDB Connection)
// - /utils
// - jwt.ts (Token Generation & Verification)
// - /middleware.ts (Clerk Middleware Integration)

// 1. dbConnect.ts - MongoDB Connection
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
throw new Error('MONGODB_URI is not defined');
}

let cached = (global as any).mongoose || null;

if (!cached) {
cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
if (cached.conn) return cached.conn;

if (!cached.promise) {
cached.promise = mongoose.connect(MONGODB_URI, {
bufferCommands: false,
}).then((mongoose) => mongoose);
}
cached.conn = await cached.promise;
return cached.conn;
}

export default dbConnect;

// 2. Subscription.ts - Mongoose Subscription Model
import mongoose, { Schema, model, models } from 'mongoose';

const SubscriptionSchema = new Schema({
userId: { type: String, required: true },
agentId: { type: String, required: true },
expiresAt: { type: Date, required: true },
}, { timestamps: true });

const Subscription = models.Subscription || model('Subscription', SubscriptionSchema);
export default Subscription;

// 3. jwt.ts - JWT Utilities
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

export function generateToken(userId: string, agentId: string) {
return jwt.sign({ userId, agentId }, JWT_SECRET, { expiresIn: '1h' });
}

export function verifyToken(token: string) {
try {
return jwt.verify(token, JWT_SECRET);
} catch (error) {
return null;
}
}

// 4. route.ts - AI Agent API Handler (App Router)
import { currentUser } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Subscription from '../../../models/Subscription';

export async function POST(req: NextRequest) {
await dbConnect();
const user = await currentUser();
if (!user) {
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const { agentId } = await req.json();
const subscription = await Subscription.findOne({ userId: user.id, agentId });

if (!subscription || new Date() > subscription.expiresAt) {
return NextResponse.json({ error: 'Subscription expired' }, { status: 403 });
}

const response = await fetch('https://api.openai.com/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
'Content-Type': 'application/json',
},
body: JSON.stringify(req.body),
});

const data = await response.json();
return NextResponse.json(data);
}

// 5. EmbedCode.tsx - Embeddable Code Component
import React from 'react';

interface EmbedCodeProps {
userId: string;
agentId: string;
}

const EmbedCode: React.FC<EmbedCodeProps> = ({ userId, agentId }) => {
const token = generateToken(userId, agentId);
const embedCode = `<script src="https://yourwebsite.com/api/agent" data-token="${token}"></script>`;

return (

<div>
<h3>Embed Code:</h3>
<textarea
        readOnly
        className="w-full p-2 border rounded"
        value={embedCode}
        rows={4}
      />
</div>
);
};

export default EmbedCode;

// 6. page.tsx - User Dashboard (App Router)
import dbConnect from '../../lib/dbConnect';
import Subscription from '../../models/Subscription';
import EmbedCode from '../../components/EmbedCode';
import { currentUser } from '@clerk/nextjs';

export default async function Dashboard() {
await dbConnect();
const user = await currentUser();
if (!user) return <p>Unauthorized</p>;

const subscriptions = await Subscription.find({ userId: user.id });
return (

<div className="p-6">
<h1 className="text-2xl font-bold">Your Subscriptions</h1>
{subscriptions.map((sub: any) => (
<EmbedCode key={sub._id} userId={sub.userId} agentId={sub.agentId} />
))}
</div>
);
}

// 7. middleware.ts - Clerk Middleware
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
publicRoutes: ['/'],
afterAuth(auth, req) {
if (!auth.userId && !req.nextUrl.pathname.startsWith('/api')) {
return NextResponse.redirect('/sign-in');
}
},
});

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast"; // Assuming you have a toast utility
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
AlertDialog,
AlertDialogCancel,
AlertDialogContent,
AlertDialogDescription,
AlertDialogHeader,
AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Script from "next/script";

const formSchema = z.object({
websiteUrl: z.string().url("Invalid URL").min(1, "Website URL is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CheckoutProps {
amount: number;
razorpayplanId: string;
paypalplanId: string;
buyerId: string;
productId: string;
}
const NEXT_PUBLIC_PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

export const Checkout = ({
amount,
razorpayplanId,
paypalplanId,
buyerId,
productId,
}: CheckoutProps) => {
const router = useRouter();
const [isSubmitting, setIsSubmitting] = useState(false);
const [isSubmitted, setIsSubmitted] = useState(false);
const [location, setLocation] = useState<string>("");

const paypalButtonRef = useRef<HTMLDivElement | null>(null); // Ref for PayPal container

const {
handleSubmit,
register,
formState: { errors },
} = useForm<FormData>({
resolver: zodResolver(formSchema),
});

useEffect(() => {
const fetchLocation = async () => {
try {
const res = await fetch("/api/location");
const locData = await res.json();
setLocation(locData.location.country || "US");
} catch (error) {
console.error("Error fetching location:", error);
setLocation("US");
}
};

    fetchLocation();

}, []);

// Memoize handlePayPalPayment with useCallback
const handlePayPalPayment = async () => {
if (
paypalButtonRef.current &&
typeof window !== "undefined" &&
window.paypal
) {
window.paypal
.Buttons({
createSubscription: (data: any, actions: any) => {
return actions.subscription.create({ plan_id: paypalplanId });
},
onApprove: (data: any) => {
toast({
title: "Payment Successful",
description: `Subscription ID: ${data.subscriptionID}`,
duration: 3000,
});
router.push(`/thank-you?subscriptionId=${data.subscriptionID}`);
},
})
.render(paypalButtonRef.current);
} else {
console.error(
"PayPal button container not found in DOM or PayPal SDK not loaded."
);
}
};

// Load PayPal script dynamically when needed
// useEffect(() => {
// if (
// typeof window !== "undefined" &&
// !document.getElementById("paypal-sdk")
// ) {
// const script = document.createElement("script");
// script.id = "paypal-sdk";
// script.src = `https://www.paypal.com/sdk/js?client-id=${NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
// script.onload = () => handlePayPalPayment();
// document.body.appendChild(script);
// }
// }, [handlePayPalPayment]);

const handleRazorpayPayment = async () => {
try {
const response = await fetch("/api/webhooks/razerpay/subscription", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ razorpayplanId, buyerId, productId }),
});

      const subscriptionData = await response.json();
      if (!subscriptionData.subscription) {
        throw new Error("Failed to create Razorpay subscription.");
      }

      const options = {
        key: process.env.RAZORPAY_KEY_ID!,
        subscription_id: subscriptionData.subscription,
        amount: amount * 100,
        currency: "INR",
        name: "GK Services",
        description: "Thanks for subscribing!",
        notes: {
          buyerId,
          razorpayplanId,
        },
        handler: async (response: any) => {
          const verificationResponse = await fetch(
            "/api/webhooks/razerpay/verify",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );

          const result = await verificationResponse.json();
          if (result.isOk) {
            toast({
              title: "Payment Successful",
              description: "Subscription activated successfully.",
              duration: 3000,
            });
            router.push(`/thank-you?subscriptionId=${result.subscriptionId}`);
          } else {
            throw new Error(result.message);
          }
        },
        theme: { color: "#3399cc" },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error("Razorpay Error:", error);
      toast({
        title: "Payment Failed",
        description: error.message,
        duration: 3000,
        className: "error-toast",
      });
    }

};

const onSubmit = async (data: FormData) => {
setIsSubmitting(true);
try {
handleRazorpayPayment();
setIsSubmitted(true);
} catch (error: any) {
console.error("Checkout Error:", error);
toast({
title: "Checkout Error",
description: error.message,
duration: 3000,
className: "error-toast",
});
} finally {
setIsSubmitting(false);
}
};

return (
<>
{!isSubmitted ? (
<AlertDialog defaultOpen>
<AlertDialogContent>
<AlertDialogHeader>
<AlertDialogTitle className="sr-only">
Enter Website URL
</AlertDialogTitle>

<div className="flex justify-between items-center">
<p className="text-lg font-bold">Enter Website URL</p>
<AlertDialogCancel>
<XMarkIcon
onClick={() => router.push(`/`)}
className="h-6 w-6 cursor-pointer"
/>
</AlertDialogCancel>
</div>
</AlertDialogHeader>
<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
<div>
<label htmlFor="websiteUrl" className="block text-sm">
Website URL
</label>
<input
id="websiteUrl"
type="url"
{...register("websiteUrl")}
className="input-field mt-2 w-full"
/>
{errors.websiteUrl && (
<p className="text-red-500 text-sm mt-1">
{errors.websiteUrl.message}
</p>
)}
</div>
<button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 text-white py-2 px-4 rounded"
              >
{isSubmitting ? "Processing..." : "Proceed to Pay"}
</button>
</form>
<AlertDialogDescription>
Your payment method will be selected based on your location.
</AlertDialogDescription>
</AlertDialogContent>
</AlertDialog>
) : location.toLowerCase() === "india" ? (
<Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
        />
) : (
<>
<AlertDialog defaultOpen>
<AlertDialogContent>
<AlertDialogHeader className="flex flex-row items-center  justify-between">
<AlertDialogTitle className="text-lg font-bold">
PayPal Checkout
</AlertDialogTitle>
<AlertDialogCancel onClick={() => router.push(`/`)}>
<XMarkIcon className="h-6 w-6 cursor-pointer" />
</AlertDialogCancel>
</AlertDialogHeader>
<AlertDialogDescription className="text-sm text-gray-600">
Complete your checkout using PayPal by following the
instructions below.
</AlertDialogDescription>
<Script
id="paypal-sdk"
src={`https://www.paypal.com/sdk/js?client-id=${NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`}
/>
</AlertDialogContent>
</AlertDialog>
</>
)}
</>
);
};
