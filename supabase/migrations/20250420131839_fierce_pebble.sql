/*
  # Seed data for cargo tracking app

  This migration adds sample data to the cargo_jobs table for testing purposes.
*/

-- First create a test user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test User"}',
  false,
  'authenticated'
);

-- Insert sample cargo jobs
INSERT INTO cargo_jobs (
  shipper_name,
  payment_status,
  delivery_status,
  pickup_location,
  dropoff_location,
  intermediate_stops,
  pickup_date,
  estimated_delivery_date,
  actual_delivery_date,
  agreed_price,
  notes,
  created_by
)
VALUES
  (
    'Acme Logistics',
    'Paid',
    'Delivered',
    'CA',
    'TX',
    '[{"location": "AZ", "estimated_arrival": "2025-02-15", "notes": "Overnight stop"}]',
    '2025-02-12',
    '2025-02-18',
    '2025-02-18',
    2350.00,
    'Priority delivery, customer was satisfied',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'GlobalShip Inc',
    'Pending',
    'In Transit',
    'NY',
    'IL',
    '[]',
    '2025-03-01',
    '2025-03-05',
    NULL,
    1850.75,
    'Contains fragile items',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Swift Cargo',
    'Partial',
    'Delayed',
    'TX',
    'FL',
    '[{"location": "GA", "estimated_arrival": "2025-03-12", "notes": "Weather delay"}]',
    '2025-03-09',
    '2025-03-14',
    NULL,
    3200.00,
    'Delayed due to weather conditions in Georgia',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Acme Logistics',
    'Paid',
    'Delivered',
    'WA',
    'OR',
    '[]',
    '2025-02-28',
    '2025-03-02',
    '2025-03-01',
    975.50,
    'Expedited delivery',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'FastFreight Co',
    'Overdue',
    'Delivered',
    'MI',
    'OH',
    '[]',
    '2025-02-20',
    '2025-02-22',
    '2025-02-23',
    1125.00,
    'Payment is overdue, follow up required',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Coast2Coast Shipping',
    'Pending',
    'Scheduled',
    'CA',
    'NY',
    '[
      {"location": "NV", "estimated_arrival": "2025-03-16", "notes": "Fuel stop"},
      {"location": "CO", "estimated_arrival": "2025-03-18", "notes": "Driver change"},
      {"location": "IL", "estimated_arrival": "2025-03-20", "notes": "Maintenance check"}
    ]',
    '2025-03-15',
    '2025-03-22',
    NULL,
    4750.00,
    'Cross-country shipment with multiple stops',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Reliable Transport',
    'Paid',
    'Cancelled',
    'NC',
    'SC',
    '[]',
    '2025-02-25',
    '2025-02-26',
    NULL,
    550.00,
    'Cancelled by customer, full refund issued',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'GlobalShip Inc',
    'Paid',
    'Delivered',
    'AZ',
    'NM',
    '[]',
    '2025-03-03',
    '2025-03-05',
    '2025-03-04',
    890.25,
    'Delivered ahead of schedule',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Swift Cargo',
    'Pending',
    'In Transit',
    'FL',
    'GA',
    '[]',
    '2025-03-10',
    '2025-03-12',
    NULL,
    975.00,
    'Standard delivery',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'FastFreight Co',
    'Partial',
    'In Transit',
    'TX',
    'OK',
    '[]',
    '2025-03-08',
    '2025-03-11',
    NULL,
    1250.00,
    'Partial payment received, balance due on delivery',
    '00000000-0000-0000-0000-000000000000'
  );

-- Insert sample job history records
INSERT INTO job_history (
  job_id,
  field,
  old_value,
  new_value,
  changed_by
)
VALUES
  (
    (SELECT id FROM cargo_jobs WHERE shipper_name = 'Acme Logistics' AND pickup_location = 'CA' LIMIT 1),
    'delivery_status',
    '"In Transit"',
    '"Delivered"',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    (SELECT id FROM cargo_jobs WHERE shipper_name = 'Acme Logistics' AND pickup_location = 'CA' LIMIT 1),
    'actual_delivery_date',
    'null',
    '"2025-02-18"',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    (SELECT id FROM cargo_jobs WHERE shipper_name = 'Swift Cargo' AND pickup_location = 'TX' LIMIT 1),
    'delivery_status',
    '"In Transit"',
    '"Delayed"',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    (SELECT id FROM cargo_jobs WHERE shipper_name = 'Swift Cargo' AND pickup_location = 'TX' LIMIT 1),
    'notes',
    '"Standard delivery"',
    '"Delayed due to weather conditions in Georgia"',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    (SELECT id FROM cargo_jobs WHERE shipper_name = 'FastFreight Co' AND pickup_location = 'MI' LIMIT 1),
    'payment_status',
    '"Pending"',
    '"Overdue"',
    '00000000-0000-0000-0000-000000000000'
  );