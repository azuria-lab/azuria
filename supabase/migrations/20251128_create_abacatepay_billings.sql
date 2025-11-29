-- Migration: Create abacatepay_billings table
-- Description: Table to store Abacatepay billing information
-- Created: 2025-11-28

-- Create abacatepay_billings table
CREATE TABLE IF NOT EXISTS abacatepay_billings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  billing_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'annual')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'REFUNDED', 'EXPIRED')),
  payment_url TEXT NOT NULL,
  methods TEXT[] NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('ONE_TIME', 'MONTHLY', 'YEARLY')),
  metadata JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_abacatepay_billings_user_id 
  ON abacatepay_billings(user_id);

CREATE INDEX IF NOT EXISTS idx_abacatepay_billings_billing_id 
  ON abacatepay_billings(billing_id);

CREATE INDEX IF NOT EXISTS idx_abacatepay_billings_status 
  ON abacatepay_billings(status);

CREATE INDEX IF NOT EXISTS idx_abacatepay_billings_created_at 
  ON abacatepay_billings(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_abacatepay_billings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_abacatepay_billings_updated_at
  BEFORE UPDATE ON abacatepay_billings
  FOR EACH ROW
  EXECUTE FUNCTION update_abacatepay_billings_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE abacatepay_billings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own billings
CREATE POLICY "Users can view own billings"
  ON abacatepay_billings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own billings (via Edge Functions)
CREATE POLICY "Users can insert own billings"
  ON abacatepay_billings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only service role can update billings (webhooks)
CREATE POLICY "Service role can update billings"
  ON abacatepay_billings
  FOR UPDATE
  USING (true);

-- Add comment to table
COMMENT ON TABLE abacatepay_billings IS 'Stores Abacatepay billing/payment information for user subscriptions';

-- Add comments to columns
COMMENT ON COLUMN abacatepay_billings.billing_id IS 'Unique billing ID from Abacatepay (e.g., bill_12345667)';
COMMENT ON COLUMN abacatepay_billings.plan_id IS 'Plan identifier (essencial, pro, enterprise)';
COMMENT ON COLUMN abacatepay_billings.billing_interval IS 'Billing interval (monthly or annual)';
COMMENT ON COLUMN abacatepay_billings.amount IS 'Amount in cents (e.g., 5900 = R$ 59.00)';
COMMENT ON COLUMN abacatepay_billings.status IS 'Payment status (PENDING, PAID, REFUNDED, EXPIRED)';
COMMENT ON COLUMN abacatepay_billings.payment_url IS 'URL to Abacatepay payment page';
COMMENT ON COLUMN abacatepay_billings.methods IS 'Allowed payment methods (PIX, CARD)';
COMMENT ON COLUMN abacatepay_billings.frequency IS 'Billing frequency (ONE_TIME, MONTHLY, YEARLY)';
COMMENT ON COLUMN abacatepay_billings.metadata IS 'Additional metadata (devMode, externalId, etc.)';
COMMENT ON COLUMN abacatepay_billings.paid_at IS 'Timestamp when payment was confirmed';
