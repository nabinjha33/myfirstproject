-- Debug script to check dealer approval issues
-- Run this to see the current state of your database

-- 1. Check if clerk_user_id column exists in users table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check current users table structure
\d public.users;

-- 3. Check if there are any pending dealer applications
SELECT id, business_name, contact_person, email, status, created_at
FROM public.dealer_applications 
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check existing dealer users
SELECT id, email, full_name, business_name, role, dealer_status, clerk_user_id
FROM public.users 
WHERE role = 'dealer'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check for any constraint violations or issues
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- 6. Test if we can insert a sample dealer record (this will show the exact error)
-- Uncomment the lines below to test (replace with actual values)
/*
INSERT INTO public.users (
    clerk_user_id,
    email,
    full_name,
    business_name,
    role,
    dealer_status,
    created_at,
    updated_at
) VALUES (
    'test_clerk_id_123',
    'test@example.com',
    'Test User',
    'Test Business',
    'dealer',
    'approved',
    NOW(),
    NOW()
);
*/

-- 7. Check if the database update script was run
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'clerk_user_id'
    AND table_schema = 'public'
) as clerk_user_id_exists;

-- 8. Check if created_date/updated_date columns exist (from update script)
SELECT 
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_date') as created_date_exists,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_date') as updated_date_exists;
