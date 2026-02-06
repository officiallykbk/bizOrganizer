/*
  # Create initial schema for cargo tracking app

  1. New Tables
    - `cargo_jobs` - Main table for cargo transport jobs
    - `job_history` - Audit trail for edits to cargo jobs
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create cargo_jobs table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cargo_jobs') THEN
    CREATE TABLE cargo_jobs (
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
      receipt_url text NULL,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now(),
      created_by uuid REFERENCES auth.users NOT NULL
    );
  END IF;
END $$;