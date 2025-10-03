-- Debug script to check admin user status
-- Run this in your Supabase SQL editor

-- 1. Check if users table exists and has data
SELECT 'Users table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Check all users in the database
SELECT 'All users in database:' as info;
SELECT id, email, full_name, role, dealer_status, created_at 
FROM users 
ORDER BY created_at DESC;

-- 3. Check specifically for admin users
SELECT 'Admin users:' as info;
SELECT id, email, full_name, role, dealer_status 
FROM users 
WHERE role = 'admin';

-- 4. Check if your specific email exists
-- Replace 'your-admin-email@example.com' with your actual admin email
SELECT 'Checking specific admin email:' as info;
SELECT id, email, full_name, role, dealer_status 
FROM users 
WHERE email = 'admin@jeenmataimpex.com';  -- Replace with your email

-- 5. If no admin user exists, create one
-- Replace the email and name with your actual details
INSERT INTO users (id, email, full_name, role, dealer_status)
VALUES (
    'temp_admin_' || extract(epoch from now()),  -- Temporary ID
    'your-admin-email@example.com',              -- Replace with your email
    'Admin User',                                -- Replace with your name
    'admin',
    'approved'
) 
ON CONFLICT (email) DO UPDATE SET 
    role = 'admin',
    dealer_status = 'approved';

-- 6. Verify the admin user was created/updated
SELECT 'Final admin user check:' as info;
SELECT id, email, full_name, role, dealer_status 
FROM users 
WHERE role = 'admin';
