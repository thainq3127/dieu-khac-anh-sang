-- Add seo_image column to pages table to store page-specific SEO/OpenGraph sharing thumbnails
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS seo_image TEXT;
