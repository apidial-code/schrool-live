export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate GitHub OAuth login URL
export const getLoginUrl = (redirectPath: string = "/") => {
  // GitHub OAuth flow:
  // 1. Redirect to GitHub authorization page
  // 2. GitHub redirects back to /api/oauth/callback
  // 3. Backend handles callback and creates session
  // 4. Backend redirects to the original page (encoded in state)
  
  const githubClientId = "Ov23lieIR2vQDLT0FGno";
  const callbackUrl = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectPath); // Encode redirect path in state
  
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", githubClientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  
  return url.toString();
};
