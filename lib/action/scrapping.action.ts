// "use server";
// import puppeteer from "puppeteer";

// export const scrapePage = async (url: string) => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.goto(url, { waitUntil: "domcontentloaded" });

//   const scrapedData = await page.evaluate(() => {
//     const title = document.title;
//     const description = document
//       .querySelector("meta[name='description']")
//       ?.getAttribute("content");
//     const headings = Array.from(document.querySelectorAll("h1, h2, h3")).map(
//       (h) => h.textContent
//     );
//     const content = document.body.innerText;

//     return { title, description, headings, content };
//   });

//   await browser.close();
//   return { url, ...scrapedData };
// };

// // import puppeteer from "puppeteer-core";
// // import chromium from "chrome-aws-lambda";

// // export const scrapePage = async (url: string) => {
// //   let browser = null;

// //   // Choose the browser based on the environment (development or production)
// //   if (process.env.NODE_ENV === "development") {
// //     console.log("Development browser: ");
// //     browser = await puppeteer.launch({
// //       args: ["--no-sandbox", "--disable-setuid-sandbox"],
// //       headless: true,
// //     });
// //   } else if (process.env.NODE_ENV === "production") {
// //     console.log("Production browser: ");
// //     browser = await chromium.puppeteer.launch({
// //       executablePath: await chromium.executablePath,
// //       headless: true,
// //       args: [
// //         "--disable-dev-shm-usage",
// //         "--no-sandbox",
// //         "--disable-setuid-sandbox",
// //       ],
// //     });
// //   }

// //   if (!browser) {
// //     return;
// //   }

// //   const page = await browser.newPage();

// //   // Navigate to the page and wait for the DOM to load
// //   await page.goto(url, { waitUntil: "domcontentloaded" });

// //   // Scrape data using Puppeteer's query selectors and direct element interaction
// //   const title = await page.title();
// //   const descriptionElement = await page.$("meta[name='description']");
// //   const description = descriptionElement
// //     ? await descriptionElement
// //         .getProperty("content")
// //         .then((content: any) => content.jsonValue())
// //     : null;

// //   const headingElements = await page.$$("h1, h2, h3");
// //   const headings = [];
// //   for (let element of headingElements) {
// //     const text = await element.evaluate(
// //       (el: any) => el.textContent?.trim() || ""
// //     );
// //     headings.push(text);
// //   }

// //   const content = await page.$eval("body", (body: any) => body.innerText);

// //   // Close the browser once scraping is done
// //   await browser.close();

// //   // Return the scraped data
// //   return { url, title, description, headings, content };
// // };
