-- Migration: User Marketplace Templates
-- Description: Store custom marketplace templates for each user
-- Author: Azuria Team
-- Date: 2025-11-03

-- Create user_marketplace_templates table
CREATE TABLE IF NOT EXISTS public.user_marketplace_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    marketplace_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    
    -- Configuration fields
    shipping DECIMAL(10, 2) DEFAULT 0,
    packaging DECIMAL(10, 2) DEFAULT 0,
    marketing DECIMAL(10, 2) DEFAULT 0,
    other_costs DECIMAL(10, 2) DEFAULT 0,
    payment_method TEXT DEFAULT 'credit_card',
    payment_fee DECIMAL(5, 2) DEFAULT 2.5,
    include_payment_fee BOOLEAN DEFAULT true,
    target_margin DECIMAL(5, 2) DEFAULT 30,
    
    -- Metadata
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique constraint per user and marketplace (for default templates)
    CONSTRAINT unique_user_marketplace_default UNIQUE NULLS NOT DISTINCT (user_id, marketplace_id, is_default)
);

-- Create index for faster queries
CREATE INDEX idx_user_marketplace_templates_user_id ON public.user_marketplace_templates(user_id);
CREATE INDEX idx_user_marketplace_templates_marketplace_id ON public.user_marketplace_templates(marketplace_id);
CREATE INDEX idx_user_marketplace_templates_default ON public.user_marketplace_templates(user_id, marketplace_id, is_default) WHERE is_default = true;

-- Enable Row Level Security
ALTER TABLE public.user_marketplace_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own templates
CREATE POLICY "Users can view their own templates"
    ON public.user_marketplace_templates
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own templates
CREATE POLICY "Users can create their own templates"
    ON public.user_marketplace_templates
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own templates
CREATE POLICY "Users can update their own templates"
    ON public.user_marketplace_templates
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own templates
CREATE POLICY "Users can delete their own templates"
    ON public.user_marketplace_templates
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_marketplace_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_marketplace_templates_timestamp
    BEFORE UPDATE ON public.user_marketplace_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_user_marketplace_templates_updated_at();

-- Function to ensure only one default template per user per marketplace
CREATE OR REPLACE FUNCTION ensure_single_default_template()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a new default, unset all other defaults for this user and marketplace
    IF NEW.is_default = true THEN
        UPDATE public.user_marketplace_templates
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND marketplace_id = NEW.marketplace_id
          AND id != NEW.id
          AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single default
CREATE TRIGGER enforce_single_default_template
    BEFORE INSERT OR UPDATE ON public.user_marketplace_templates
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION ensure_single_default_template();

-- Grant permissions
GRANT ALL ON public.user_marketplace_templates TO authenticated;
GRANT ALL ON public.user_marketplace_templates TO service_role;

-- Add helpful comment
COMMENT ON TABLE public.user_marketplace_templates IS 'Stores custom marketplace configuration templates for users to reuse across calculations';
