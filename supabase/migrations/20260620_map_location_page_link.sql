-- Link map_locations to a page in the CMS
ALTER TABLE public.map_locations
  ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL;
