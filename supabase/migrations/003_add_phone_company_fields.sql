-- ============================================
-- Migration: Add phone and company fields to user_profiles
-- Description: Adds phone and company columns for user profile information
-- Date: 2025-11-02
-- ============================================

-- Add phone column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add company column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS company TEXT;

-- Add comment to columns
COMMENT ON COLUMN user_profiles.phone IS 'User phone number with optional formatting';
COMMENT ON COLUMN user_profiles.company IS 'Company name (optional)';
