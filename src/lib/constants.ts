import type { SubscriptionPlan } from "@/types"
import type { PlanId } from "@/types"

export const PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    prices: { USD: 0, INR: 0, PKR: 0 },
    priceId: "",
    credits: 100,
    features: ["100 one-time credits", "Image generation", "Basic quality"],
  },
  {
    id: "basic",
    name: "Basic",
    price: 499,
    prices: { USD: 6, INR: 499, PKR: 1650 },
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || "",
    credits: 500,
    features: ["500 credits/month", "Image & Video generation", "Priority queue", "HD quality"],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    prices: { USD: 12, INR: 999, PKR: 3300 },
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
    credits: 2000,
    features: ["2000 credits/month", "Image & Video generation", "Priority queue", "4K quality", "Upscaling", "Background removal"],
  },
]

export const CREDITS_PER_GENERATION = {
  image: 5,
  video: 20,
  upscale: 3,
  removeBg: 3,
}

export const IMAGE_MODELS = [
  { id: "black-forest-labs/flux-schnell", name: "Flux Schnell", provider: "replicate" },
  { id: "black-forest-labs/flux-dev", name: "Flux Dev", provider: "replicate" },
  { id: "stability-ai/stable-diffusion-3", name: "SD3", provider: "replicate" },
]

export const VIDEO_MODELS = [
  { id: "luma/ray", name: "Luma Ray", provider: "replicate" },
  { id: "minimax/video-01", name: "MiniMax", provider: "replicate" },
]

export const ASPECT_RATIOS = [
  { label: "Square (1:1)", value: "1:1", width: 1024, height: 1024 },
  { label: "Portrait (9:16)", value: "9:16", width: 576, height: 1024 },
  { label: "Landscape (16:9)", value: "16:9", width: 1024, height: 576 },
  { label: "Portrait (4:5)", value: "4:5", width: 820, height: 1024 },
  { label: "Landscape (3:2)", value: "3:2", width: 1024, height: 683 },
]

export const STYLES = [
  { label: "None", value: "none" },
  { label: "Cinematic", value: "cinematic" },
  { label: "Anime", value: "anime" },
  { label: "Digital Art", value: "digital-art" },
  { label: "Photorealistic", value: "photorealistic" },
  { label: "Fantasy", value: "fantasy" },
  { label: "Cyberpunk", value: "cyberpunk" },
  { label: "Oil Painting", value: "oil-painting" },
  { label: "Watercolor", value: "watercolor" },
  { label: "Pixel Art", value: "pixel-art" },
  { label: "3D Render", value: "3d-render" },
  { label: "Sketch", value: "sketch" },
]

export const FREE_CREDITS_ON_SIGNUP = 100
export const REFERRAL_CREDITS = 20
export const MAX_FREE_GENERATIONS = 100
