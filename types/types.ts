export interface AppointmentParams {
  name: string;
  phone: string;
  address?: string;
  subject: string;
  budget: string;
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
  features: string[];
  popular: boolean;
};
