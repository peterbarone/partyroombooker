import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY as string | undefined;
if (!key) {
  // Intentionally do not throw to allow non-billing flows to work in dev without keys
}

export const stripe = key
  ? new Stripe(key, { apiVersion: "2024-06-20" })
  : (null as unknown as Stripe);

export const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
