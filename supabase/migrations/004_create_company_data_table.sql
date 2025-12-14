-- ============================================
-- Migration: Create Company Data Table
-- Description: Creates table for storing company information
-- Date: 2025-01-11
-- ============================================

-- Create company_data table
CREATE TABLE IF NOT EXISTS public.company_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_data_user_id ON public.company_data(user_id);

-- Enable RLS
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own company data"
  ON public.company_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company data"
  ON public.company_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company data"
  ON public.company_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company data"
  ON public.company_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE public.company_data IS 'Stores company information for each user';
COMMENT ON COLUMN public.company_data.data IS 'JSONB containing all company data fields';

