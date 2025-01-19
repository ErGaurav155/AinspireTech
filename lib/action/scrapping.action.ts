"use server";
import puppeteer from "puppeteer";

export const scrapePage = async (url: string) => {
  const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
      "--no-zygote",
    ],
    headless: true,
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
