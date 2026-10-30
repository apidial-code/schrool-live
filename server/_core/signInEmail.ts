import { z } from "zod";

export function getSignInOrigin(): string {
  const value = process.env.APP_BASE_URL?.trim();
  if (!value || /\s/.test(value)) {
    throw new Error("APP_BASE_URL is missing or invalid.");
  }

  const url = new URL(value);
  if (
    url.protocol !== "https:" || url.username || url.password ||
    url.pathname !== "/" || url.search || url.hash
  ) {
    throw new Error("APP_BASE_URL must be an HTTPS origin.");
  }

  return url.origin;
}

export async function sendSignInEmail(email: string, token: string) {
  const recipient = z.string().trim().email().max(254).parse(email);

  if (!/^[a-f0-9]{64}$/.test(token)) {
    throw new Error("Invalid sign-in token.");
  }

  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_FROM_EMAIL?.trim();
  const senderName = process.env.BREVO_FROM_NAME?.trim() || "Schrool";

  if (!apiKey || apiKey === "test-brevo-key" || !senderEmail) {
    throw new Error("Sign-in email configuration is incomplete.");
  }
  z.string().email().max(254).parse(senderEmail);

  const link = new URL("/login", getSignInOrigin());
  link.hash = `token=${token}`;

  const linkText = link.toString();
  const safeLink = linkText.replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/'/g, "&#39;");

  const text = [
    "Use this link to sign in to Schrool:",
    linkText,
    "This link expires in 15 minutes and can be used once.",
    "Do not forward this email or share the link.",
    "If you did not request it, you can ignore this email.",
  ].join("\n\n");

  let response: Response;

  try {
    response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: recipient }],
        subject: "Your Schrool sign-in link",
        textContent: text,
        htmlContent: `<p>Use this link to sign in to Schrool:</p>
          <p><a href="${safeLink}">Sign in to Schrool</a></p>
          <p>This link expires in 15 minutes and can be used once.</p>
          <p>Do not forward this email or share the link.</p>
          <p>If you did not request it, you can ignore this email.</p>`,
        tags: ["schrool-sign-in"],
      }),
    });
  } catch {
    throw new Error("Sign-in email service is unavailable.");
  }

  await response.body?.cancel();

  if (!response.ok) {
    throw new Error(`Sign-in email rejected (HTTP ${response.status}).`);
  }
}
