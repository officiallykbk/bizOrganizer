/*
  # Add storage bucket and policies for receipt uploads
  
  1. Changes
    - Create receipts storage bucket
    - Add storage policies for authenticated users
    - Enable public access for viewing receipts
    
  2. Security
    - Only authenticated users can upload/modify receipts
    - Public read access for receipt URLs
*/

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create the receipts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies with proper owner checks
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

-- Add receipt_url column to cargo_jobs if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cargo_jobs' 
    AND column_name = 'receipt_url'
  ) THEN
    ALTER TABLE cargo_jobs ADD COLUMN receipt_url text;
  END IF;
END $$;