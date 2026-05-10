-- Create storage buckets for uploads and headshots
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('uploads', 'uploads', false),
  ('headshots', 'headshots', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own photos
CREATE POLICY "uploads_insert_own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read their own photos
CREATE POLICY "uploads_select_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own photos
CREATE POLICY "uploads_delete_own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to upload their own headshots
CREATE POLICY "headshots_insert_own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'headshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read their own headshots
CREATE POLICY "headshots_select_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'headshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own headshots
CREATE POLICY "headshots_delete_own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'headshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
