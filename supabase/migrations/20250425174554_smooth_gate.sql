/*
  # Fix job history schema and policies

  1. Changes
    - Modify job_history table to store JSON values properly
    - Update RLS policies to work with the auth.uid() function
    - Add proper indexes for performance
  
  2. Security
    - Maintains RLS
    - Ensures proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view history for their jobs" ON job_history;
DROP POLICY IF EXISTS "Users can insert history when they make the change" ON job_history;

-- Recreate the job_history table with proper column types
DROP TABLE IF EXISTS job_history;
CREATE TABLE job_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES cargo_jobs(id) ON DELETE CASCADE,
  field text NOT NULL,
  old_value jsonb,
  new_value jsonb NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;

-- Create proper policies
CREATE POLICY "Users can view history for their jobs"
  ON job_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cargo_jobs
      WHERE cargo_jobs.id = job_history.job_id
      AND cargo_jobs.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert history when they make the change"
  ON job_history
  FOR INSERT
  TO authenticated
  WITH CHECK (changed_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_job_history_job_id ON job_history(job_id);
CREATE INDEX idx_job_history_changed_by ON job_history(changed_by);
CREATE INDEX idx_job_history_changed_at ON job_history(changed_at);