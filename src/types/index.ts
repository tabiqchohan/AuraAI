export type GenerationType = "image" | "video"
export type GenerationStatus = "pending" | "processing" | "completed" | "failed"
export type SubscriptionStatus = "active" | "inactive" | "canceled" | "past_due"
export type PlanId = "free" | "basic" | "pro"

export interface User {
  id: string
  email: string
  credits: number
  stripe_customer_id?: string
  subscription_status: SubscriptionStatus
  subscription_plan: PlanId
  subscription_end_date?: string
  referral_code: string
  referred_by?: string
  total_generations: number
  is_admin: boolean
  blocked: boolean
  created_at: string
}

export interface Generation {
  id: string
  user_id: string
  prompt: string
  negative_prompt?: string
  type: GenerationType
  model: string
  output_url: string
  output_urls: string[]
  credits_used: number
  status: GenerationStatus
  width?: number
  height?: number
  seed?: number
  is_public: boolean
  likes_count: number
  flagged: boolean
  flagged_reason?: string
  created_at: string
}

export interface GalleryGeneration extends Generation {
  user?: { email: string }
  is_liked?: boolean
}

export interface SubscriptionPlan {
  id: PlanId
  name: string
  price: number
  prices: {
    USD: number
    INR: number
    PKR: number
  }
  priceId: string
  credits: number
  features: string[]
  popular?: boolean
}

export interface Coupon {
  id: string
  code: string
  discount_percent: number
  max_uses: number
  current_uses: number
  expires_at: string
  is_active: boolean
}

export interface SystemLog {
  id: string
  level: string
  action: string
  message?: string
  user_id?: string
  ip_address?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface FeatureFlag {
  id: string
  key: string
  label: string
  enabled: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface RateLimit {
  id: string
  plan: string
  max_daily_generations: number
  max_concurrent: number
  created_at: string
  updated_at: string
}

export interface AdminModel {
  id: string
  key: string
  name: string
  type: GenerationType
  provider: string
  enabled: boolean
  credit_cost: number
  created_at: string
}

export interface SavedPrompt {
  id: string
  user_id: string
  title: string
  prompt: string
  negative_prompt?: string
  type: GenerationType
  created_at: string
}

export type Currency = "USD" | "PKR"

export interface PurchaseRequest {
  type: "subscription" | "credits"
  planId?: PlanId
  packId?: string
  currency: Currency
}