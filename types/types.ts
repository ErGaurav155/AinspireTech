export interface MyAppointmentParams {
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
export interface FacebookLoginResponse {
  authResponse: {
    accessToken: string;
    expiresIn: number;
    userID: string;
  };
  status: "connected" | "not_authorized" | "unknown";
}

export interface InstagramAccount {
  id: string;
  username: string;
  account_type: "BUSINESS" | "CREATOR" | "PERSONAL";
  media_count: number;
  followers_count: number;
  name?: string;
  profile_picture_url?: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface AccountTypeConversion {
  accountId: string;
  newAccountType: "BUSINESS" | "CREATOR";
}
