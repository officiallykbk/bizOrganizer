-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create the receipts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;

-- Create new policies
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid() = owner
);

CREATE POLICY "Users can update own receipts"
ON storage.objects FOR UPDATE TO authenticated 
USING (
  bucket_id = 'receipts' AND
  auth.uid() = owner
);

CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE TO authenticated 
USING (
  bucket_id = 'receipts' AND
  auth.uid() = owner
);

CREATE POLICY "Anyone can view receipts"
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'receipts');