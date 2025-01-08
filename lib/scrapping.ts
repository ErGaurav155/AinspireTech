import puppeteer from "puppeteer";
import fs from "fs/promises";
import chromium from "@sparticuz/chromium";

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
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    headless: chromium.headless,
  });
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
