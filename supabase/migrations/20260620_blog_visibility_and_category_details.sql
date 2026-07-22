-- Add slug and description to post_categories
ALTER TABLE public.post_categories
  ADD COLUMN IF NOT EXISTS slug        TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS description JSONB DEFAULT '{"vi": "", "en": "", "ru": "", "zh": ""}';

-- Backfill slug from Vietnamese name for existing categories (fallback to id prefix)
UPDATE public.post_categories
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(id::text, '-.*', ''), '[^a-z0-9]', '', 'g'))
WHERE slug IS NULL;

-- Seed show_blog setting (default true = hiển thị)
INSERT INTO public.site_settings (key, value, updated_at)
VALUES ('show_blog', 'true'::jsonb, NOW())
ON CONFLICT (key) DO NOTHING;
