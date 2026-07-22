-- Create post_categories table
CREATE TABLE IF NOT EXISTS public.post_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       JSONB NOT NULL DEFAULT '{"vi": "", "en": "", "ru": "", "zh": ""}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add category_id to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.post_categories(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_all_post_categories" ON public.post_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_post_categories" ON public.post_categories FOR SELECT TO anon USING (true);
