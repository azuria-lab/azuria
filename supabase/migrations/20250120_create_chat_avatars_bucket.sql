-- ============================================
-- Migration: Create Chat Avatars Storage Bucket
-- Description: Sets up storage bucket for chat room avatars
-- Date: 2025-01-20
-- ============================================

-- Create storage bucket for chat room avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-avatars',
  'chat-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can upload chat avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update chat avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete chat avatars" ON storage.objects;

-- Set up storage policies for chat-avatars bucket
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload chat avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-avatars');

-- Allow public read access to chat avatars
CREATE POLICY "Anyone can view chat avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-avatars');

-- Allow authenticated users to update chat avatars
CREATE POLICY "Users can update chat avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'chat-avatars');

-- Allow authenticated users to delete chat avatars
CREATE POLICY "Users can delete chat avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'chat-avatars');

