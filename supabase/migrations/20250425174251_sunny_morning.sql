/*
  # Fix job history RLS policies

  1. Changes
    - Drop existing INSERT policy on job_history table
    - Create new INSERT policy that checks changed_by instead of job ownership
    
  2. Security
    - Maintains RLS on job_history table
    - Allows users to insert history entries when they are the one making the change
    - Maintains existing SELECT policy for viewing history
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert history for their jobs" ON job_history;

-- Create new INSERT policy that checks changed_by instead of job ownership
CREATE POLICY "Users can insert history when they make the change"
  ON job_history
  FOR INSERT
  TO authenticated
  WITH CHECK (changed_by = auth.uid());