import { FacebookLoginResponse } from "@/types/types";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const initializeFacebookSDK = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined") {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: "v18.0",
        });
        resolve();
      };

      // Load Facebook SDK
      (function (d, s, id) {
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        const js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    }
  });
};

export const checkFacebookLoginStatus = (): Promise<FacebookLoginResponse> => {
  return new Promise((resolve) => {
    window.FB.getLoginStatus((response: FacebookLoginResponse) => {
      resolve(response);
    });
  });
};

export const loginWithFacebook = (): Promise<FacebookLoginResponse> => {
  return new Promise((resolve) => {
    window.FB.login(
      (response: FacebookLoginResponse) => {
        resolve(response);
      },
      {
        scope: "pages_show_list,pages_read_engagement,instagram_basic",

        // instagram_manage_comments,business_management",
      }
    );
  });
};

export const logoutFromFacebook = (): Promise<void> => {
  return new Promise((resolve) => {
    window.FB.logout(() => {
      resolve();
    });
  });
};

export const getFacebookUserInfo = (accessToken: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    window.FB.api("/me", { access_token: accessToken }, (response: any) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
};

export const getUserPages = (accessToken: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    window.FB.api(
      "/me/accounts",
      { access_token: accessToken },
      (response: any) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      }
    );
  });
};

export const getInstagramAccount = (
  pageId: string,
  pageAccessToken: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    window.FB.api(
      `/${pageId}?fields=instagram_business_account`,
      { access_token: pageAccessToken },
      (response: any) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      }
    );
  });
};

export const getInstagramAccountInfo = (
  instagramAccountId: string,
  accessToken: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    window.FB.api(
      `/${instagramAccountId}?fields=account_type,username,name,profile_picture_url,followers_count,media_count`,
      { access_token: accessToken },
      (response: any) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      }
    );
  });
};

export const convertAccountType = (
  instagramAccountId: string,
  accountType: "BUSINESS" | "CREATOR",
  accessToken: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    window.FB.api(
      `/${instagramAccountId}`,
      "POST",
      {
        account_type: accountType,
        access_token: accessToken,
      },
      (response: any) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      }
    );
  });
};
