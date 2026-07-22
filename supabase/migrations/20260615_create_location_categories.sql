-- ============================================================
-- Tạo bảng danh mục địa điểm di sản và liên kết với map_locations
-- Chạy câu lệnh này trong Supabase SQL Editor
-- ============================================================

-- ── 1. Tạo bảng: location_categories ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.location_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        JSONB NOT NULL DEFAULT '{"vi": "", "en": "", "ru": "", "zh": ""}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Thêm khóa ngoại vào bảng: map_locations ─────────────────────────
ALTER TABLE public.map_locations 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.location_categories(id) ON DELETE SET NULL;

-- ── 3. Bật Row Level Security (RLS) ──────────────────────────────────
ALTER TABLE public.location_categories ENABLE ROW LEVEL SECURITY;

-- ── 4. Tạo Policies cho RLS ──────────────────────────────────────────
-- Admins (authenticated) có toàn quyền
CREATE POLICY "admins_all_categories" ON public.location_categories 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Public (anon) có quyền đọc
CREATE POLICY "public_read_categories" ON public.location_categories 
  FOR SELECT TO anon 
  USING (true);
