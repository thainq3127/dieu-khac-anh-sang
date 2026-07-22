-- ============================================================
-- Phân quyền người dùng (RBAC) cho Văn Hoá Chăm CMS
-- Chạy file này trong Supabase SQL Editor
-- ============================================================

-- 1. Tạo bảng profiles liên kết với auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'edit')) DEFAULT 'edit',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security (RLS) cho bảng profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Tạo hàm helper kiểm tra người dùng có quyền admin không
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Tạo chính sách RLS cho bảng profiles
-- Người dùng tự xem profile của chính mình
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Quyền Admin được phép xem tất cả profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 4. Tạo trigger tự động thêm thông tin vào bảng profiles khi tạo user mới ở auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'edit')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Backfill profiles cho những người dùng hiện tại (nếu có)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'role', 'edit')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 6. Cập nhật RLS policies cho các bảng CMS hiện tại
-- Quyền Edit/Admin: được phép xem, thêm, sửa. Quyền Admin: được phép xoá.

-- 6.1. Bảng pages
DROP POLICY IF EXISTS "admins_all_pages" ON public.pages;

CREATE POLICY "authenticated_select_pages" ON public.pages FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_pages" ON public.pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_pages" ON public.pages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_pages"        ON public.pages FOR DELETE TO authenticated USING (public.is_admin());

-- 6.2. Bảng content_blocks
DROP POLICY IF EXISTS "admins_all_blocks" ON public.content_blocks;

CREATE POLICY "authenticated_select_blocks" ON public.content_blocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_blocks" ON public.content_blocks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_blocks" ON public.content_blocks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_blocks"        ON public.content_blocks FOR DELETE TO authenticated USING (public.is_admin());

-- 6.3. Bảng map_locations
DROP POLICY IF EXISTS "admins_all_map_locations" ON public.map_locations;

CREATE POLICY "authenticated_select_locations" ON public.map_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_locations" ON public.map_locations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_locations" ON public.map_locations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_locations"        ON public.map_locations FOR DELETE TO authenticated USING (public.is_admin());

-- 6.4. Bảng media
DROP POLICY IF EXISTS "admins_all_media" ON public.media;

CREATE POLICY "authenticated_select_media" ON public.media FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_media" ON public.media FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_media" ON public.media FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_media"        ON public.media FOR DELETE TO authenticated USING (public.is_admin());

-- 6.5. Bảng site_settings
DROP POLICY IF EXISTS "admins_all_settings" ON public.site_settings;

CREATE POLICY "authenticated_select_settings" ON public.site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_settings" ON public.site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_settings"        ON public.site_settings FOR DELETE TO authenticated USING (public.is_admin());

-- 6.6. Bảng posts
DROP POLICY IF EXISTS "admins_all_posts" ON public.posts;

CREATE POLICY "authenticated_select_posts" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_posts" ON public.posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_posts"        ON public.posts FOR DELETE TO authenticated USING (public.is_admin());

-- 7. Cập nhật RLS policies cho Storage Bucket "media"
DROP POLICY IF EXISTS "Admin Full Access" ON storage.objects;

CREATE POLICY "Authenticated Insert Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'media' );

CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'media' )
WITH CHECK ( bucket_id = 'media' );

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'media' AND public.is_admin() );
