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
