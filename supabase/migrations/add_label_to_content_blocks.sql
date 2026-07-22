-- Add label column to content_blocks table to allow custom naming of blocks
ALTER TABLE public.content_blocks ADD COLUMN IF NOT EXISTS label TEXT DEFAULT NULL;
