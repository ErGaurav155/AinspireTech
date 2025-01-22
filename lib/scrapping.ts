import { parseStringPromise } from "xml2js";
import { promises as fs } from "fs";
import { scrapedData } from "@/constant";
import { generateUrls } from "./action/ai.action";

const getScrapingUrl = async (inputUrl: string): Promise<string[]> => {
  try {
    const url = new URL(inputUrl);
    const domain = `${url.protocol}//${url.hostname}`;

    const sitemapUrl = `${domain}/sitemap.xml`;
    const response = await fetch(sitemapUrl, { method: "HEAD" });
    if (response.ok) {
      const sitemapResponse = await fetch(sitemapUrl);
      const xmlData = await sitemapResponse.text();

      const parsedData = await parseStringPromise(xmlData);
      return parsedData.urlset.url.map((urlObj: any) => urlObj.loc[0]);
    } else {
      console.warn(`Sitemap not found. Falling back to domain: ${domain}`);
      return [domain];
    }
  } catch (error) {
    console.error("Error fetching sitemap:", error);
    throw new Error("Failed to fetch sitemap or domain");
  }
};

export const scrapeSitemapPages = async (inputUrl: string) => {
  try {
    const url = new URL(inputUrl);
    const domainName = url.hostname.replace("www.", "");

    const urls = await getScrapingUrl(inputUrl);

    const urlsString = convertUrlsToString(urls);

    const impUrls = await generateUrls(urlsString);

    let validUrls: string[] = [];
    if (typeof impUrls === "string") {
      try {
        const parsed = JSON.parse(impUrls);
        if (Array.isArray(parsed)) {
          validUrls = parsed
            .map((url: string) => url.trim())
            .filter((url: string) => url);
        } else {
          throw new Error("Parsed `impUrls` is not an array");
        }
      } catch (error) {
        console.error("Error parsing impUrls:", error);
        throw new Error("`impUrls` is not in a valid format.");
      }
    } else if (Array.isArray(impUrls)) {
      validUrls = impUrls
        .map((url: string) => url.trim())
        .filter((url: string) => url);
    } else {
      throw new Error("`impUrls` is neither an array nor a JSON string.");
    }
    console.log("urls", urls);

    const scrapedUrls = new Set();

    for (const url of validUrls) {
      if (scrapedUrls.has(url)) {
        continue;
      }
      const response = await fetch("/api/scrapping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (response.ok) {
        scrapedData.push(data);
      }

      scrapedUrls.add(url);
    }

    const fileName = `${domainName}.json`;
    await fs.writeFile(fileName, JSON.stringify(scrapedData, null, 2));
    return true;
  } catch (error) {
    console.error("Error during scraping:", error);
  }
};
const convertUrlsToString = (urls: string[]): string => {
  return urls.join(", ");
};
