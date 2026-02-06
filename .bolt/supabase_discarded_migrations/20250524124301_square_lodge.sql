/*
  # Add constraints and job history tracking
  
  1. Changes
    - Add constraints to cargo_jobs
    - Create job_history table
    - Add indexes for performance
    
  2. Security
    - Maintain RLS
    - Add history tracking
*/

-- Create job_history table
CREATE TABLE IF NOT EXISTS job_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES cargo_jobs(id) ON DELETE CASCADE,
  field text NOT NULL,
  old_value jsonb NULL,
  new_value jsonb NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  changed_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS on job_history
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;

-- Add constraints to cargo_jobs table
ALTER TABLE cargo_jobs
  ADD CONSTRAINT IF NOT EXISTS price_range 
    CHECK (agreed_price >= 0 AND agreed_price <= 1000000),
  ADD CONSTRAINT IF NOT EXISTS valid_dates 
    CHECK (
      pickup_date <= estimated_delivery_date AND
      (actual_delivery_date IS NULL OR actual_delivery_date >= pickup_date)
    ),
  ADD CONSTRAINT IF NOT EXISTS valid_status 
    CHECK (
      payment_status IN ('Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled') AND
      delivery_status IN ('Scheduled', 'In Transit', 'Delayed', 'Delivered', 'Cancelled')
    ),
  ADD CONSTRAINT IF NOT EXISTS valid_locations
    CHECK (pickup_location != dropoff_location);

-- Add job_history constraints
ALTER TABLE job_history
  ADD CONSTRAINT IF NOT EXISTS valid_field
    CHECK (field IN (
      'shipper_name',
      'payment_status',
      'delivery_status',
      'pickup_location',
      'dropoff_location',
      'intermediate_stops',
      'pickup_date',
      'estimated_delivery_date',
      'actual_delivery_date',
      'agreed_price',
      'notes',
      'receipt_url'
    ));

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cargo_jobs_created_by') THEN
    CREATE INDEX idx_cargo_jobs_created_by ON cargo_jobs(created_by);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_jobs_status_date') THEN
    CREATE INDEX idx_jobs_status_date ON cargo_jobs(delivery_status, pickup_date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_jobs_payment_date') THEN
    CREATE INDEX idx_jobs_payment_date ON cargo_jobs(payment_status, created_at);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_jobs_shipper_date') THEN
    CREATE INDEX idx_jobs_shipper_date ON cargo_jobs(shipper_name, created_at);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_job_history_job_id') THEN
    CREATE INDEX idx_job_history_job_id ON job_history(job_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_job_history_changed_by') THEN
    CREATE INDEX idx_job_history_changed_by ON job_history(changed_by);
  END IF;
END $$;

-- Create policies for job_history
CREATE POLICY "Users can view history for their jobs"
  ON job_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cargo_jobs
      WHERE cargo_jobs.id = job_history.job_id
      AND cargo_jobs.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert history when they make the change"
  ON job_history FOR INSERT
  TO authenticated
  WITH CHECK (changed_by = auth.uid());