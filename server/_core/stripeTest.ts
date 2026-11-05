import Stripe from "stripe";
import { ENV } from "./env.js";

let client: Stripe | undefined;

export function getTestStripe(): Stripe {
  const key = ENV.stripeSecretKey.trim();

  if (!key.startsWith("sk_test_")) {
    throw new Error(
      "Stripe sandbox secret key is missing or invalid.",
    );
  }

  if (!client) {
    client = new Stripe(key, {
      maxNetworkRetries: 2,
      timeout: 10000,
    });
  }

  return client;
}
