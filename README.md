# AuraAI - AI Image & Video Generation SaaS

A production-ready AI Image & Video Generation SaaS built with Next.js 15, Supabase, Stripe, and Replicate API.

## Features

- **AI Image Generation** - Generate stunning images from text prompts using Flux models
- **AI Video Generation** - Create videos from text descriptions
- **User Authentication** - Email/Password + Google OAuth via Supabase
- **Credit System** - 100 free credits on signup, deduct on every generation
- **Subscription Plans** - Free, Basic (₹499/mo), Pro (₹999/mo) with Stripe integration
- **Generation History** - View, download, and manage all your generations
- **Public Gallery** - Browse and like community generations
- **Saved Prompts** - Save and reuse your favorite prompts
- **Batch Generation** - Generate multiple variants at once
- **Aspect Ratios & Styles** - Multiple presets to choose from
- **Referral System** - Earn credits by inviting friends
- **Admin Panel** - Manage users, generations, and coupons
- **Dark Mode** - Beautiful dark theme throughout
- **Responsive Design** - Works on all devices

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Auth & Database:** Supabase (Auth + PostgreSQL)
- **Payments:** Stripe
- **AI:** Replicate API (Flux for images, Luma Ray for videos)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account
- Stripe account
- Replicate account

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd auraai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`

5. Set up Supabase:
   - Create a new project on Supabase
   - Run the following SQL in the SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  credits INTEGER DEFAULT 100,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_plan TEXT DEFAULT 'free',
  subscription_end_date TIMESTAMPTZ,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  total_generations INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generations table
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  model TEXT NOT NULL,
  output_url TEXT,
  output_urls JSONB DEFAULT '[]',
  credits_used INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  width INTEGER,
  height INTEGER,
  seed INTEGER,
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, generation_id)
);

-- Saved prompts table
CREATE TABLE saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  type TEXT CHECK (type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL,
  max_uses INTEGER DEFAULT 100,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all users" ON users FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update all users" ON users FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Users can read own generations" ON generations FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own generations" ON generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generations" ON generations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own generations" ON generations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can insert likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own prompts" ON saved_prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prompts" ON saved_prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own prompts" ON saved_prompts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can read coupons" ON coupons FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can insert coupons" ON coupons FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update coupons" ON coupons FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can delete coupons" ON coupons FOR DELETE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credits, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    100,
    upper(substr(md5(random()::text), 1, 6))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
