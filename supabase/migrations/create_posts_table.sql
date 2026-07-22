-- ============================================================
-- Tạo bảng posts (Bài viết/Blog) cho CMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        JSONB NOT NULL DEFAULT '{"vi": "", "en": "", "ru": "", "zh": ""}',
  summary      JSONB DEFAULT '{"vi": "", "en": "", "ru": "", "zh": ""}',
  content      JSONB DEFAULT '{"vi": "", "en": "", "ru": "", "zh": ""}',
  cover_image  TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Tạo Policies bảo mật
-- Authenticated users (admin) có toàn quyền
CREATE POLICY "admins_all_posts" ON public.posts 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Khách vãng lai (anon) chỉ được xem bài viết đã xuất bản
CREATE POLICY "public_read_posts" ON public.posts 
  FOR SELECT TO anon 
  USING (is_published = true);

-- Tạo Indexes tăng tốc truy vấn
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts (is_published, published_at DESC);

-- Seed Data: Thêm một số bài viết mẫu
INSERT INTO public.posts (slug, title, summary, content, cover_image, is_published, published_at) VALUES
  (
    'le-hoi-kate-van-hoa-cham',
    '{"vi": "Lễ hội Katê - Nét đẹp văn hóa truyền thống của người Chăm", "en": "Kate Festival - Traditional Cultural Beauty of Cham People", "ru": "Фестиваль Катэ - традиционная культурная красота тямов", "zh": "卡特节 - 占族人的传统文化之美"}',
    '{"vi": "Lễ hội Katê là lễ hội dân gian thiêng liêng và đặc sắc nhất của người Chăm theo đạo Bà-la-môn, tưởng nhớ các vị thần và tổ tiên.", "en": "Kate Festival is the most sacred and unique folk festival of Brahman Cham people, remembering gods and ancestors.", "ru": "Фестиваль Катэ - самый священный и уникальный народный праздник тямов, посвященный богам и предкам.", "zh": "卡特节是婆罗门占族人最神圣、最独特的民间节日，用以祭 xd 神灵和祖先。"}',
    '{"vi": "<p>Lễ hội Katê (Mbang Katé) là lễ hội lớn nhất, có ý nghĩa nhất đối với người Chăm theo đạo Bà-la-môn (Ahier). Lễ hội thường được tổ chức vào khoảng tháng 7 theo lịch Chăm (khoảng tháng 10 Dương lịch) tại ba cụm tháp cổ kính: Tháp Po Klong Garai, Tháp Po Rome và đền thờ Po Inư Nagar.</p><p>Đây không chỉ là dịp để người Chăm tưởng nhớ các vị thần có công lớn với dân tộc như vua Po Klong Garai, Po Rome, mà còn là thời gian sum họp gia đình, cầu mong quốc thái dân an, mưa thuận gió hòa và mùa màng tươi tốt.</p><p>Trong không gian ngập tràn tiếng trống Ginăng, Baranưng và tiếng kèn Saranai réo rắt, các điệu múa quạt, múa mâm hoa của những thiếu nữ Chăm uyển chuyển tạo nên không khí lễ hội tưng bừng. Lễ hội Katê đã được công nhận là Di sản văn hóa phi vật thể quốc gia vào năm 2017, là tài sản quý báu cần được bảo tồn bền vững.</p>", "en": "<p>Kate Festival (Mbang Katé) is the largest and most significant festival for the Cham Brahman community. The festival is usually held in the 7th month of the Cham calendar (around October) at three ancient tower complexes: Po Klong Garai, Po Rome, and Po Inu Nagar temple.</p><p>This is not only an occasion to commemorate historical kings and gods who contributed greatly to the nation, but also a time for family reunions, wishing for peace, favorable weather, and rich harvests.</p><p>In the vibrant sounds of Ginang, Baranung drums, and Saranai oboe, the elegant fan dances by Cham girls create an immersive and festive atmosphere. Kate Festival was recognized as a National Intangible Cultural Heritage in 2017.</p>", "ru": "<p>Фестиваль Катэ (Мбанг Катэ) - крупнейший и наиболее значимый праздник для общины тямских брахманов. Фестиваль обычно проводится в 7-й месяц тямского календаря (около октября) в трех древних башенных комплексах: По Клонг Гарай, По Роме и храме По Ину Нагар.</p>", "zh": "<p>卡特节（Mbang Katé）是婆罗门占族人最大、最有意义的节日。该节日通常在占族历的 7 月（公历 10 月左右）在婆克朗加莱塔、婆罗美塔和婆那迦神庙这三个古老的塔群举行。</p>"}',
    '/images/culture-space.jpg',
    true,
    '2026-06-01T08:00:00Z'
  ),
  (
    'nghe-det-tho-cam-my-nghiep',
    '{"vi": "Làng dệt thổ cẩm Mỹ Nghiệp: Sợi chỉ nối liền quá khứ và hiện tại", "en": "My Nghiep Brocade Weaving Village: The Thread Connecting Past and Present", "ru": "Деревня ткачества парчи Ми Нгиеп: Нить, соединяющая прошлое и настоящее", "zh": "美业织锦村：连接过去与现在的线"}',
    '{"vi": "Khám phá nghệ thuật dệt tay thổ cẩm độc đáo được lưu giữ nguyên vẹn qua hàng thế kỷ tại làng nghề truyền thống Mỹ Nghiệp.", "en": "Discover the unique hand-woven brocade art preserved intact through centuries in the traditional My Nghiep village.", "ru": "Откройте для себя уникальное искусство ручного ткачества парчи, сохранившееся на протяжении веков в традиционной деревне Ми Нгиеп.", "zh": "探索在传统美业村中保存数百年完好无损的独特手工织锦艺术。"}',
    '{"vi": "<p>Nằm cách thành phố Phan Rang - Tháp Chàm khoảng 12km về phía Nam, làng Mỹ Nghiệp (tiếng Chăm gọi là Caklaing) là làng dệt thổ cẩm truyền thống lâu đời nhất của người Chăm tại Ninh Thuận. Nét đặc sắc nhất ở Mỹ Nghiệp chính là quy trình dệt thủ công hoàn toàn, nơi các nghệ nhân vẫn sử dụng những chiếc khung cửi gỗ thô sơ và tự tay nhuộm chỉ bằng các loại cây cỏ tự nhiên.</p><p>Mỗi tấm thổ cẩm dệt ra không chỉ đơn thuần là sản phẩm tiêu dùng mà còn là một tác phẩm nghệ thuật kể chuyện. Các hoa văn đặc trưng như hoa văn hình học, hoa văn động vật tượng trưng cho các triết lý về vũ trụ, đất trời và vị thần trong đời sống tâm linh của người Chăm.</p><p>Bảo tồn làng dệt Mỹ Nghiệp trong kỷ nguyên số không chỉ giúp duy trì sinh kế bền vững cho người dân bản địa, mà còn giúp gìn giữ một di sản văn hóa sống động của Việt Nam đến với du khách năm châu.</p>", "en": "<p>Located about 12km south of Phan Rang city, My Nghiep village (known as Caklaing in Cham) is the oldest traditional brocade weaving village in Ninh Thuan. The highlight of My Nghiep is the fully manual weaving process, where artisans still use rustic wooden looms and dye threads with natural materials.</p><p>Each woven piece is not just a consumer product, but a piece of art representing the worldview, cosmology, and spiritual values of the Cham people.</p>", "ru": "<p>Деревня Ми Нгиеп (по-тямски называемая Чаклайнг), расположенная примерно в 12 км к югу от города Фанранг-Тхапчам, является старейшей традиционной деревней ткачества парчи в провинции Ниньтхуан.</p>", "zh": "<p>美业村（占语称为Caklaing）位于藩朗-塔占市以南约12公里处，是宁顺省占族最古老的传统织锦村。</p>"}',
    '/images/hero-tower.jpg',
    true,
    '2026-06-05T09:30:00Z'
  )
ON CONFLICT (slug) DO NOTHING;
