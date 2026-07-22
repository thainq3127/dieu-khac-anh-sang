-- Cho phép người dùng ẩn danh đọc site_settings
CREATE POLICY "public_read_site_settings"
  ON public.site_settings
  FOR SELECT
  TO anon
  USING (true);