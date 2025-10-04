-- Fix RLS policies for dealer approval process
-- This adds missing INSERT policies for the users table

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity, hasrls 
FROM pg_tables 
LEFT JOIN (
    SELECT schemaname, tablename, 
           true as hasrls
    FROM pg_policies 
    GROUP BY schemaname, tablename
) p USING (schemaname, tablename)
WHERE schemaname = 'public' AND tablename = 'users';

-- Check existing policies on users table
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- Add missing INSERT policy for admins to create dealer records
DO $$
BEGIN
    -- Check if INSERT policy exists for users table
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
        AND cmd = 'INSERT'
    ) THEN
        -- Create INSERT policy for admins and system
        CREATE POLICY "Admins can create users" ON public.users 
        FOR INSERT WITH CHECK (
            -- Allow if user is admin or if it's a system operation (service role)
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE email = (auth.jwt() ->> 'email') AND role = 'admin'
            ) OR
            -- Allow service role (bypasses RLS anyway, but good to be explicit)
            auth.role() = 'service_role'
        );
        RAISE NOTICE '✅ INSERT policy created for users table';
    ELSE
        RAISE NOTICE 'ℹ️  INSERT policy already exists for users table';
    END IF;

    -- Also ensure there's an UPDATE policy for admins
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
        AND cmd = 'UPDATE'
        AND policyname LIKE '%admin%'
    ) THEN
        CREATE POLICY "Admins can update users" ON public.users 
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE email = (auth.jwt() ->> 'email') AND role = 'admin'
            ) OR
            auth.role() = 'service_role'
        );
        RAISE NOTICE '✅ Admin UPDATE policy created for users table';
    ELSE
        RAISE NOTICE 'ℹ️  Admin UPDATE policy already exists for users table';
    END IF;

END $$;

-- Verify the policies are in place
SELECT 'Current policies on users table:' as info;
SELECT policyname, cmd, 
       CASE 
           WHEN cmd = 'SELECT' THEN 'Read access'
           WHEN cmd = 'INSERT' THEN 'Create access' 
           WHEN cmd = 'UPDATE' THEN 'Update access'
           WHEN cmd = 'DELETE' THEN 'Delete access'
       END as description
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY cmd;

-- Test if we can insert (this should work with service role)
-- Uncomment to test:
/*
INSERT INTO public.users (
    email,
    full_name,
    role,
    dealer_status,
    created_at,
    updated_at
) VALUES (
    'test-rls@example.com',
    'Test RLS User',
    'dealer',
    'approved',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

-- Clean up test
DELETE FROM public.users WHERE email = 'test-rls@example.com';
*/
