-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create the receipts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;

-- Create new policies with proper owner checks
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'receipts'
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

-- Create function to set owner on upload
CREATE OR REPLACE FUNCTION storage.handle_new_object()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the owner to the authenticated user
  NEW.owner = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set owner
DROP TRIGGER IF EXISTS set_object_owner ON storage.objects;
CREATE TRIGGER set_object_owner
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.handle_new_object();