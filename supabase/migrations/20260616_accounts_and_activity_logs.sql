-- ============================================================
-- Migration: Cập nhật thông tin tài khoản & Nhật ký hoạt động (Audit Logs)
-- ============================================================

-- 1. Thêm cột display_name và raw_password vào bảng public.profiles nếu chưa có
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS raw_password TEXT;

-- 2. Tạo bảng nhật ký hoạt động (activity_logs)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email   TEXT NOT NULL,
  action       TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  target_table TEXT NOT NULL,
  target_id    UUID,
  target_name  TEXT,
  old_data     JSONB,
  new_data     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS cho bảng activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Xóa policy cũ nếu có
DROP POLICY IF EXISTS "admin_select_logs" ON public.activity_logs;

-- Chỉ có Admin được phép xem nhật ký hoạt động
CREATE POLICY "admin_select_logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 3. Tạo hoặc thay thế trigger function để tự động ghi nhật ký
CREATE OR REPLACE FUNCTION public.log_activity_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_target_name TEXT := '';
  v_action TEXT;
BEGIN
  -- Lấy user ID từ context của Supabase auth
  v_user_id := auth.uid();
  
  -- Lấy email từ token JWT của Supabase
  BEGIN
    v_user_email := auth.jwt() ->> 'email';
  EXCEPTION WHEN OTHERS THEN
    v_user_email := NULL;
  END;

  -- Nếu không lấy được email từ JWT, truy vấn từ bảng profiles
  IF v_user_email IS NULL AND v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email FROM public.profiles WHERE id = v_user_id;
  END IF;

  v_action := TG_OP;

  -- Thiết lập thông tin tên đối tượng bị thay đổi để hiển thị dễ hiểu
  CASE TG_TABLE_NAME
    WHEN 'pages' THEN
      IF TG_OP = 'DELETE' THEN v_target_name := OLD.slug; ELSE v_target_name := NEW.slug; END IF;
    WHEN 'posts' THEN
      IF TG_OP = 'DELETE' THEN v_target_name := COALESCE(OLD.title->>'vi', OLD.slug); ELSE v_target_name := COALESCE(NEW.title->>'vi', NEW.slug); END IF;
    WHEN 'map_locations' THEN
      IF TG_OP = 'DELETE' THEN v_target_name := OLD.name->>'vi'; ELSE v_target_name := NEW.name->>'vi'; END IF;
    WHEN 'content_blocks' THEN
      IF TG_OP = 'DELETE' THEN v_target_name := OLD.block_type; ELSE v_target_name := NEW.block_type; END IF;
    WHEN 'profiles' THEN
      IF TG_OP = 'DELETE' THEN v_target_name := OLD.email; ELSE v_target_name := NEW.email; END IF;
    WHEN 'site_settings' THEN
      IF TG_OP = 'DELETE' THEN v_target_name := OLD.key; ELSE v_target_name := NEW.key; END IF;
    ELSE
      v_target_name := '';
  END CASE;

  -- Ghi log vào bảng activity_logs
  INSERT INTO public.activity_logs (
    user_id,
    user_email,
    action,
    target_table,
    target_id,
    target_name,
    old_data,
    new_data
  )
  VALUES (
    v_user_id,
    COALESCE(v_user_email, 'system'),
    v_action,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_TABLE_NAME = 'site_settings' THEN NULL
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    v_target_name,
    CASE TG_OP
      WHEN 'INSERT' THEN NULL
      ELSE to_jsonb(OLD)
    END,
    CASE TG_OP
      WHEN 'DELETE' THEN NULL
      ELSE to_jsonb(NEW)
    END
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Tạo các triggers tự động cho các bảng cốt lõi
DROP TRIGGER IF EXISTS log_pages_changes ON public.pages;
CREATE TRIGGER log_pages_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.log_activity_trigger();

DROP TRIGGER IF EXISTS log_content_blocks_changes ON public.content_blocks;
CREATE TRIGGER log_content_blocks_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.log_activity_trigger();

DROP TRIGGER IF EXISTS log_map_locations_changes ON public.map_locations;
CREATE TRIGGER log_map_locations_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.map_locations
  FOR EACH ROW EXECUTE FUNCTION public.log_activity_trigger();

DROP TRIGGER IF EXISTS log_posts_changes ON public.posts;
CREATE TRIGGER log_posts_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.log_activity_trigger();

DROP TRIGGER IF EXISTS log_profiles_changes ON public.profiles;
CREATE TRIGGER log_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_activity_trigger();

DROP TRIGGER IF EXISTS log_site_settings_changes ON public.site_settings;
CREATE TRIGGER log_site_settings_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.log_activity_trigger();
