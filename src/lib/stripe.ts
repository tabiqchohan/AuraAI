import Stripe from "stripe"

function createStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, {
    apiVersion: "2025-02-24" as any,
    typescript: true,
  })
}

export const stripe = createStripe()

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
}
