-- Thiếu policy cho anon đọc content_blocks
-- Anon đã bị giới hạn bởi: chỉ query được blocks thuộc page is_published = true (qua query đầu tiên)
CREATE POLICY "public_read_blocks" ON public.content_blocks
  FOR SELECT TO anon
  USING (true);
