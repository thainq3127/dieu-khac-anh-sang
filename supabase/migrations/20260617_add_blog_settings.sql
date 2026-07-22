-- Thêm cấu hình header blog vào bảng site_settings
INSERT INTO public.site_settings (key, value) VALUES
  ('blog_settings', '{"list_label": {"vi": "BÀI VIẾT & TƯ LIỆU", "en": "ARTICLES & DOCUMENTATION", "ru": "СТАТЬИ И ДОКУМЕНТЫ", "zh": "文章与文献"}, "list_title": {"vi": "Di sản văn hóa Chăm", "en": "Cham Cultural Heritage", "ru": "Культурное наследие Тям", "zh": "占婆文化遗产"}, "list_subtitle": {"vi": "Hành trình khám phá những câu chuyện, nghệ thuật và chiều sâu lịch sử Champa qua trang viết.", "en": "A journey through stories, art, and the historical depth of Champa through writing.", "ru": "Путешествие по страницам истории, искусства и глубоких традиций Тямпы.", "zh": "通过文字，开启一段探索占婆故事、艺术 and 深厚历史底蕴之旅。"}}')
ON CONFLICT (key) DO NOTHING;
