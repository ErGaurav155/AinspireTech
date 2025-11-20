export interface MyAppointmentParams {
  name: string;
  phone: string;
  address?: string;
  subject: string;
  email: string;
  message?: string;
}

export interface CreateUserParams {
  clerkId: string;
  email: string;
  username: string | null;
  websiteUrl: string | null;
  isScrapped: boolean;
  firstName: string;
  lastName: string;
  photo: string;
}

export interface UpdateUserParams {
  firstName: string;
  lastName: string;
  username: string | null;
  photo: string;
}
// types/scrape.d.ts
export interface ANUScrapedData {
  url: string;
  title: string;
  content: string;
  lastModified?: string;
  links: string[];
}

export interface ScrapeResponse {
  data: ANUScrapedData[];
  error?: string;
  message?: string;
}
export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  account: number;
  limit: number;
  features: string[];
  popular: boolean;
};
export interface Feature {
  name: string;
  comment2DM: string | boolean;
  autoDM: string | boolean;
  linkplease: string | boolean;
  rapiddm: string | boolean;
  zorcha: string | boolean;
  instantDM: string | boolean;
}
export interface ScrapedData {
  _id?: string;
  url: string;
  title: string;
  description?: string;
  mainHeading: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  paragraphs: string[];
  mainContent: string;
  scrapedAt: Date;
  userId: string;
  s3Url?: string;
  status: "success" | "failed";
  depth?: number;
  error?: string;
}

export interface ScrapeRequest {
  url: string;
  userId: string;
  maxPages?: number;
  maxDepth?: number;
}
