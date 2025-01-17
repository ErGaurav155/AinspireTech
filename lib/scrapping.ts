import { scrapedData } from "@/constant";
import { parseStringPromise } from "xml2js";
import { scrapePage } from "./action/scrapping.action";
// Scraped data storage

// Function to get the sitemap URL or fallback to the domain URL
const getScrapingUrl = async (inputUrl: string): Promise<string[]> => {
  try {
    console.log(inputUrl);
    const url = new URL(inputUrl); // Parse the input URL
    console.log(url);
    const domain = `${url.protocol}//${url.hostname}`; // Get the domain
    console.log(domain);

    const sitemapUrl = `${domain}/sitemap.xml`;
    console.log(sitemapUrl);
    // Use fetch to check if sitemap exists
    const response = await fetch(sitemapUrl, { method: "HEAD" });
    console.log(response);
    if (response.ok) {
      // If sitemap.xml exists, fetch the XML and parse it
      const sitemapResponse = await fetch(sitemapUrl);
      const xmlData = await sitemapResponse.text();

      // Parse the sitemap XML to extract all the URLs
      const parsedData = await parseStringPromise(xmlData);
      console.log(parsedData);

      return parsedData.urlset.url.map((urlObj: any) => urlObj.loc[0]);
    } else {
      console.warn(`Sitemap not found. Falling back to domain: ${domain}`);
      return [domain]; // If sitemap doesn't exist, return the domain URL
    }
  } catch (error) {
    console.error("Error fetching sitemap:", error);
    throw new Error("Failed to fetch sitemap or domain");
  }
};

// Function to scrape data from a page

// Function to scrape all pages dynamically
export const scrapeSitemapPages = async (inputUrl: string) => {
  try {
    // Get the dynamic URLs from the sitemap or domain
    const urls = await getScrapingUrl(inputUrl);

    // Loop through each URL and scrape the page content
    for (const url of urls) {
      const pageContent = await scrapePage(url);

      // Extract domain name from URL and store data under the domain name
      const domain = new URL(url).hostname;
      const existingDomain = scrapedData.find(
        (entry) => entry.domain === domain
      );

      if (existingDomain) {
        // If the domain entry already exists, push the new data
        existingDomain.data.push(pageContent);
      } else {
        // Otherwise, create a new entry for the domain
        scrapedData.push({ domain, data: [pageContent] });
      }
    }

    console.log("Scraping completed. Data stored in scrapedData:", scrapedData);
  } catch (error) {
    console.error("Error during scraping:", error);
  }
};
