-- ============================================
-- Azuria App - Subscriptions Schema
-- ============================================
-- This schema manages user subscriptions and payment tracking
-- for Mercado Pago integration

-- ============================================
-- 1. SUBSCRIPTIONS TABLE
-- ============================================
-- Stores user subscription information
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription details
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'business')),
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled', 'past_due', 'pending')),
  
  -- Mercado Pago references
  mp_subscription_id TEXT UNIQUE, -- Mercado Pago preapproval ID
  mp_plan_id TEXT,                -- Mercado Pago plan ID
  
  -- Billing information
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE, -- When subscription will be cancelled
  cancelled_at TIMESTAMP WITH TIME ZONE, -- When cancellation was requested
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  UNIQUE(user_id) -- One subscription per user
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_subscription_id ON subscriptions(mp_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. PAYMENT HISTORY TABLE
-- ============================================
-- Stores payment transaction history
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Payment details
  mp_payment_id TEXT UNIQUE NOT NULL, -- Mercado Pago payment ID
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
  status_detail TEXT,
  
  -- Payment method
  payment_type TEXT, -- credit_card, debit_card, pix, boleto
  payment_method_id TEXT, -- visa, master, pix, etc.
  
  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_mp_payment_id ON payment_history(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_paid_at ON payment_history(paid_at);

-- Add updated_at trigger
CREATE TRIGGER update_payment_history_updated_at
  BEFORE UPDATE ON payment_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. USAGE TRACKING TABLE
-- ============================================
-- Tracks daily usage for free tier limits
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Usage data
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calculations_count INTEGER DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  exports_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one row per user per day
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_date ON usage_tracking(date);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date ON usage_tracking(user_id, date);

-- Add updated_at trigger
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own subscription (for cancellation)
CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role has full access"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Payment history policies
-- Users can read their own payment history
CREATE POLICY "Users can read own payment history"
  ON payment_history FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role has full payment history access"
  ON payment_history FOR ALL
  USING (auth.role() = 'service_role');

-- Usage tracking policies
-- Users can read their own usage
CREATE POLICY "Users can read own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update own usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role has full usage access"
  ON usage_tracking FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  plan TEXT,
  status TEXT,
  is_active BOOLEAN,
  current_period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.plan,
    s.status,
    s.status = 'active' AS is_active,
    s.current_period_end
  FROM subscriptions s
  WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can perform action based on plan
CREATE OR REPLACE FUNCTION can_user_perform_action(
  p_user_id UUID,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_status TEXT;
  v_usage_count INTEGER;
BEGIN
  -- Get user's subscription
  SELECT plan, status INTO v_plan, v_status
  FROM subscriptions
  WHERE user_id = p_user_id;
  
  -- Default to free plan if no subscription
  IF v_plan IS NULL THEN
    v_plan := 'free';
    v_status := 'active';
  END IF;
  
  -- Only active subscriptions can perform actions
  IF v_status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  -- PRO and BUSINESS plans have unlimited access
  IF v_plan IN ('pro', 'business') THEN
    RETURN TRUE;
  END IF;
  
  -- FREE plan has limits
  IF v_plan = 'free' THEN
    -- Check daily calculation limit (10 per day)
    IF p_action = 'calculate' THEN
      SELECT COALESCE(calculations_count, 0) INTO v_usage_count
      FROM usage_tracking
      WHERE user_id = p_user_id AND date = CURRENT_DATE;
      
      RETURN COALESCE(v_usage_count, 0) < 10;
    END IF;
    
    -- Free users cannot export
    IF p_action = 'export' THEN
      RETURN FALSE;
    END IF;
    
    -- Free users cannot use API
    IF p_action = 'api' THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_action TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Insert or update usage for today
  INSERT INTO usage_tracking (user_id, date, calculations_count, api_calls_count, exports_count)
  VALUES (
    p_user_id,
    CURRENT_DATE,
    CASE WHEN p_action = 'calculate' THEN 1 ELSE 0 END,
    CASE WHEN p_action = 'api' THEN 1 ELSE 0 END,
    CASE WHEN p_action = 'export' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    calculations_count = usage_tracking.calculations_count + CASE WHEN p_action = 'calculate' THEN 1 ELSE 0 END,
    api_calls_count = usage_tracking.api_calls_count + CASE WHEN p_action = 'api' THEN 1 ELSE 0 END,
    exports_count = usage_tracking.exports_count + CASE WHEN p_action = 'export' THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. INITIAL DATA
-- ============================================
-- Create free subscription for existing users without subscription
INSERT INTO subscriptions (user_id, plan, status)
SELECT 
  id,
  'free'::TEXT,
  'active'::TEXT
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 7. COMMENTS
-- ============================================
COMMENT ON TABLE subscriptions IS 'User subscription information and Mercado Pago integration';
COMMENT ON TABLE payment_history IS 'Complete payment transaction history';
COMMENT ON TABLE usage_tracking IS 'Daily usage tracking for free tier limits';
COMMENT ON FUNCTION get_user_subscription IS 'Get user''s current subscription details';
COMMENT ON FUNCTION can_user_perform_action IS 'Check if user can perform action based on their plan';
COMMENT ON FUNCTION increment_usage IS 'Increment usage counter for tracking limits';

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Run this script in your Supabase SQL editor
-- All tables, indexes, RLS policies, and functions will be created
