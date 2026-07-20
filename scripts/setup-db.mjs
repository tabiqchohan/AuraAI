import { readFileSync } from "fs"
import pg from "pg"
import { parse } from "dotenv"

const envContent = readFileSync(".env.local", "utf-8")
const env = parse(envContent)
const connectionString = env.SUPABASE_DATABASE_KEY

if (!connectionString) {
  console.error("SUPABASE_DATABASE_KEY not found in .env.local")
  process.exit(1)
}

const sql = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS generations (
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
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, generation_id)
);

-- Saved prompts table
CREATE TABLE IF NOT EXISTS saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  type TEXT CHECK (type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL,
  max_uses INTEGER DEFAULT 100,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can read all users" ON users;
CREATE POLICY "Admins can read all users" ON users FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
DROP POLICY IF EXISTS "Admins can update all users" ON users;
CREATE POLICY "Admins can update all users" ON users FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Users can read own generations" ON generations;
CREATE POLICY "Users can read own generations" ON generations FOR SELECT USING (auth.uid() = user_id OR is_public = true);
DROP POLICY IF EXISTS "Users can insert own generations" ON generations;
CREATE POLICY "Users can insert own generations" ON generations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own generations" ON generations;
CREATE POLICY "Users can update own generations" ON generations FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own generations" ON generations;
CREATE POLICY "Users can delete own generations" ON generations FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read likes" ON likes;
CREATE POLICY "Anyone can read likes" ON likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert likes" ON likes;
CREATE POLICY "Users can insert likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own prompts" ON saved_prompts;
CREATE POLICY "Users can read own prompts" ON saved_prompts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own prompts" ON saved_prompts;
CREATE POLICY "Users can insert own prompts" ON saved_prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own prompts" ON saved_prompts;
CREATE POLICY "Users can delete own prompts" ON saved_prompts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read coupons" ON coupons;
CREATE POLICY "Admins can read coupons" ON coupons FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
DROP POLICY IF EXISTS "Admins can insert coupons" ON coupons;
CREATE POLICY "Admins can insert coupons" ON coupons FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
DROP POLICY IF EXISTS "Admins can update coupons" ON coupons;
CREATE POLICY "Admins can update coupons" ON coupons FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
DROP POLICY IF EXISTS "Admins can delete coupons" ON coupons;
CREATE POLICY "Admins can delete coupons" ON coupons FOR DELETE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

-- Feedback policies
DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedback;
CREATE POLICY "Anyone can insert feedback" ON feedback FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can read feedback" ON feedback;
CREATE POLICY "Admins can read feedback" ON feedback FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`

async function main() {
  const client = new pg.Client({ connectionString })
  try {
    console.log("Connecting to Supabase database...")
    await client.connect()
    console.log("Connected! Running setup SQL...")
    await client.query(sql)
    console.log("Database schema created successfully! ✅")
  } catch (err) {
    console.error("Error:", err.message)
  } finally {
    await client.end()
  }
}

main()
