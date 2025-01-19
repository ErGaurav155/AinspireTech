import chromium from "chrome-aws-lambda";

export const scrapePage = async (url: string) => {
  const browser = await chromium.puppeteer.launch({
    executablePath: await chromium.executablePath,
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
