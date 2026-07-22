-- ============================================================
-- Thêm cột google_maps_url vào bảng map_locations
-- ============================================================

ALTER TABLE public.map_locations 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
