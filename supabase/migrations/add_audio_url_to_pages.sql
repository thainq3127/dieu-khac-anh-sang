-- Add audio_url column to pages table to store page-specific background audio track
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS audio_url TEXT;
