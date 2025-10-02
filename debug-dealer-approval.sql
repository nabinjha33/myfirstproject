-- DEBUG DEALER APPROVAL ISSUES
-- Run this to check what's happening with dealer approval

-- 1. Check if there are any pending dealer applications
SELECT 
    id, 
    business_name, 
    contact_person, 
    email, 
    status, 
    created_at
FROM dealer_applications 
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 2. Check current users table structure and data
SELECT 
    id, 
    email, 
    full_name, 
    role, 
    dealer_status, 
    business_name,
    created_at
FROM users 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if there are any RLS policy issues on dealer_applications table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'dealer_applications'
ORDER BY policyname;

-- 4. Check if there are any RLS policy issues on users table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 5. Test if we can manually update a dealer application
-- (Replace 'your-application-id' with an actual ID from step 1)
-- UPDATE dealer_applications 
-- SET status = 'approved', updated_at = NOW() 
-- WHERE id = 'your-application-id';

-- 6. Test if we can manually create a user
-- (This tests if the users table accepts inserts)
-- INSERT INTO users (
--     id, email, full_name, role, dealer_status, created_at, updated_at
-- ) VALUES (
--     'test-user-' || extract(epoch from now()), 
--     'test@example.com', 
--     'Test User', 
--     'dealer', 
--     'approved', 
--     NOW(), 
--     NOW()
-- );

-- 7. Check for any foreign key constraint issues
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND (tc.table_name = 'users' OR tc.table_name = 'dealer_applications')
ORDER BY tc.table_name;
