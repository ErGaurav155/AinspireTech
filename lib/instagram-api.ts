// Instagram API utility functions
export const InstagramAPI = {
  async checkLoginStatus(): Promise<any> {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.FB) {
        window.FB.getLoginStatus((response: any) => {
          resolve(response);
        });
      } else {
        resolve({ status: "unknown" });
      }
    });
  },

  async loginWithFacebook(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && window.FB) {
        window.FB.login(
          (response: any) => {
            if (response.status === "connected") {
              resolve(response);
            } else {
              reject(new Error("Facebook login failed"));
            }
          },
          {
            scope:
              "pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_comments,business_management",
          }
        );
      } else {
        reject(new Error("Facebook SDK not loaded"));
      }
    });
  },

  async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(
      `/api/instagram/user-info?accessToken=${accessToken}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get user info");
    }

    return data.user;
  },

  async checkInstagramConnection(accessToken: string): Promise<any> {
    const response = await fetch("/api/instagram/check-connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to check Instagram connection");
    }

    return data;
  },

  async convertAccountType(
    instagramAccountId: string,
    accountType: "BUSINESS" | "CREATOR",
    accessToken: string
  ): Promise<any> {
    const response = await fetch("/api/instagram/convert-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instagramAccountId,
        accountType,
        accessToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to convert account type");
    }

    return data;
  },

  async saveAccount(accountData: any): Promise<any> {
    const response = await fetch("/api/instagram/accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to save account");
    }

    return data;
  },
};

export default InstagramAPI;
