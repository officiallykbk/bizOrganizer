/*
  # Create and configure storage bucket with comprehensive policies
  
  1. Changes
    - Create receipts storage bucket
    - Set up storage policies for all operations
    - Configure owner tracking
    
  2. Security
    - Enable RLS
    - Public read access
    - Authenticated user access for modifications
*/

-- Create receipts bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public select for receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert for receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner update for receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner delete for receipts" ON storage.objects;

-- Create comprehensive policies
CREATE POLICY "Allow public select for receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');

CREATE POLICY "Allow authenticated insert for receipts"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow owner update for receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'receipts' AND
  owner = auth.uid()
);

CREATE POLICY "Allow owner delete for receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts' AND
  owner = auth.uid()
);

-- Create function to set owner on upload
CREATE OR REPLACE FUNCTION storage.set_owner()
RETURNS TRIGGER AS $$
BEGIN
  NEW.owner = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set owner
DROP TRIGGER IF EXISTS set_storage_owner ON storage.objects;
CREATE TRIGGER set_storage_owner
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.set_owner();