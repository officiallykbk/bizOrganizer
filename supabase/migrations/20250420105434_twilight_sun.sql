/*
  # Create initial schema for cargo tracking app

  1. New Tables
    - `cargo_jobs` - Main table for cargo transport jobs
    - `job_history` - Audit trail for edits to cargo jobs
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create cargo_jobs table
CREATE TABLE IF NOT EXISTS cargo_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_name text NOT NULL,
  payment_status text NOT NULL,
  delivery_status text NOT NULL,
  pickup_location text NOT NULL,
  dropoff_location text NOT NULL,
  intermediate_stops jsonb NULL,
  pickup_date timestamp with time zone NOT NULL,
  estimated_delivery_date timestamp with time zone NOT NULL,
  actual_delivery_date timestamp with time zone NULL,
  agreed_price numeric(10, 2) NOT NULL,
  notes text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL
);

-- Create job_history table for edit tracking
CREATE TABLE IF NOT EXISTS job_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES cargo_jobs NOT NULL,
  field text NOT NULL,
  old_value jsonb NULL,
  new_value jsonb NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  changed_by uuid REFERENCES auth.users NOT NULL
);

-- Enable Row Level Security
ALTER TABLE cargo_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;

-- Create policies for cargo_jobs
CREATE POLICY "Users can view their jobs"
  ON cargo_jobs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own jobs"
  ON cargo_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own jobs"
  ON cargo_jobs
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own jobs"
  ON cargo_jobs
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create policies for job_history
CREATE POLICY "Users can view history for their jobs"
  ON job_history
  FOR SELECT
  TO authenticated
  USING (
    job_id IN (
      SELECT id FROM cargo_jobs WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert history for their jobs"
  ON job_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    job_id IN (
      SELECT id FROM cargo_jobs WHERE created_by = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_cargo_jobs_created_by ON cargo_jobs(created_by);
CREATE INDEX idx_cargo_jobs_delivery_status ON cargo_jobs(delivery_status);
CREATE INDEX idx_cargo_jobs_payment_status ON cargo_jobs(payment_status);
CREATE INDEX idx_job_history_job_id ON job_history(job_id);