-- Supabase Storage Setup for Images Bucket
-- Run this in your Supabase SQL Editor after creating the 'images' bucket

-- Enable public access to images (for Claude API to read them)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'ingredient-photos'
);

-- Allow public read access to images (so Claude can access them)
CREATE POLICY "Public read access to images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);