-- Fix the users table ID column to have proper UUID default
-- This should resolve the "null value in column id" error

-- First, check current state of the ID column
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name = 'id';

-- Check if uuid-ossp extension is enabled (needed for uuid_generate_v4)
SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
) as uuid_ossp_enabled;

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix the ID column to have UUID default
-- This will make new inserts automatically get a UUID if no ID is provided
DO $$
BEGIN
    -- Check if the ID column already has a default
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        AND column_name = 'id'
        AND column_default IS NOT NULL
    ) THEN
        -- Add UUID default to the ID column
        ALTER TABLE public.users 
        ALTER COLUMN id SET DEFAULT uuid_generate_v4();
        
        RAISE NOTICE '✅ Added UUID default to users.id column';
    ELSE
        RAISE NOTICE 'ℹ️  ID column already has a default value';
    END IF;
    
    -- Also ensure the column is properly typed as UUID if it isn't already
    -- (This is just informational, changing the type would be more complex)
    RAISE NOTICE 'Current ID column type: %', (
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        AND column_name = 'id'
    );
    
END $$;

-- Verify the fix
SELECT 
    'After fix - ID column info:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name = 'id';

-- Test that we can now insert without specifying ID
-- Uncomment to test:
/*
INSERT INTO public.users (
    email,
    full_name,
    role,
    created_at,
    updated_at
) VALUES (
    'test-uuid@example.com',
    'Test UUID User',
    'user',
    NOW(),
    NOW()
);

-- Verify the insert worked and got a UUID
SELECT id, email, full_name FROM public.users WHERE email = 'test-uuid@example.com';

-- Clean up test
DELETE FROM public.users WHERE email = 'test-uuid@example.com';
*/
