-- Manual sync script for existing users who signed up but aren't in the database
-- This handles the case where Clerk webhooks weren't working properly

-- First, let's see what we have in the database
SELECT 'Current users in database:' as info;
SELECT id, email, full_name, role, dealer_status, clerk_user_id, created_at
FROM public.users 
ORDER BY created_at DESC;

-- Check pending dealer applications
SELECT 'Pending dealer applications:' as info;
SELECT id, business_name, contact_person, email, status, created_at
FROM public.dealer_applications 
WHERE status = 'pending'
ORDER BY created_at DESC;

-- For each pending application where the user doesn't exist in users table,
-- we need to create a user record. This is what the approval process expects.

-- Example: If you have a pending application for test@example.com but no user record,
-- you can manually create one like this:

/*
-- Replace with actual values from your pending applications
INSERT INTO public.users (
    email,
    full_name,
    role,
    dealer_status,
    created_at,
    updated_at
) VALUES (
    'dealer@example.com',  -- Email from dealer application
    'Dealer Name',         -- Contact person from application
    'user',               -- Default role (will be updated to 'dealer' on approval)
    'pending',            -- Status
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;  -- Don't create if already exists
*/

-- To help with the approval process, here's a query to generate INSERT statements
-- for all pending applications that don't have corresponding user records:

SELECT 
    'INSERT INTO public.users (email, full_name, role, dealer_status, created_at, updated_at) VALUES (' ||
    '''' || da.email || ''', ' ||
    '''' || da.contact_person || ''', ' ||
    '''user'', ''pending'', NOW(), NOW()) ON CONFLICT (email) DO NOTHING;' as insert_statement
FROM public.dealer_applications da
LEFT JOIN public.users u ON da.email = u.email
WHERE da.status = 'pending' 
AND u.email IS NULL;

-- After running the generated INSERT statements above, 
-- the approval process should work correctly.
