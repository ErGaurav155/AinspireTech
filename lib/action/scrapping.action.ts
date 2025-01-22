"use server";
import puppeteerCore from "puppeteer-core";
import chromium from "chrome-aws-lambda";

export const scrapePage = async (url: string) => {
  let browser = null;

  // Choose the browser based on the environment (development or production)
  if (process.env.NODE_ENV === "development") {
    console.log("Development browser: ");
    browser = await puppeteerCore.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
  } else if (process.env.NODE_ENV === "production") {
    console.log("Production browser: ");
    browser = await chromium.puppeteer.launch({
      executablePath: await chromium.executablePath,
      headless: true,
      args: chromium.args,
    });
  }

  if (!browser) {
    return;
  }

  const page = await browser.newPage();

  // Navigate to the page and wait for the DOM to load
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Scrape data using Puppeteer's query selectors and direct element interaction
  const title = await page.title();
  const descriptionElement = await page.$("meta[name='description']");
  const description = descriptionElement
    ? await descriptionElement
        .getProperty("content")
        .then((content: any) => content.jsonValue())
    : null;

  const headingElements = await page.$$("h1, h2, h3");
  const headings = [];
  for (let element of headingElements) {
    const text = await element.evaluate(
      (el: any) => el.textContent?.trim() || ""
    );
    headings.push(text);
  }

  const content = await page.$eval("body", (body: any) => body.innerText);

  // Close the browser once scraping is done
  await browser.close();

  // Return the scraped data
  return { url, title, description, headings, content };
};
