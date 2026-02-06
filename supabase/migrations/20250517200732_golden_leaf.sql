/*
  # Add receipt photo upload support
  
  1. Changes
    - Add receipt_url column to cargo_jobs table
    - Update job_history valid fields
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add receipt_url column to cargo_jobs
ALTER TABLE cargo_jobs
  ADD COLUMN receipt_url text;

-- Update job_history valid field constraint
ALTER TABLE job_history
  DROP CONSTRAINT valid_field,
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
      'notes',
      'receipt_url'
    ));