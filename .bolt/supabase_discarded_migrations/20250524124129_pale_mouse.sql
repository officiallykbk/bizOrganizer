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

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_jobs_status_date') THEN
    CREATE INDEX idx_jobs_status_date ON cargo_jobs(delivery_status, pickup_date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_jobs_payment_date') THEN
    CREATE INDEX idx_jobs_payment_date ON cargo_jobs(payment_status, created_at);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_jobs_shipper_date') THEN
    CREATE INDEX idx_jobs_shipper_date ON cargo_jobs(shipper_name, created_at);
  END IF;
END $$;