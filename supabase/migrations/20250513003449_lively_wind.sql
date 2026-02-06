/*
  # Enhance database security and add constraints
  
  1. Changes
    - Add input validation constraints
    - Add additional security policies
    - Add proper indexes for performance
    
  2. Security
    - Add constraints for price ranges
    - Add validation for dates
    - Strengthen RLS policies
*/

-- Add constraints to cargo_jobs table
ALTER TABLE cargo_jobs
  ADD CONSTRAINT price_range 
    CHECK (agreed_price >= 0 AND agreed_price <= 1000000),
  ADD CONSTRAINT valid_dates 
    CHECK (
      pickup_date <= estimated_delivery_date AND
      (actual_delivery_date IS NULL OR actual_delivery_date >= pickup_date)
    ),
  ADD CONSTRAINT valid_status 
    CHECK (
      payment_status IN ('Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled') AND
      delivery_status IN ('Scheduled', 'In Transit', 'Delayed', 'Delivered', 'Cancelled')
    ),
  ADD CONSTRAINT valid_locations
    CHECK (pickup_location != dropoff_location);

-- Add constraints to job_history table
ALTER TABLE job_history
  ADD CONSTRAINT valid_field
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
      'notes'
    ));

-- Add additional security policies
CREATE POLICY "Prevent modification of delivered jobs"
  ON cargo_jobs
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    delivery_status != 'Delivered'
  );

CREATE POLICY "Prevent deletion of jobs with payments"
  ON cargo_jobs
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    payment_status = 'Pending'
  );

-- Add composite indexes for common query patterns
CREATE INDEX idx_jobs_status_date ON cargo_jobs(delivery_status, pickup_date);
CREATE INDEX idx_jobs_payment_date ON cargo_jobs(payment_status, created_at);
CREATE INDEX idx_jobs_shipper_date ON cargo_jobs(shipper_name, created_at);

-- Add function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cargo_jobs_updated_at
    BEFORE UPDATE ON cargo_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();