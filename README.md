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
// "use server";
// import { parseStringPromise } from "xml2js";
// import { promises as fs } from "fs";
// import { scrapedData } from "@/constant";
// import { generateUrls } from "./action/ai.action";
// import { scrapePage } from "./action/scrapping.action";

// const getScrapingUrl = async (inputUrl: string): Promise<string[]> => {
// try {
// const url = new URL(inputUrl);
// const domain = `${url.protocol}//${url.hostname}`;

// const sitemapUrl = `${domain}/sitemap.xml`;
// const response = await fetch(sitemapUrl, { method: "HEAD" });
// if (response.ok) {
// const sitemapResponse = await fetch(sitemapUrl);
// const xmlData = await sitemapResponse.text();

// const parsedData = await parseStringPromise(xmlData);
// return parsedData.urlset.url.map((urlObj: any) => urlObj.loc[0]);
// } else {
// console.warn(`Sitemap not found. Falling back to domain: ${domain}`);
// return [domain];
// }
// } catch (error) {
// console.error("Error fetching sitemap:", error);
// throw new Error("Failed to fetch sitemap or domain");
// }
// };

// export const scrapeSitemapPages = async (inputUrl: string) => {
// try {
// const url = new URL(inputUrl);
// const domainName = url.hostname.replace("www.", "");

// const urls = await getScrapingUrl(inputUrl);
// console.log("urls", urls);

// const urlsString = convertUrlsToString(urls);
// console.log("urlsString", urlsString);

// const impUrls = await generateUrls(urlsString);
// console.log("impUrls", impUrls);

// let validUrls: string[] = [];
// if (typeof impUrls === "string") {
// try {
// const parsed = JSON.parse(impUrls);
// if (Array.isArray(parsed)) {
// validUrls = parsed
// .map((url: string) => url.trim())
// .filter((url: string) => url);
// } else {
// throw new Error("Parsed `impUrls` is not an array");
// }
// } catch (error) {
// console.error("Error parsing impUrls:", error);
// throw new Error("`impUrls` is not in a valid format.");
// }
// } else if (Array.isArray(impUrls)) {
// validUrls = impUrls
// .map((url: string) => url.trim())
// .filter((url: string) => url);
// } else {
// throw new Error("`impUrls` is neither an array nor a JSON string.");
// }
// console.log("validUrls", validUrls);

// const scrapedUrls = new Set();

// for (const url of validUrls) {
// if (scrapedUrls.has(url)) {
// continue;
// }
// console.log(url);

// const pageContent = await scrapePage(url);
// console.log("pageContent", pageContent);

// if (!pageContent) {
// continue;
// }
// scrapedData.push(pageContent);
// scrapedUrls.add(url);
// }

// scrapedUrls.add(url);

// const fileName = `${domainName}.json`;
// await fs.writeFile(fileName, JSON.stringify(scrapedData, null, 2));
// return true;
// } catch (error) {
// console.error("Error during scraping:", error);
// }
// };
// const convertUrlsToString = (urls: string[]): string => {
// return urls.join(", ");
// };

// "use server";
// import puppeteer from "puppeteer";

// export const scrapePage = async (url: string) => {
// const browser = await puppeteer.launch();
// const page = await browser.newPage();

// await page.goto(url, { waitUntil: "domcontentloaded" });

// const scrapedData = await page.evaluate(() => {
// const title = document.title;
// const description = document
// .querySelector("meta[name='description']")
// ?.getAttribute("content");
// const headings = Array.from(document.querySelectorAll("h1, h2, h3")).map(
// (h) => h.textContent
// );
// const content = document.body.innerText;

// return { title, description, headings, content };
// });

// await browser.close();
// return { url, ...scrapedData };
// };

// // import puppeteer from "puppeteer-core";
// // import chromium from "chrome-aws-lambda";

// // export const scrapePage = async (url: string) => {
// // let browser = null;

// // // Choose the browser based on the environment (development or production)
// // if (process.env.NODE_ENV === "development") {
// // console.log("Development browser: ");
// // browser = await puppeteer.launch({
// // args: ["--no-sandbox", "--disable-setuid-sandbox"],
// // headless: true,
// // });
// // } else if (process.env.NODE_ENV === "production") {
// // console.log("Production browser: ");
// // browser = await chromium.puppeteer.launch({
// // executablePath: await chromium.executablePath,
// // headless: true,
// // args: [
// // "--disable-dev-shm-usage",
// // "--no-sandbox",
// // "--disable-setuid-sandbox",
// // ],
// // });
// // }

// // if (!browser) {
// // return;
// // }

// // const page = await browser.newPage();

// // // Navigate to the page and wait for the DOM to load
// // await page.goto(url, { waitUntil: "domcontentloaded" });

// // // Scrape data using Puppeteer's query selectors and direct element interaction
// // const title = await page.title();
// // const descriptionElement = await page.$("meta[name='description']");
// // const description = descriptionElement
// // ? await descriptionElement
// // .getProperty("content")
// // .then((content: any) => content.jsonValue())
// // : null;

// // const headingElements = await page.$$("h1, h2, h3");
// // const headings = [];
// // for (let element of headingElements) {
// // const text = await element.evaluate(
// // (el: any) => el.textContent?.trim() || ""
// // );
// // headings.push(text);
// // }

// // const content = await page.$eval("body", (body: any) => body.innerText);

// // // Close the browser once scraping is done
// // await browser.close();

// // // Return the scraped data
// // return { url, title, description, headings, content };
// // };
