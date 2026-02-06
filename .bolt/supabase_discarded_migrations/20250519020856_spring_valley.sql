/*
  # Fix storage bucket policies and enable RLS
  
  1. Changes
    - Enable RLS on storage.objects
    - Fix existing policies to properly handle auth.uid()
    - Add policy for viewing own receipts
    
  2. Security
    - Maintain public read access
    - Restrict upload/modify/delete to file owners
*/

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their receipts" ON storage.objects;
DROP POLICY IF EXISTS "Receipts are publicly accessible" ON storage.objects;

-- Create new policies with proper owner checks
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'receipts' AND
  owner = auth.uid()
);

CREATE POLICY "Users can update own receipts"
ON storage.objects FOR UPDATE TO authenticated 
USING (
  bucket_id = 'receipts' AND
  owner = auth.uid()
);

CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE TO authenticated 
USING (
  bucket_id = 'receipts' AND
  owner = auth.uid()
);

CREATE POLICY "Anyone can view receipts"
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'receipts');

-- Ensure owner is set on insert
CREATE OR REPLACE FUNCTION storage.set_owner()
RETURNS TRIGGER AS $$
BEGIN
  NEW.owner = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_storage_owner ON storage.objects;
CREATE TRIGGER set_storage_owner
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.set_owner();