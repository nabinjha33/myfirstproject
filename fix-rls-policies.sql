-- Fix RLS policies to prevent infinite recursion
-- Run this in your Supabase SQL editor

-- First, drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Allow initial admin creation" ON users;

-- Temporarily disable RLS to allow API access
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Alternative: Create simple policies that don't cause recursion
-- Uncomment these if you want to re-enable RLS later with safer policies

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- -- Allow service role (API) to access all data
-- CREATE POLICY "Service role can access all users" ON users
--   FOR ALL USING (auth.role() = 'service_role');

-- -- Allow authenticated users to read their own data by email
-- CREATE POLICY "Users can read own data by email" ON users
--   FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- -- Allow authenticated users to update their own data by email  
-- CREATE POLICY "Users can update own data by email" ON users
--   FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Check if admin user exists
SELECT id, email, full_name, role, dealer_status 
FROM users 
WHERE email = 'admin@jeenmataimpex.com';

-- If no admin user exists, create one
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  dealer_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
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

-- Verify the admin user was created/updated
SELECT id, email, full_name, role, dealer_status 
FROM users 
WHERE email = 'admin@jeenmataimpex.com';
