-- Set default padding to 'small' for all content blocks
-- Blocks with 'medium' padding (explicit or missing) are updated to 'small'

UPDATE public.content_blocks
SET
  content = jsonb_set(content, '{customPaddingSize}', '"small"', true),
  updated_at = NOW()
WHERE
  content->>'customPaddingSize' = 'medium'
  OR content->>'customPaddingSize' IS NULL;
