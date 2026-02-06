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

-- Create the receipts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('receipts', 'receipts')
ON CONFLICT (id) DO NOTHING;

-- Policy for uploading receipts
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'receipts');

-- Policy for updating receipts
CREATE POLICY "Authenticated users can update their receipts"
ON storage.objects FOR UPDATE TO authenticated 
WITH CHECK (bucket_id = 'receipts');

-- Policy for deleting receipts
CREATE POLICY "Authenticated users can delete their receipts"
ON storage.objects FOR DELETE TO authenticated 
WITH CHECK (bucket_id = 'receipts');

-- Policy for viewing receipts
CREATE POLICY "Receipts are publicly accessible"
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'receipts');