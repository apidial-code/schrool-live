export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "demo-secret",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // GitHub OAuth
  githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL ?? "",
  // Stripe Payment
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "sk_test_51TbtRKCft3EUBX0wG1Qxg5VkkJ0ynO07gQrsGQqO0BJxjU1XeiC72Yflq5mCetIOFdvmAWxXB5tHcgk5DdrdmMAG003ZWe5Q6e",
  stripePublishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "pk_test_51TbtRKCft3EUBX0wQz1Se8gnp4lVzm4bCrHCfWsgyzrkpCkdj2QPomiXHbXif94s6kdlaiNrVR7wG5XohMT4rxI000Fm9FzR59",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  // Brevo Email Service
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
  brevoFromEmail: process.env.BREVO_FROM_EMAIL ?? "noreply@schrool.com",
  brevoFromName: process.env.BREVO_FROM_NAME ?? "Schrool",
  // Zoom API
  zoomClientId: process.env.ZOOM_CLIENT_ID ?? "",
  zoomClientSecret: process.env.ZOOM_CLIENT_SECRET ?? "",
  zoomAccountId: process.env.ZOOM_ACCOUNT_ID ?? "",
};
