-- Add sub_nav column to pages table to store page-specific scroll-to-anchor menus
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS sub_nav JSONB DEFAULT '[]'::jsonb;

-- Seed sub_nav menu items for Home page
UPDATE public.pages SET sub_nav = '[
  {"anchor": "hero", "label": {"vi": "Về đầu trang", "en": "Home"}},
  {"anchor": "khong-gian", "label": {"vi": "Không gian", "en": "Space"}},
  {"anchor": "thap-cham", "label": {"vi": "Tháp Chăm", "en": "Cham Towers"}},
  {"anchor": "di-san", "label": {"vi": "Di sản", "en": "Heritage"}},
  {"anchor": "hanh-trinh", "label": {"vi": "Hành trình", "en": "Journeys"}},
  {"anchor": "video", "label": {"vi": "Video", "en": "Videos"}}
]'::jsonb WHERE slug = 'home';

-- Seed sub_nav menu items for Ponagar page
UPDATE public.pages SET sub_nav = '[
  {"anchor": "ponagar-tong-quan", "label": {"vi": "Tổng quan", "en": "Overview"}},
  {"anchor": "ponagar-nu-than", "label": {"vi": "Nữ thần", "en": "Goddess"}},
  {"anchor": "ponagar-hanh-trinh", "label": {"vi": "Hành trình", "en": "Journey"}},
  {"anchor": "ponagar-thap-chinh", "label": {"vi": "Tháp chính", "en": "Main Tower"}},
  {"anchor": "ponagar-le-hoi", "label": {"vi": "Lễ hội", "en": "Festival"}}
]'::jsonb WHERE slug = 'ponagar';

-- Seed sub_nav menu items for Hoa Lai page
UPDATE public.pages SET sub_nav = '[
  {"anchor": "hoalai-tong-quan", "label": {"vi": "Tổng quan", "en": "Overview"}},
  {"anchor": "hoalai-lich-su", "label": {"vi": "Lịch sử", "en": "History"}},
  {"anchor": "hoalai-ba-thap", "label": {"vi": "Ba tháp", "en": "Three Towers"}},
  {"anchor": "hoalai-hoa-van", "label": {"vi": "Hoa văn", "en": "Patterns"}},
  {"anchor": "hoalai-bao-ton", "label": {"vi": "Bảo tồn", "en": "Preservation"}}
]'::jsonb WHERE slug = 'hoalai';

-- Seed sub_nav menu items for Po Klong Garai page
UPDATE public.pages SET sub_nav = '[
  {"anchor": "poklong-tong-quan", "label": {"vi": "Tổng quan", "en": "Overview"}},
  {"anchor": "poklong-vua-thieng", "label": {"vi": "Vua thiêng", "en": "Sacred King"}},
  {"anchor": "poklong-quan-the", "label": {"vi": "Quần thể", "en": "Complex"}},
  {"anchor": "poklong-kien-truc", "label": {"vi": "Kiến trúc", "en": "Architecture"}},
  {"anchor": "poklong-le-hoi", "label": {"vi": "Lễ hội", "en": "Festival"}}
]'::jsonb WHERE slug = 'poklong';

-- Seed sub_nav menu items for Po Rome page
UPDATE public.pages SET sub_nav = '[
  {"anchor": "porome-tong-quan", "label": {"vi": "Tổng quan", "en": "Overview"}},
  {"anchor": "porome-vi-vua", "label": {"vi": "Vị vua", "en": "The King"}},
  {"anchor": "porome-quan-the", "label": {"vi": "Quần thể", "en": "Complex"}},
  {"anchor": "porome-thap-chinh", "label": {"vi": "Tháp chính", "en": "Main Tower"}},
  {"anchor": "porome-le-hoi", "label": {"vi": "Lễ hội", "en": "Festival"}}
]'::jsonb WHERE slug = 'porome';
