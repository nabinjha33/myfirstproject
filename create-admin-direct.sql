-- Direct SQL to create admin user in your existing database
-- Run this in your Supabase SQL editor

-- First, let's see the current table structure
-- \d users;

-- Method 1: If your users table has UUID id column, use this:
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  dealer_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),  -- This generates a random UUID
  'admin@jeenmataimpex.com',
  'Nabin Jha',
  'admin',
  'approved',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  dealer_status = 'approved',
  updated_at = NOW();

-- Method 2: If you want to use the Clerk ID directly, first modify the table:
-- ALTER TABLE users ALTER COLUMN id TYPE TEXT;
-- Then insert:
-- INSERT INTO users (
--   id,
--   email,
--   full_name,
--   role,
--   dealer_status,
--   created_at,
--   updated_at
-- ) VALUES (
--   'user_33T3dowUCXjQM6bCCHaPVu7azbN',
--   'admin@jeenmataimpex.com',
--   'Nabin Jha',
--   'admin',
--   'approved',
--   NOW(),
--   NOW()
-- );

-- After running this, you can login at /admin-login with:
-- Email: admin@jeenmataimpex.com
-- Password: (your Clerk password)

-- Check if the user was created:
SELECT id, email, full_name, role, dealer_status FROM users WHERE role = 'admin';
