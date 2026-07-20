-- Add blocked column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked boolean DEFAULT false;

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL DEFAULT 'info',
  action TEXT NOT NULL,
  message TEXT,
  user_id UUID REFERENCES users(id),
  ip_address TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan TEXT NOT NULL UNIQUE,
  max_daily_generations INTEGER NOT NULL DEFAULT 50,
  max_concurrent INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  provider TEXT NOT NULL DEFAULT 'replicate',
  enabled BOOLEAN DEFAULT true,
  credit_cost INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default models
INSERT INTO models (key, name, type, provider, credit_cost) VALUES
  ('flux-schnell', 'Flux Schnell', 'image', 'replicate', 1),
  ('flux-pro', 'Flux Pro', 'image', 'replicate', 2),
  ('sdxl', 'SDXL', 'image', 'replicate', 1),
  ('wan', 'Wan Video', 'video', 'replicate', 5)
ON CONFLICT (key) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (key, label, enabled, description) VALUES
  ('video_generation', 'Video Generation', true, 'Enable video generation for all users'),
  ('referral_program', 'Referral Program', true, 'Enable referral credits'),
  ('public_gallery', 'Public Gallery', true, 'Show public gallery page'),
  ('coupon_system', 'Coupon System', true, 'Enable discount coupons')
ON CONFLICT (key) DO NOTHING;

-- Insert default rate limits
INSERT INTO rate_limits (plan, max_daily_generations, max_concurrent) VALUES
  ('free', 10, 1),
  ('basic', 50, 2),
  ('pro', 200, 5)
ON CONFLICT (plan) DO NOTHING;

-- Add flagged column to generations
ALTER TABLE generations ADD COLUMN IF NOT EXISTS flagged boolean DEFAULT false;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS flagged_reason TEXT;
