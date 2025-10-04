-- CHECK CURRENT DATABASE SCHEMA
-- This script examines the actual database structure before making changes

-- ============================================================================
-- 1. CHECK USERS TABLE STRUCTURE
-- ============================================================================

SELECT 
    'USERS TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- 2. CHECK DEALER_APPLICATIONS TABLE STRUCTURE  
-- ============================================================================

SELECT 
    'DEALER_APPLICATIONS TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dealer_applications' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. CHECK AUTH.USERS TABLE STRUCTURE (Supabase auth table)
-- ============================================================================

SELECT 
    'AUTH.USERS TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- ============================================================================
-- 4. CHECK EXISTING CONSTRAINTS
-- ============================================================================

SELECT 
    'EXISTING CONSTRAINTS' as info,
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'dealer_applications')
ORDER BY table_name, constraint_type;

-- ============================================================================
-- 5. CHECK EXISTING INDEXES
-- ============================================================================

SELECT 
    'EXISTING INDEXES' as info,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'dealer_applications')
ORDER BY tablename;

-- ============================================================================
-- 6. CHECK EXISTING RLS POLICIES
-- ============================================================================

SELECT 
    'EXISTING RLS POLICIES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'dealer_applications')
ORDER BY tablename, policyname;

-- ============================================================================
-- 7. CHECK WHAT AUTH.UID() RETURNS
-- ============================================================================

SELECT 
    'AUTH.UID() TYPE CHECK' as info,
    pg_typeof(auth.uid()) as auth_uid_type,
    auth.uid() as current_auth_uid;

-- ============================================================================
-- 8. CHECK SAMPLE DATA TYPES
-- ============================================================================

-- Check actual data in users table
SELECT 
    'USERS SAMPLE DATA' as info,
    id,
    pg_typeof(id) as id_type,
    email,
    role,
    dealer_status
FROM public.users 
LIMIT 3;

-- Check actual data in dealer_applications table
SELECT 
    'DEALER_APPLICATIONS SAMPLE DATA' as info,
    id,
    pg_typeof(id) as id_type,
    email,
    status
FROM public.dealer_applications 
LIMIT 3;

-- ============================================================================
-- 9. CHECK IF TABLES ALREADY EXIST
-- ============================================================================

SELECT 
    'EXISTING TABLES' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 
    'dealer_applications', 
    'email_verification_logs', 
    'dealer_approval_logs'
)
ORDER BY table_name;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '📋 CURRENT DATABASE SCHEMA ANALYSIS COMPLETE';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Review the results above to understand:';
    RAISE NOTICE '   • Actual column types in users and dealer_applications tables';
    RAISE NOTICE '   • What type auth.uid() returns vs users.id type';
    RAISE NOTICE '   • Existing constraints and policies';
    RAISE NOTICE '   • Which tables already exist';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Use this information to create a proper update script';
    RAISE NOTICE '   that matches your actual database structure!';
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
END $$;
