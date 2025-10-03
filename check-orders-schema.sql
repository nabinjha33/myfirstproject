-- CHECK ACTUAL ORDERS TABLE SCHEMA
-- This will show us exactly what columns exist and their constraints

-- 1. Show all columns in orders table with their constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 2. Show NOT NULL constraints specifically
SELECT 
    column_name,
    is_nullable,
    CASE WHEN is_nullable = 'NO' THEN 'REQUIRED' ELSE 'OPTIONAL' END as requirement
FROM information_schema.columns 
WHERE table_name = 'orders' AND is_nullable = 'NO'
ORDER BY column_name;

-- 3. Show table constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'orders'
ORDER BY tc.constraint_type, ccu.column_name;

-- 4. Show current RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE WHEN rowsecurity THEN 'RLS ENABLED' ELSE 'RLS DISABLED' END as rls_status
FROM pg_tables 
WHERE tablename = 'orders';

-- 5. Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- 6. Show sample data structure (if any exists)
SELECT * FROM orders LIMIT 1;
