import type { SubscriptionPlan, GenerationType } from "@/types"
import type { PlanId } from "@/types"

export const PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    prices: { USD: 0, INR: 0, PKR: 0 },
    priceId: "",
    credits: 100,
    features: [
      "100 one-time credits",
      "Image generation",
      "Basic quality",
      "20 images or 5 videos",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: 499,
    prices: { USD: 6, INR: 499, PKR: 1650 },
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || "",
    credits: 500,
    features: [
      "500 credits/month",
      "Image & Video generation",
      "Priority queue",
      "HD quality",
      "100 images or 25 videos per month",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    prices: { USD: 12, INR: 999, PKR: 3300 },
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
    credits: 2000,
    features: [
      "2000 credits/month",
      "Image & Video generation",
      "Priority queue",
      "4K quality",
      "Upscaling",
      "Background removal",
      "400 images or 100 videos per month",
    ],
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
  { id: "pixverse/pixverse-v6", name: "PixVerse V6", provider: "replicate" },
  { id: "bytedance/seedance-1-pro", name: "Seedance 1 Pro", provider: "replicate" },
]

export const VIDEO_DURATION_OPTIONS = [
  { label: "5 sec", value: 5 },
  { label: "10 sec", value: 10 },
  { label: "15 sec", value: 15 },
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

export interface Template {
  id: string
  name: string
  description: string
  type: GenerationType
  model: string
  style: string
  aspectRatio: string
  examplePrompt: string
  emoji: string
}

export const TEMPLATES: Template[] = [
  { id: "cinematic-landscape", name: "Cinematic Landscape", description: "Epic wide shots", type: "image", model: "black-forest-labs/flux-dev", style: "cinematic", aspectRatio: "16:9", examplePrompt: "A breathtaking cinematic landscape of misty mountains at golden hour with dramatic clouds", emoji: "🏔️" },
  { id: "portrait-photo", name: "Portrait Photo", description: "Realistic portraits", type: "image", model: "black-forest-labs/flux-dev", style: "photorealistic", aspectRatio: "4:5", examplePrompt: "A professional headshot of a confident woman with soft natural lighting", emoji: "👤" },
  { id: "anime-scene", name: "Anime Scene", description: "Japanese anime style", type: "image", model: "black-forest-labs/flux-schnell", style: "anime", aspectRatio: "16:9", examplePrompt: "Anime style scene of a sunset over Tokyo with cherry blossom trees", emoji: "🌸" },
  { id: "fantasy-art", name: "Fantasy Art", description: "Magical illustrations", type: "image", model: "stability-ai/stable-diffusion-3", style: "fantasy", aspectRatio: "1:1", examplePrompt: "A fantasy illustration of a glowing crystal cave with floating magical particles", emoji: "🧙" },
  { id: "cyberpunk-city", name: "Cyberpunk City", description: "Neon futuristic", type: "image", model: "black-forest-labs/flux-dev", style: "cyberpunk", aspectRatio: "9:16", examplePrompt: "A cyberpunk city street at night with neon signs reflecting on wet pavement", emoji: "🌃" },
  { id: "product-ad", name: "Product Ad", description: "Clean product shots", type: "image", model: "stability-ai/stable-diffusion-3", style: "3d-render", aspectRatio: "1:1", examplePrompt: "A 3D render of a premium perfume bottle with golden accents on marble surface", emoji: "📦" },
  { id: "nature-video", name: "Nature Video", description: "Scenic nature clips", type: "video", model: "pixverse/pixverse-v6", style: "cinematic", aspectRatio: "16:9", examplePrompt: "A serene waterfall in a lush green forest with sunlight streaming through trees", emoji: "🌿" },
  { id: "product-showcase", name: "Product Showcase", description: "Dynamic product video", type: "video", model: "bytedance/seedance-1-pro", style: "cinematic", aspectRatio: "1:1", examplePrompt: "A luxury watch rotating on a dark reflective surface with subtle lighting", emoji: "⌚" },
  { id: "urban-clip", name: "Urban Clip", description: "City lifestyle videos", type: "video", model: "pixverse/pixverse-v6", style: "cinematic", aspectRatio: "9:16", examplePrompt: "Time-lapse of a busy city intersection at night with car light trails", emoji: "🏙️" },
]
