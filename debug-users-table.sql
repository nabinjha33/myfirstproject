-- Debug the users table structure to understand the ID issue
-- This will help us see exactly what's wrong with the ID column

-- 1. Check the users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if there are any constraints on the ID column
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'users' 
AND tc.table_schema = 'public';

-- 3. Check if ID column has a sequence (auto-increment)
SELECT 
    schemaname,
    tablename,
    attname,
    adsrc
FROM pg_attrdef 
JOIN pg_attribute ON pg_attrdef.adrelid = pg_attribute.attrelid 
    AND pg_attrdef.adnum = pg_attribute.attnum
JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE pg_class.relname = 'users' 
AND pg_namespace.nspname = 'public'
AND pg_attribute.attname = 'id';

-- 4. Check what type of ID system is being used
SELECT 
    c.column_name,
    c.data_type,
    c.column_default,
    CASE 
        WHEN c.column_default LIKE 'nextval%' THEN 'SERIAL/SEQUENCE'
        WHEN c.column_default LIKE 'uuid_generate%' THEN 'UUID'
        WHEN c.column_default LIKE 'gen_random_uuid%' THEN 'UUID'
        WHEN c.column_default IS NULL THEN 'NO DEFAULT'
        ELSE 'OTHER: ' || c.column_default
    END as id_type
FROM information_schema.columns c
WHERE c.table_name = 'users' 
AND c.table_schema = 'public'
AND c.column_name = 'id';

-- 5. Try to see what a successful insert would look like
-- (This shows us the exact format needed)
SELECT 'Sample of existing users (to see ID format):' as info;
SELECT id, email, full_name, role, created_at
FROM public.users 
LIMIT 3;

-- 6. Check if we can insert with explicit ID generation
-- Uncomment to test different ID generation methods:

/*
-- Test UUID generation (if your table uses UUIDs)
SELECT uuid_generate_v4() as test_uuid;

-- Test if we can insert with generated UUID
INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),  -- or gen_random_uuid()
    'test-debug@example.com',
    'Debug Test User',
    'user',
    NOW(),
    NOW()
);

-- Clean up test
DELETE FROM public.users WHERE email = 'test-debug@example.com';
*/
