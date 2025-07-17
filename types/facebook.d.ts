// types/facebook.d.ts
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (config: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      getLoginStatus: (callback: (response: any) => void) => void;
      login: (
        callback: (response: any) => void,
        options: { scope: string }
      ) => void;
      api: (
        path: string,
        method: string,
        callback: (response: any) => void
      ) => void;
    };
  }
}

export {};
