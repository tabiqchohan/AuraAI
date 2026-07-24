import type { SubscriptionPlan, GenerationType } from "@/types"
import type { PlanId } from "@/types"

export const PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    prices: { USD: 0, INR: 0, PKR: 0 },
    priceId: "",
    credits: 50,
    features: [
      "50 one-time credits",
      "Image generation (basic quality)",
      "Video generation (720p)",
      "Watermark on all outputs",
      "Basic templates only",
      "5 images or 2 videos per month",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: 0,
    prices: { USD: 5, INR: 449, PKR: 1200 },
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || "",
    credits: 500,
    features: [
      "500 credits/month",
      "Image & Video generation (HD)",
      "No watermark",
      "All templates (including premium)",
      "Priority queue",
      "100 images or 25 videos per month",
      "Email support",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 0,
    prices: { USD: 12, INR: 999, PKR: 3000 },
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
    credits: 2000,
    features: [
      "2000 credits/month",
      "Image & Video generation (4K)",
      "No watermark",
      "All templates (including premium)",
      "Priority queue",
      "400 images or 100 videos per month",
      "Upscaling & Background removal",
      "AI Voiceover (up to 10 mins/month)",
      "API access (1000 calls/month)",
      "Priority support",
    ],
  },
]

export interface CreditPack {
  id: string
  name: string
  credits: number
  prices: { USD: number; PKR: number }
  priceId: string
  popular?: boolean
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "small", name: "Starter Pack", credits: 100, prices: { USD: 2, PKR: 500 }, priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_100_ID || "" },
  { id: "medium", name: "Creator Pack", credits: 500, prices: { USD: 8, PKR: 2000 }, priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_500_ID || "", popular: true },
  { id: "large", name: "Pro Pack", credits: 1500, prices: { USD: 20, PKR: 5000 }, priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_1500_ID || "" },
  { id: "xlarge", name: "Ultra Pack", credits: 5000, prices: { USD: 50, PKR: 12500 }, priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_5000_ID || "" },
]

export interface AddonFeature {
  id: string
  name: string
  description: string
  creditCost: number
  icon: string
  available: boolean
  premiumOnly?: boolean
}

export const ADDON_FEATURES: AddonFeature[] = [
  { id: "upscale", name: "4K Upscale", description: "Upscale your image to 4K resolution", creditCost: 5, icon: "📺", available: true, premiumOnly: false },
  { id: "removeBg", name: "Remove Background", description: "Remove background from image", creditCost: 3, icon: "✂️", available: true, premiumOnly: false },
  { id: "voiceover", name: "AI Voiceover", description: "Add AI voiceover to video (10 sec)", creditCost: 10, icon: "🎙️", available: true, premiumOnly: true },
  { id: "noWatermark", name: "No Watermark", description: "Remove AuraAI watermark from output", creditCost: 0, icon: "🚫", available: true, premiumOnly: true },
]

export const CREDITS_PER_GENERATION = {
  image: 5,
  video: 20,
  upscale: 5,
  removeBg: 3,
  voiceover: 10,
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

export const FREE_CREDITS_ON_SIGNUP = 50
export const REFERRAL_CREDITS = 20
export const MAX_FREE_GENERATIONS = 50

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
  premium?: boolean
  previewColors?: [string, string]
}

export const TEMPLATES: Template[] = [
  { id: "cinematic-landscape", name: "Cinematic Landscape", description: "Epic wide shots", type: "image", model: "black-forest-labs/flux-dev", style: "cinematic", aspectRatio: "16:9", examplePrompt: "A breathtaking cinematic landscape of misty mountains at golden hour with dramatic clouds", emoji: "🏔️", previewColors: ["#1a365d", "#d97706"] },
  { id: "portrait-photo", name: "Portrait Photo", description: "Realistic portraits", type: "image", model: "black-forest-labs/flux-dev", style: "photorealistic", aspectRatio: "4:5", examplePrompt: "A professional headshot of a confident woman with soft natural lighting", emoji: "👤", previewColors: ["#6b7280", "#fbbf24"] },
  { id: "anime-scene", name: "Anime Scene", description: "Japanese anime style", type: "image", model: "black-forest-labs/flux-schnell", style: "anime", aspectRatio: "16:9", examplePrompt: "Anime style scene of a sunset over Tokyo with cherry blossom trees", emoji: "🌸", previewColors: ["#ec4899", "#fbbf24"] },
  { id: "fantasy-art", name: "Fantasy Art", description: "Magical illustrations", type: "image", model: "stability-ai/stable-diffusion-3", style: "fantasy", aspectRatio: "1:1", examplePrompt: "A fantasy illustration of a glowing crystal cave with floating magical particles", emoji: "🧙", previewColors: ["#7c3aed", "#06b6d4"] },
  { id: "cyberpunk-city", name: "Cyberpunk City", description: "Neon futuristic", type: "image", model: "black-forest-labs/flux-dev", style: "cyberpunk", aspectRatio: "9:16", examplePrompt: "A cyberpunk city street at night with neon signs reflecting on wet pavement", emoji: "🌃", previewColors: ["#831843", "#06b6d4"] },
  { id: "product-ad", name: "Product Ad", description: "Clean product shots", type: "image", model: "stability-ai/stable-diffusion-3", style: "3d-render", aspectRatio: "1:1", examplePrompt: "A 3D render of a premium perfume bottle with golden accents on marble surface", emoji: "📦", previewColors: ["#1e293b", "#f59e0b"] },
  { id: "nature-video", name: "Nature Video", description: "Scenic nature clips", type: "video", model: "pixverse/pixverse-v6", style: "cinematic", aspectRatio: "16:9", examplePrompt: "A serene waterfall in a lush green forest with sunlight streaming through trees", emoji: "🌿", previewColors: ["#065f46", "#34d399"] },
  { id: "product-showcase", name: "Product Showcase", description: "Dynamic product video", type: "video", model: "bytedance/seedance-1-pro", style: "cinematic", aspectRatio: "1:1", examplePrompt: "A luxury watch rotating on a dark reflective surface with subtle lighting", emoji: "⌚", previewColors: ["#1e1b4b", "#a78bfa"] },
  { id: "urban-clip", name: "Urban Clip", description: "City lifestyle videos", type: "video", model: "pixverse/pixverse-v6", style: "cinematic", aspectRatio: "9:16", examplePrompt: "Time-lapse of a busy city intersection at night with car light trails", emoji: "🏙️", previewColors: ["#1e293b", "#f97316"] },
  { id: "instagram-reel", name: "Instagram Reel", description: "Viral reel templates", type: "video", model: "pixverse/pixverse-v6", style: "cinematic", aspectRatio: "9:16", examplePrompt: "A dynamic fast-paced montage of street food being prepared with vibrant colors and steam", emoji: "📱", premium: true, previewColors: ["#6d28d9", "#ec4899"] },
  { id: "youtube-intro", name: "YouTube Intro", description: "Channel intro animation", type: "video", model: "bytedance/seedance-1-pro", style: "cinematic", aspectRatio: "16:9", examplePrompt: "A cinematic countdown intro with neon lights and particle effects for a gaming channel", emoji: "▶️", premium: true, previewColors: ["#dc2626", "#facc15"] },
  { id: "ecommerce-360", name: "Product 360°", description: "360 product showcase", type: "video", model: "pixverse/pixverse-v6", style: "3d-render", aspectRatio: "1:1", examplePrompt: "A 360-degree rotating view of a designer sneaker with dynamic lighting", emoji: "👟", premium: true, previewColors: ["#0f172a", "#38bdf8"] },
  { id: "cinematic-drama", name: "Cinematic Drama", description: "Film-style scenes", type: "image", model: "black-forest-labs/flux-dev", style: "cinematic", aspectRatio: "16:9", examplePrompt: "A dramatic film scene of a lone figure walking through a rain-soaked alley at night", emoji: "🎬", premium: true, previewColors: ["#0f0f0f", "#e11d48"] },
  { id: "logo-reveal", name: "Logo Reveal", description: "Brand logo animation", type: "video", model: "bytedance/seedance-1-pro", style: "cinematic", aspectRatio: "1:1", examplePrompt: "A sleek golden logo reveal with light particles and smooth transitions on dark background", emoji: "✨", premium: true, previewColors: ["#0f172a", "#f59e0b"] },
]
