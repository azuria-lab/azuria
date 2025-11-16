-- Migration: Advanced Calculator History Table
-- Creates a new table to store advanced calculator entries with premium features

-- Create advanced_calculation_history table
CREATE TABLE IF NOT EXISTS advanced_calculation_history (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Basic inputs
  cost NUMERIC NOT NULL,
  target_margin NUMERIC NOT NULL,
  shipping NUMERIC DEFAULT 0,
  packaging NUMERIC DEFAULT 0,
  marketing NUMERIC DEFAULT 0,
  other_costs NUMERIC DEFAULT 0,
  
  -- Marketplace settings
  marketplace_id TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credit', 'debit', 'pix', 'boleto')),
  include_payment_fee BOOLEAN DEFAULT true,
  
  -- Results
  suggested_price NUMERIC NOT NULL,
  total_margin NUMERIC NOT NULL,
  net_profit NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  
  -- Premium features data (JSONB for flexibility)
  features JSONB,
  
  -- Metadata
  notes TEXT,
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_adv_calc_user_id ON advanced_calculation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_adv_calc_date ON advanced_calculation_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_adv_calc_marketplace ON advanced_calculation_history(marketplace_id);
CREATE INDEX IF NOT EXISTS idx_adv_calc_tags ON advanced_calculation_history USING GIN(tags);

-- Enable Row Level Security (RLS)
ALTER TABLE advanced_calculation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own calculations
CREATE POLICY "Users can view their own advanced calculations"
  ON advanced_calculation_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own calculations
CREATE POLICY "Users can insert their own advanced calculations"
  ON advanced_calculation_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own calculations
CREATE POLICY "Users can update their own advanced calculations"
  ON advanced_calculation_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own calculations
CREATE POLICY "Users can delete their own advanced calculations"
  ON advanced_calculation_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_advanced_calculation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER trigger_update_advanced_calculation_timestamp
  BEFORE UPDATE ON advanced_calculation_history
  FOR EACH ROW
  EXECUTE FUNCTION update_advanced_calculation_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON advanced_calculation_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON advanced_calculation_history TO service_role;

-- Comments for documentation
COMMENT ON TABLE advanced_calculation_history IS 'Stores calculation entries from the Advanced Calculator with premium features';
COMMENT ON COLUMN advanced_calculation_history.features IS 'JSONB field storing AI suggestions, ROI metrics, discounts, scenarios, etc.';
COMMENT ON COLUMN advanced_calculation_history.tags IS 'User-defined tags for organizing calculations';
