import puppeteer from "puppeteer";

import chromium from "chrome-aws-lambda";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    console.log("hi hello");
    // Parse the request body to get the URL to scrape
    console.log(url);
    if (!url) {
      return NextResponse.json(
        { error: "Missing 'url' in request body" },
        { status: 400 }
      );
    }

    let browser = null;

    try {
      // Choose the browser configuration based on the environment
      if (process.env.NODE_ENV === "development") {
        console.log("Launching browser in development environment...");
        browser = await puppeteer.launch();
      } else if (process.env.NODE_ENV === "production") {
        console.log("Launching browser in production environment...");
        const executablePath = await chromium.executablePath;
        browser = await puppeteer.launch({
          args: chromium.args,
          executablePath,
          headless: chromium.headless,
        });
      }

      if (!browser) {
        throw new Error("Failed to launch browser");
      }

      // Open a new page and navigate to the provided URL
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Extract the desired data from the page
      const title = await page.title();
      const descriptionElement = await page.$("meta[name='description']");
      const description = descriptionElement
        ? await descriptionElement
            .getProperty("content")
            .then((content: any) => content.jsonValue())
        : null;

      const headingElements = await page.$$("h1, h2, h3");
      const headings = [];
      for (const element of headingElements) {
        const text = await element.evaluate(
          (el) => el.textContent?.trim() || ""
        );
        headings.push(text);
      }

      const content = await page.$eval("body", (body: any) => body.innerText);

      // Return the scraped data as the response
      return NextResponse.json(
        { url, title, description, headings, content },
        { status: 200 }
      );
    } finally {
      // Ensure the browser is closed to release resources
      if (browser) {
        await browser.close();
      }
    }
  } catch (error: any) {
    console.log("hello", "url");
    console.error("Error scraping page:", error.message);
    return NextResponse.json(
      { error: "Failed to scrape page", details: error.message },
      { status: 500 }
    );
  }
}
