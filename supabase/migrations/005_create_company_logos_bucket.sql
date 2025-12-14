-- ============================================
-- Migration: Create Company Logos Storage Bucket
-- Description: Sets up storage bucket for company logos
-- Date: 2025-01-11
-- ============================================

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can upload their own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own company logos" ON storage.objects;

-- Set up storage policies for company-logos bucket
-- Allow authenticated users to upload logos
CREATE POLICY "Users can upload their own company logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

-- Allow public read access to logos
CREATE POLICY "Anyone can view company logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- Allow authenticated users to update logos
CREATE POLICY "Users can update their own company logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos');

-- Allow authenticated users to delete logos
CREATE POLICY "Users can delete their own company logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'company-logos');

