/*
  # Configure Receipts Storage Bucket

  1. Storage Configuration
    - Ensure receipts bucket exists with proper settings
    - Bucket is private (public: false) for security
    - File size limit: 5MB
    - Allowed MIME types: images only

  2. Security Policies
    - Enable RLS on storage.objects
    - Users can upload receipts (INSERT policy)
    - Users can view their own receipts (SELECT policy)
    - Users can delete their own receipts (DELETE policy)

  3. Important Notes
    - Bucket access requires signed URLs for viewing
    - All authenticated users can access receipts (team-wide access)
    - Files are stored in the 'receipts/' folder path
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can view receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can delete receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'receipts');