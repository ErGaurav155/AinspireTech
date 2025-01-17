"use server";
import puppeteer from "puppeteer";

export const scrapePage = async (url: string) => {
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
