"use server";
import chrome from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export const scrapePage = async (url: string) => {
  const browser = await puppeteer.launch({
    args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chrome.defaultViewport,
    executablePath: await chrome.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
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
