-- ============================================================
-- Văn Hoá Chăm – CMS Schema
-- Chạy file này trong Supabase SQL Editor
-- ============================================================

-- ── Bảng: pages ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  title       JSONB NOT NULL DEFAULT '{"vi": "", "en": "", "ru": "", "zh": ""}',
  description JSONB          DEFAULT '{"vi": "", "en": "", "ru": "", "zh": ""}',
  seo_image   TEXT,
  audio_url   TEXT,
  is_published BOOLEAN DEFAULT false,
  sort_order   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Bảng: content_blocks ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id    UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  content    JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Bảng: map_locations ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.map_locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            JSONB NOT NULL DEFAULT '{"vi": "", "en": ""}',
  description     JSONB          DEFAULT '{"vi": "", "en": ""}',
  lat             DECIMAL(10, 7) NOT NULL,
  lng             DECIMAL(11, 7) NOT NULL,
  icon_color      TEXT DEFAULT '#c8920c',
  sort_order      INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT true,
  google_maps_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Bảng: media ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename     TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  url          TEXT NOT NULL,
  alt_vi       TEXT,
  alt_en       TEXT,
  file_type    TEXT DEFAULT 'image',
  width        INTEGER,
  height       INTEGER,
  file_size    INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Bảng: site_settings ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.pages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_locations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings   ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admins) có toàn quyền
CREATE POLICY "admins_all_pages"          ON public.pages           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admins_all_blocks"         ON public.content_blocks  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admins_all_map_locations"  ON public.map_locations   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admins_all_media"          ON public.media           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admins_all_settings"       ON public.site_settings   FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public (anon) chỉ đọc dữ liệu đã xuất bản
CREATE POLICY "public_read_map_locations" ON public.map_locations   FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "public_read_pages"         ON public.pages           FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "public_read_blocks"        ON public.content_blocks  FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_site_settings" ON public.site_settings FOR SELECT TO anon USING (true);

-- ── Seed data: Pages ──────────────────────────────────────────
INSERT INTO public.pages (slug, title, is_published, sort_order) VALUES
  ('home',    '{"vi": "Trang chủ",   "en": "Home",          "ru": "Главная", "zh": "首页"}',   true, 1),
  ('ponagar', '{"vi": "Tháp Po Nagar","en": "Po Nagar Tower","ru": "Башня По Нагар","zh": "婆那迦塔"}', true, 2)
ON CONFLICT (slug) DO NOTHING;

-- ── Seed data: Map locations (7 di tích Chăm) ─────────────────
INSERT INTO public.map_locations (name, description, lat, lng, icon_color, sort_order) VALUES
  (
    '{"vi": "Tháp Po Nagar", "en": "Po Nagar Tower"}',
    '{"vi": "Di tích lịch sử Tháp Po Nagar, Nha Trang, Khánh Hoà", "en": "Po Nagar Tower historical site, Nha Trang, Khánh Hòa"}',
    12.2638, 109.1956, '#c8920c', 1
  ),
  (
    '{"vi": "Tháp Po Klong Garai", "en": "Po Klong Garai Tower"}',
    '{"vi": "Cụm tháp Chăm tại Phan Rang – Tháp Chàm, Ninh Thuận", "en": "Cham tower complex in Phan Rang – Tháp Chàm, Ninh Thuận"}',
    11.5602, 108.9914, '#c8920c', 2
  ),
  (
    '{"vi": "Tháp Po Rome", "en": "Po Rome Tower"}',
    '{"vi": "Tháp Chăm tại Ninh Phước, Ninh Thuận", "en": "Cham tower in Ninh Phuoc, Ninh Thuan"}',
    11.4839, 108.8765, '#c8920c', 3
  ),
  (
    '{"vi": "Tháp Bánh Ít", "en": "Banh It Tower"}',
    '{"vi": "Cụm tháp Chăm tại Tuy Phước, Bình Định", "en": "Cham tower complex in Tuy Phuoc, Binh Dinh"}',
    13.8566, 109.1126, '#b85030', 4
  ),
  (
    '{"vi": "Tháp Dương Long", "en": "Duong Long Tower"}',
    '{"vi": "Nhóm tháp Dương Long tại Tây Sơn, Bình Định", "en": "Duong Long tower group in Tay Son, Binh Dinh"}',
    13.9647, 108.9918, '#b85030', 5
  ),
  (
    '{"vi": "Tháp Po Sha Inư", "en": "Po Sha Inu Tower"}',
    '{"vi": "Cụm tháp Chăm tại Mũi Né, Bình Thuận", "en": "Cham tower complex in Mui Ne, Binh Thuan"}',
    10.9366, 108.1061, '#1b6b5d', 6
  ),
  (
    '{"vi": "Thánh địa Mỹ Sơn", "en": "My Son Sanctuary"}',
    '{"vi": "Thánh địa Mỹ Sơn – Di sản Thế giới UNESCO, Quảng Nam", "en": "My Son Sanctuary – UNESCO World Heritage Site, Quang Nam"}',
    15.7758, 108.1239, '#1b6b5d', 7
  )
ON CONFLICT DO NOTHING;

-- ── Seed data: Site settings ──────────────────────────────────
INSERT INTO public.site_settings (key, value) VALUES
  ('site_title',       '{"vi": "Văn Hóa Chăm", "en": "Cham Culture"}'),
  ('site_description', '{"vi": "Di sản văn hóa Chăm – Khánh Hoà", "en": "Cham Cultural Heritage – Khánh Hòa"}'),
  ('contact_email',    '"contact@vanhoacham.vn"'),
  ('social_links',     '{"facebook": "", "youtube": "", "instagram": ""}'),
  ('blog_settings',    '{"list_label": {"vi": "BÀI VIẾT & TƯ LIỆU", "en": "ARTICLES & DOCUMENTATION", "ru": "СТАТЬИ И ДОКУМЕНТЫ", "zh": "文章与文献"}, "list_title": {"vi": "Di sản văn hóa Chăm", "en": "Cham Cultural Heritage", "ru": "Культурное наследие Тям", "zh": "占婆文化遗产"}, "list_subtitle": {"vi": "Hành trình khám phá những câu chuyện, nghệ thuật và chiều sâu lịch sử Champa qua trang viết.", "en": "A journey through stories, art, and the historical depth of Champa through writing.", "ru": "Путешествие по страницам истории, искусства и глубоких традиций Тямпы.", "zh": "通过文字，开启一段探索占婆故事、艺术和深厚历史底蕴之旅。"}}')
ON CONFLICT (key) DO NOTHING;

-- ── Tạo admin user (chạy sau khi đã tạo user trong Supabase Auth) ──
-- Sau khi tạo user trong Authentication > Users, user đó có thể đăng nhập vào /admin/login
-- Không cần bảng admins riêng vì dùng Supabase Auth built-in

-- ── Indexes để tăng tốc truy vấn ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pages_slug            ON public.pages (slug);
CREATE INDEX IF NOT EXISTS idx_pages_published       ON public.pages (is_published);
CREATE INDEX IF NOT EXISTS idx_blocks_page_id        ON public.content_blocks (page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_map_published         ON public.map_locations (is_published, sort_order);
