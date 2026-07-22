-- Create a public storage bucket named "media" for uploading images and assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) on storage.objects if not already enabled
-- Note: Supabase enables this by default, but it's good practice to declare.

-- Allow public read access (select) to the "media" bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'media' );

-- Allow authenticated admins full access (insert, update, delete) to the "media" bucket
CREATE POLICY "Admin Full Access"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'media' )
WITH CHECK ( bucket_id = 'media' );
