// types/facebook.d.ts
declare namespace FB {
  function init(params: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }): void;

  function login(
    callback: (response: AuthResponse) => void,
    options?: LoginOptions
  ): void;

  function logout(callback: (response: { status: string }) => void): void;

  function getLoginStatus(
    callback: (response: AuthResponse) => void,
    force?: boolean
  ): void;

  function api(path: string, callback: (response: any) => void): void;
  function api(
    path: string,
    params: any,
    callback: (response: any) => void
  ): void;

  interface AuthResponse {
    status: string;
    authResponse: {
      accessToken: string;
      expiresIn: string;
      signedRequest: string;
      userID: string;
    };
  }

  interface LoginOptions {
    scope?: string;
    return_scopes?: boolean;
    enable_profile_selector?: boolean;
    auth_type?: string;
  }
}

interface Window {
  FB: typeof FB;
}
